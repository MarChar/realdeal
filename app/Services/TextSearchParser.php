<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class TextSearchParser
{
    public function parse(string $text): array
    {
        $apiKey = Setting::get('gemini_api_key', config('services.gemini.api_key'));

        $prompt = <<<PROMPT
Extract property search criteria from this user's description. Return ONLY valid JSON.

User description:
{$text}

Extract these fields (use null if not mentioned):
{
  "query": "Brief summary of what the user is looking for",
  "type": "Property type: 'apartment', 'house', 'villa', 'office', 'land', or null",
  "purpose": "'sale' or 'rent' or null",
  "bedrooms_min": "minimum bedrooms as integer or null",
  "bedrooms_max": "maximum bedrooms as integer or null",
  "bathrooms_min": "minimum bathrooms as integer or null",
  "city": "city in Cyprus or null",
  "district": "district/area or null",
  "price_min": "minimum price in EUR as number or null",
  "price_max": "maximum price in EUR as number or null",
  "sqm_min": "minimum square meters as number or null",
  "sqm_max": "maximum square meters as number or null",
  "condition": "one of: 'new', 'renovated', 'good', 'fair', 'needs_work' or null",
  "year_built_min": "minimum year built as integer or null"
}

Rules:
- Return ONLY valid JSON, no other text
- Do not invent values that aren't implied by the text
- For prices, extract numeric values without currency symbols
PROMPT;

        $response = Http::withHeaders([
            'x-goog-api-key' => $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(30)->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', [
            'contents' => [
                ['parts' => [['text' => $prompt]]],
            ],
        ]);

        $result = $response->json();

        if (isset($result['error'])) {
            throw new \Exception("Gemini API: " . ($result['error']['message'] ?? 'Unknown error'));
        }

        $raw = $result['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
        $raw = trim($raw);
        $raw = preg_replace('/^```(?:json)?\n?/i', '', $raw);
        $raw = preg_replace('/\n?```$/', '', $raw);

        return json_decode($raw, true) ?? [];
    }
}
