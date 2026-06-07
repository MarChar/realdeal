<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class PropertyScraper
{
    public function scrape(string $url): array
    {
        $apiKey = Setting::get('firecrawl_api_key', config('services.firecrawl.api_key'));

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])->timeout(60)->post('https://api.firecrawl.dev/v1/scrape', [
            'url' => $url,
            'formats' => [
                'markdown',
                [
                    'type' => 'json',
                    'schema' => [
                        'type' => 'object',
                        'properties' => [
                            'title' => ['type' => 'string'],
                            'price' => ['type' => 'number'],
                            'sqm' => ['type' => 'number'],
                            'bedrooms' => ['type' => 'integer'],
                            'bathrooms' => ['type' => 'integer'],
                            'year_built' => ['type' => 'integer'],
                            'condition' => ['type' => 'string'],
                            'purpose' => ['type' => 'string'],
                            'city' => ['type' => 'string'],
                            'district' => ['type' => 'string'],
                            'type' => ['type' => 'string'],
                            'description' => ['type' => 'string'],
                        ],
                    ],
                ],
            ],
            'onlyMainContent' => true,
            'proxy' => 'auto',
        ]);

        $result = $response->json();

        if (!($result['success'] ?? false)) {
            throw new \Exception($result['error'] ?? 'Firecrawl scrape failed');
        }

        $data = $result['data'] ?? [];
        $extracted = $data['json'] ?? [];
        $images = $this->extractImages($data['markdown'] ?? '');

        if (empty($images)) {
            $images = $data['metadata']['ogImage'] ?? $data['metadata']['twitterImage'] ?? [];
            if (is_string($images)) $images = [$images];
        }

        return [
            'title' => $extracted['title'] ?? $data['metadata']['title'] ?? null,
            'price' => is_numeric($extracted['price'] ?? false) ? (float)$extracted['price'] : null,
            'sqm' => is_numeric($extracted['sqm'] ?? false) ? (float)$extracted['sqm'] : null,
            'bedrooms' => is_numeric($extracted['bedrooms'] ?? false) ? (int)$extracted['bedrooms'] : null,
            'bathrooms' => is_numeric($extracted['bathrooms'] ?? false) ? (int)$extracted['bathrooms'] : null,
            'year_built' => is_numeric($extracted['year_built'] ?? false) ? (int)$extracted['year_built'] : null,
            'condition' => $extracted['condition'] ?? null,
            'city' => $extracted['city'] ?? null,
            'district' => $extracted['district'] ?? null,
            'purpose' => $extracted['purpose'] ?? null,
            'type' => $extracted['type'] ?? null,
            'description' => $extracted['description'] ?? null,
            'image_urls' => array_values(array_unique($images)),
        ];
    }

    protected function extractImages(string $markdown): array
    {
        preg_match_all('/!\[.*?\]\((https?:\/\/[^\s)]+)\)/i', $markdown, $m);
        return array_filter($m[1] ?? [], fn ($url) => preg_match('/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i', $url));
    }
}
