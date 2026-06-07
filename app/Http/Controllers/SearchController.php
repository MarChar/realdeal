<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Services\TextSearchParser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __construct(
        protected TextSearchParser $parser,
    ) {}

    public function search(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'text' => 'required|string|min:3|max:2000',
        ]);

        try {
            $criteria = $this->parser->parse($validated['text']);

            $filters = [
                'purpose' => fn($q) => !empty($criteria['purpose']) ? $q->where('purpose', $criteria['purpose']) : $q,
                'city' => fn($q) => !empty($criteria['city']) ? $q->where('city', 'like', '%' . $criteria['city'] . '%') : $q,
                'bedrooms' => function ($q) use ($criteria) {
                    if (!empty($criteria['bedrooms_min'])) $q->where('bedrooms', '>=', (int)$criteria['bedrooms_min']);
                    if (!empty($criteria['bedrooms_max'])) $q->where('bedrooms', '<=', (int)$criteria['bedrooms_max']);
                    return $q;
                },
                'price' => function ($q) use ($criteria) {
                    if (!empty($criteria['price_min'])) $q->where('price', '>=', (float)$criteria['price_min']);
                    if (!empty($criteria['price_max'])) $q->where('price', '<=', (float)$criteria['price_max']);
                    return $q;
                },
                'sqm' => function ($q) use ($criteria) {
                    if (!empty($criteria['sqm_min'])) $q->where('sqm', '>=', (float)$criteria['sqm_min']);
                    if (!empty($criteria['sqm_max'])) $q->where('sqm', '<=', (float)$criteria['sqm_max']);
                    return $q;
                },
                'condition' => fn($q) => !empty($criteria['condition']) ? $q->where('condition', $criteria['condition']) : $q,
                'type' => fn($q) => !empty($criteria['type']) ? $q->where('type', $criteria['type']) : $q,
            ];

            $priority = ['city', 'price', 'bedrooms', 'sqm', 'condition', 'purpose', 'type'];

            $applied = [];
            $results = collect();

            for ($i = 0; $i <= count($priority); $i++) {
                $keep = array_slice($priority, 0, count($priority) - $i);
                $query = Property::query();

                foreach ($keep as $key) {
                    if (isset($filters[$key])) {
                        $filters[$key]($query);
                        $applied[$key] = $criteria[$key] ?? null;
                    }
                }

                $results = $query->latest()->take(20)->get();
                if ($results->count() > 0) {
                    break;
                }
                $applied = [];
            }

            if ($results->count() === 0) {
                $results = Property::latest()->take(20)->get();
            }

            $dropped = array_diff(array_keys($filters), array_keys($applied));
            $dropped = array_values(array_filter($dropped, fn($k) => !empty($criteria[$k])));

            return back()->with('searchResults', [
                'criteria' => $criteria,
                'results' => $results->toArray(),
                'count' => $results->count(),
                'applied_filters' => $applied,
                'dropped_filters' => $dropped,
            ]);

        } catch (\Exception $e) {
            return back()->with('searchResults', [
                'criteria' => ['query' => 'Could not parse your request'],
                'results' => [],
                'count' => 0,
                'error' => 'Failed to process: ' . $e->getMessage(),
                'applied_filters' => [],
                'dropped_filters' => [],
            ]);
        }
    }
}
