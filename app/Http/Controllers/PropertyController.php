<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Services\SimilarityScoringEngine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function __construct(
        protected SimilarityScoringEngine $scoringEngine,
    ) {}

    public function compare(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'url' => 'required|url',
        ]);

        $property = Property::where('source_url', $validated['url'])->first();

        if (!$property) {
            return back()->with('error', 'This property has not been indexed yet. An admin can add it from the panel.');
        }

        return redirect()->route('property.show', $property);
    }

    const MIN_COMPARABLES_FOR_VERDICT = 3;

    public function show(Property $property): Response
    {
        $scored = $this->scoringEngine->findSimilar($property, 10);
        $top5 = $scored->take(5);

        $similars = $top5->map(fn ($item) => array_merge(
            $item['property']->toArray(),
            ['similarity_score' => $item['similarity_score']]
        ));

        $marketAvg = $this->calculateMarketAverages($property, $top5);

        $totalComparables = $this->scoringEngine->findSimilar($property)->count();

        $score = $top5->isNotEmpty()
            ? round($top5->avg('similarity_score'), 1)
            : 0;

        $isLimited = $totalComparables < self::MIN_COMPARABLES_FOR_VERDICT;

        if ($isLimited) {
            $verdictData = ['label' => 'Insufficient Data', 'color' => 'gray'];
            $reasons = ['Only ' . $totalComparables . ' comparable propert' . ($totalComparables === 1 ? 'y' : 'ies') . ' found. A minimum of ' . self::MIN_COMPARABLES_FOR_VERDICT . ' is needed for a reliable verdict.'];
        } else {
            $verdictData = $this->scoringEngine->verdict($score);
            $reasons = $this->generateReasons($property, $marketAvg, $score);
        }

        return Inertia::render('property/show', [
            'property' => array_merge($property->toArray(), [
                'price_per_sqm' => $property->price_per_sqm,
                'purpose' => $property->purpose,
            ]),
            'similars' => $similars,
            'marketAvg' => $marketAvg,
            'verdict' => [
                'label' => $verdictData['label'],
                'color' => $verdictData['color'],
                'score' => $score,
                'reasons' => $reasons,
            ],
            'stats' => [
                'total_comparable_count' => $property->city ? $totalComparables : 0,
                'pre_filter_criteria' => $property->city
                    ? '+20% size, same area'
                    : 'Limited data',
            ],
        ]);
    }

    protected function calculateMarketAverages(Property $property, \Illuminate\Support\Collection $scored): array
    {
        $properties = $scored->pluck('property');

        return [
            'price' => $properties->avg('price'),
            'price_per_sqm' => $properties->avg(fn ($p) => $p->price_per_sqm),
            'year_built' => $properties->avg('year_built'),
            'condition' => $this->averageCondition($properties),
        ];
    }

    protected function averageCondition(\Illuminate\Support\Collection $properties): string
    {
        $order = array_flip(SimilarityScoringEngine::CONDITION_ORDER);
        $values = $properties
            ->pluck('condition')
            ->filter(fn ($c) => $c && isset($order[$c]))
            ->map(fn ($c) => $order[$c]);

        if ($values->isEmpty()) {
            return 'N/A';
        }

        $avg = round($values->avg());
        $flipped = array_flip(SimilarityScoringEngine::CONDITION_ORDER);

        return $flipped[$avg] ?? 'N/A';
    }

    protected function generateReasons(Property $property, array $marketAvg, float $score): array
    {
        $reasons = [];

        if ($property->price && $marketAvg['price']) {
            $diff = $marketAvg['price'] - $property->price;
            $pct = $marketAvg['price'] > 0 ? round(($diff / $marketAvg['price']) * 100, 1) : 0;

            if ($diff > 0) {
                $reasons[] = '€' . number_format($diff) . ' below market average';
            } elseif ($diff < 0) {
                $reasons[] = '€' . number_format(abs($diff)) . ' above market average';
            } else {
                $reasons[] = 'Priced at market average';
            }
        }

        if ($property->price_per_sqm && $marketAvg['price_per_sqm']) {
            $diff = $marketAvg['price_per_sqm'] - $property->price_per_sqm;

            if ($diff > 0) {
                $reasons[] = '€' . number_format($diff, 2) . '/m² below average for the area';
            } elseif ($diff < 0) {
                $reasons[] = '€' . number_format(abs($diff), 2) . '/m² above average for the area';
            }
        }

        if ($property->year_built && $marketAvg['year_built']) {
            $yearDiff = $marketAvg['year_built'] - $property->year_built;
            if (abs($yearDiff) >= 1) {
                $dir = $yearDiff > 0 ? 'older' : 'newer';
                $reasons[] = abs(round($yearDiff)) . ' year(s) ' . $dir . ' than market average';
            }
        }

        if ($property->condition && $marketAvg['condition'] && $marketAvg['condition'] !== 'N/A') {
            $order = SimilarityScoringEngine::CONDITION_ORDER;
            $propLevel = $order[$property->condition] ?? null;
            $avgLevel = $order[$marketAvg['condition']] ?? null;

            if ($propLevel !== null && $avgLevel !== null) {
                if ($propLevel < $avgLevel) {
                    $reasons[] = 'Better condition than most comparable properties';
                } elseif ($propLevel > $avgLevel) {
                    $reasons[] = 'Worse condition than most comparable properties';
                }
            }
        }

        return $reasons;
    }
}
