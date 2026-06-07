<?php

namespace App\Jobs;

use App\Models\Property;
use App\Services\PropertyScraper;
use App\Services\PropertyUrlParser;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CrawlPropertyJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;

    public function __construct(
        public string $url,
        public ?int $existingPropertyId = null,
    ) {}

    public function handle(PropertyScraper $scraper, PropertyUrlParser $urlParser): void
    {
        $existing = $this->existingPropertyId
            ? Property::find($this->existingPropertyId)
            : Property::where('source_url', $this->url)->first();

        if ($existing) {
            $data = $scraper->scrape($this->url);
            $existing->update([
                'title' => $data['title'],
                'price' => $data['price'],
                'sqm' => $data['sqm'],
                'bedrooms' => $data['bedrooms'],
                'bathrooms' => $data['bathrooms'],
                'year_built' => $data['year_built'],
                'condition' => $data['condition'],
                'city' => $data['city'],
                'district' => $data['district'],
                'purpose' => $data['purpose'],
                'description' => $data['description'],
                'image_urls' => $data['image_urls'],
                'scraped_at' => now(),
            ]);
            Log::info("CrawlPropertyJob: Re-crawled existing property {$existing->id}");
            return;
        }

        $parsed = $urlParser->parse($this->url);
        $data = $scraper->scrape($this->url);

        Property::create([
            'source_url' => $this->url,
            'source_website' => $parsed['website'] ?? 'unknown',
            'external_id' => $parsed['external_id'] ?? null,
            'title' => $data['title'],
            'price' => $data['price'],
            'sqm' => $data['sqm'],
            'bedrooms' => $data['bedrooms'],
            'bathrooms' => $data['bathrooms'],
            'year_built' => $data['year_built'],
            'condition' => $data['condition'],
            'city' => $data['city'],
            'district' => $data['district'],
            'purpose' => $data['purpose'],
            'description' => $data['description'],
            'image_urls' => $data['image_urls'],
            'scraped_at' => now(),
        ]);

        Log::info("CrawlPropertyJob: Saved new property from {$this->url}");
    }

    public function failed(\Throwable $e): void
    {
        Log::error("CrawlPropertyJob failed for {$this->url}: " . $e->getMessage());
    }
}
