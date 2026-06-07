<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PropertyScraper;
use App\Services\PropertyUrlParser;
use App\Services\SitemapParser;
use App\Models\Property;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class SitemapController extends Controller
{
    public function __construct(
        protected SitemapParser $sitemapParser,
        protected PropertyUrlParser $urlParser,
        protected PropertyScraper $scraper,
    ) {}

    public function index(): Response
    {
        return Inertia::render('admin/properties/sitemap');
    }

    public function crawl(Request $request): RedirectResponse
    {
        set_time_limit(0);

        $validated = $request->validate([
            'sitemap_url' => 'required|url',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        try {
            $urls = $this->sitemapParser->parse($validated['sitemap_url']);

            if (!empty($validated['limit'])) {
                $urls = array_slice($urls, 0, (int)$validated['limit']);
            }
        } catch (\Exception $e) {
            return redirect()->route('admin.properties.sitemap')
                ->with('error', 'Failed to parse sitemap: ' . $e->getMessage());
        }

        if (empty($urls)) {
            return redirect()->route('admin.properties.sitemap')
                ->with('error', 'No URLs found in sitemap.');
        }

        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        session_write_close();

        foreach ($urls as $url) {
            try {
                $existing = Property::where('source_url', $url)->first();

                if ($existing) {
                    $data = $this->scraper->scrape($url);
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
                        'type' => $data['type'],
                        'description' => $data['description'],
                        'image_urls' => $data['image_urls'],
                        'scraped_at' => now(),
                    ]);
                } else {
                    $parsed = $this->urlParser->parse($url);
                    $data = $this->scraper->scrape($url);

                    Property::create([
                        'source_url' => $url,
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
                        'type' => $data['type'],
                        'description' => $data['description'],
                        'image_urls' => $data['image_urls'],
                        'scraped_at' => now(),
                    ]);
                }

                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = basename($url) . ': ' . $e->getMessage();
                Log::error("Sitemap crawl failed for {$url}: " . $e->getMessage());
            }
        }

        $msg = "Crawled {$results['success']} properties from sitemap.";
        if ($results['failed'] > 0) {
            $msg .= " {$results['failed']} failed.\n" . implode("\n", array_slice($results['errors'], 0, 10));
            if (count($results['errors']) > 10) {
                $msg .= "\n...and " . (count($results['errors']) - 10) . " more errors.";
            }
        }

        session_start();

        return redirect()->route('admin.properties.sitemap')
            ->with(
                $results['failed'] > 0 && $results['success'] === 0 ? 'error' : 'success',
                $msg
            );
    }
}
