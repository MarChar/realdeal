<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Services\PropertyScraper;
use App\Services\PropertyUrlParser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function __construct(
        protected PropertyUrlParser $urlParser,
        protected PropertyScraper $scraper,
    ) {}

    public function index(): Response
    {
        $properties = Property::latest()->paginate(20);

        return Inertia::render('admin/properties', [
            'properties' => $properties,
        ]);
    }

    public function destroy(Property $property): RedirectResponse
    {
        $property->delete();

        return redirect()->route('admin.properties.index')
            ->with('error', 'Property deleted.');
    }

    public function crawl(): Response
    {
        return Inertia::render('admin/properties/crawl');
    }

    public function saveCrawl(Request $request): RedirectResponse
    {
        set_time_limit(120);

        $validated = $request->validate([
            'url' => 'required|url',
        ]);

        $url = $validated['url'];

        $existing = Property::where('source_url', $url)->first();
        if ($existing) {
            return redirect()->route('admin.properties.crawl')
                ->with('error', 'This property is already indexed.')
                ->with('existingProperty', $existing->id);
        }

        try {
            $parsed = $this->urlParser->parse($url);
            $data = $this->scraper->scrape($url);

            $property = Property::create([
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

            return redirect()->route('admin.properties.crawl')
                ->with('success', 'Property crawled and saved successfully!')
                ->with('savedProperty', $property->id);
        } catch (\Exception $e) {
            return redirect()->route('admin.properties.crawl')
                ->with('error', 'Failed to crawl: ' . $e->getMessage());
        }
    }

    public function recrawl(Request $request): RedirectResponse
    {
        set_time_limit(300);

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:properties,id',
        ]);

        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        foreach ($validated['ids'] as $id) {
            $property = Property::find($id);
            if (!$property) continue;

            try {
                $data = $this->scraper->scrape($property->source_url);

                $property->update([
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

                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = "ID {$id}: " . $e->getMessage();
            }
        }

        $msg = "Re-crawled {$results['success']} properties.";
        if ($results['failed'] > 0) {
            $msg .= " {$results['failed']} failed.\n" . implode("\n", array_slice($results['errors'], 0, 10));
            if (count($results['errors']) > 10) {
                $msg .= "\n...and " . (count($results['errors']) - 10) . " more errors.";
            }
        }

        return redirect()->route('admin.properties.index')
            ->with($results['failed'] > 0 ? 'error' : 'success', $msg);
    }
}
