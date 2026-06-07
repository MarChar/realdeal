<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Support\Collection;

class SimilarityScoringEngine
{
    const WEIGHTS = [
        'price_per_sqm' => 0.35,
        'sqm' => 0.20,
        'year_built' => 0.15,
        'bedrooms' => 0.10,
        'bathrooms' => 0.10,
        'condition' => 0.05,
        'type' => 0.05,
    ];

    const SQM_TOLERANCE = 0.20;
    const YEAR_TOLERANCE = 5;

    const CONDITION_ORDER = [
        'new' => 0,
        'renovated' => 1,
        'good' => 2,
        'fair' => 3,
        'needs_work' => 4,
    ];

    public function findSimilar(Property $property, int $limit = 5): Collection
    {
        $candidates = $this->getCandidates($property);

        $scored = $candidates->map(fn (Property $candidate) => [
            'property' => $candidate,
            'similarity_score' => $this->score($property, $candidate),
        ]);

        $scored = $scored->filter(fn ($item) => $item['similarity_score'] > 0)
            ->sortByDesc('similarity_score')
            ->values()
            ->take($limit);

        return $scored;
    }

    public function score(Property $target, Property $candidate): float
    {
        $weights = self::WEIGHTS;
        $totalWeight = array_sum($weights);
        $score = 0;
        $usedWeight = 0;

        if ($target->price_per_sqm && $candidate->price_per_sqm && $target->price_per_sqm > 0) {
            $diff = abs($target->price_per_sqm - $candidate->price_per_sqm);
            $maxDiff = $target->price_per_sqm * self::SQM_TOLERANCE;
            $dimScore = $maxDiff > 0 ? max(0, 1 - ($diff / $maxDiff)) : 0;
            $score += $dimScore * $weights['price_per_sqm'];
            $usedWeight += $weights['price_per_sqm'];
        }

        if ($target->sqm && $candidate->sqm && $target->sqm > 0) {
            $diff = abs($target->sqm - $candidate->sqm);
            $maxDiff = $target->sqm * self::SQM_TOLERANCE;
            $dimScore = $maxDiff > 0 ? max(0, 1 - ($diff / $maxDiff)) : 0;
            $score += $dimScore * $weights['sqm'];
            $usedWeight += $weights['sqm'];
        }

        if ($target->year_built && $candidate->year_built) {
            $diff = abs($target->year_built - $candidate->year_built);
            $dimScore = max(0, 1 - ($diff / self::YEAR_TOLERANCE));
            $score += $dimScore * $weights['year_built'];
            $usedWeight += $weights['year_built'];
        }

        if ($target->bedrooms !== null && $candidate->bedrooms !== null) {
            $diff = abs($target->bedrooms - $candidate->bedrooms);
            $dimScore = match (true) {
                $diff === 0 => 1.0,
                $diff === 1 => 0.5,
                default => 0.0,
            };
            $score += $dimScore * $weights['bedrooms'];
            $usedWeight += $weights['bedrooms'];
        }

        if ($target->bathrooms !== null && $candidate->bathrooms !== null) {
            $diff = abs($target->bathrooms - $candidate->bathrooms);
            $dimScore = match (true) {
                $diff === 0 => 1.0,
                $diff === 1 => 0.5,
                default => 0.0,
            };
            $score += $dimScore * $weights['bathrooms'];
            $usedWeight += $weights['bathrooms'];
        }

        if ($target->condition && $candidate->condition
            && isset(self::CONDITION_ORDER[$target->condition])
            && isset(self::CONDITION_ORDER[$candidate->condition])) {
            $maxOrder = count(self::CONDITION_ORDER) - 1;
            $diff = abs(
                self::CONDITION_ORDER[$target->condition] - self::CONDITION_ORDER[$candidate->condition]
            );
            $dimScore = $maxOrder > 0 ? max(0, 1 - ($diff / $maxOrder)) : 0;
            $score += $dimScore * $weights['condition'];
            $usedWeight += $weights['condition'];
        }

        if ($target->type && $candidate->type) {
            $dimScore = strtolower($target->type) === strtolower($candidate->type) ? 1.0 : 0.0;
            $score += $dimScore * $weights['type'];
            $usedWeight += $weights['type'];
        }

        if ($usedWeight === 0) {
            return 0;
        }

        $normalized = ($score / $usedWeight) * $totalWeight;

        return round($normalized * 10, 1);
    }

    public function verdict(float $score): array
    {
        return match (true) {
            $score >= 7.5 => [
                'label' => 'Good Deal',
                'color' => 'green',
            ],
            $score >= 5.0 => [
                'label' => 'Fair Deal',
                'color' => 'amber',
            ],
            default => [
                'label' => 'Overpriced',
                'color' => 'red',
            ],
        };
    }

    protected function getCandidates(Property $property): Collection
    {
        $query = Property::where('id', '!=', $property->id);

        if ($property->city) {
            $query->where('city', $property->city);
        }

        if ($property->sqm) {
            $minSqm = $property->sqm * (1 - self::SQM_TOLERANCE);
            $maxSqm = $property->sqm * (1 + self::SQM_TOLERANCE);
            $query->whereBetween('sqm', [$minSqm, $maxSqm]);
        }

        if ($property->year_built) {
            $minYear = $property->year_built - self::YEAR_TOLERANCE;
            $maxYear = $property->year_built + self::YEAR_TOLERANCE;
            $query->whereBetween('year_built', [$minYear, $maxYear]);
        }

        if ($property->type) {
            $query->where('type', $property->type);
        }

        return $query->get();
    }
}
