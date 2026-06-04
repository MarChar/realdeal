<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AnalyzeController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'url' => 'required|url',
        ]);

        $url = $validated['url'];

        try {
            $readerResponse = Http::withOptions(['verify' => false])
                ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->timeout(20)
                ->get('https://r.jina.ai/' . $url);

            $text = $readerResponse->body();

            preg_match_all('/!\[.*?\]\((https?:\/\/[^\s)]+)\)/', $text, $imgMatches);
            $images = $imgMatches[1] ?? [];

            $text = preg_replace('/\s+/', ' ', $text);
            $text = mb_substr($text, 0, 3000);

            $apiKey = config('services.groq.api_key');
            $prompt = "Extract the product title, description, price, condition, and main image URL from this webpage. Then rate the deal from 0-100 where 0=terrible price and 100=amazing bargain considering the product and condition, and give a short 1-sentence reason for the rating. Return ONLY valid JSON with keys: title, description, price, image, condition, rating, reason.\n\n{$text}";

            $response = Http::withOptions(['verify' => false])
                ->withToken($apiKey)
                ->timeout(30)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile',
                    'messages' => [['role' => 'user', 'content' => $prompt]],
                ]);

            $result = $response->json();

            if (isset($result['error'])) {
                throw new \Exception("Groq API: " . ($result['error']['message'] ?? 'Unknown error'));
            }

            $raw = $result['choices'][0]['message']['content'] ?? '{}';
            $raw = trim($raw);
            $raw = preg_replace('/^```(?:json)?\n?/i', '', $raw);
            $raw = preg_replace('/\n?```$/', '', $raw);
            $data = json_decode($raw, true) ?? [];

            $allImages = array_values(array_unique(array_filter($images)));
            $aiImage = $data['image'] ?? '';
            if ($aiImage && !in_array($aiImage, $allImages)) {
                array_unshift($allImages, $aiImage);
            }

            return back()->with('analysis', [
                'url' => $url,
                'title' => $data['title'] ?? 'N/A',
                'description' => $data['description'] ?? 'N/A',
                'price' => $data['price'] ?? 'N/A',
                'condition' => $data['condition'] ?? 'N/A',
                'rating' => $data['rating'] ?? null,
                'reason' => $data['reason'] ?? '',
                'images' => $allImages,
            ]);

        } catch (\Exception $e) {
            return back()->with('analysis', [
                'url' => $url,
                'title' => 'Error',
                'description' => 'Failed to analyze: ' . $e->getMessage(),
                'price' => 'N/A',
                'condition' => 'N/A',
                'rating' => null,
                'images' => [],
            ]);
        }
    }
}
