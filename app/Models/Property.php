<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = [
        'source_url',
        'source_website',
        'external_id',
        'title',
        'price',
        'currency',
        'sqm',
        'bedrooms',
        'bathrooms',
        'year_built',
        'condition',
        'city',
        'district',
        'purpose',
        'type',
        'description',
        'image_urls',
        'scraped_at',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sqm' => 'decimal:2',
            'image_urls' => 'array',
            'scraped_at' => 'datetime',
        ];
    }

    public function getPricePerSqmAttribute(): ?float
    {
        if ($this->price && $this->sqm && $this->sqm > 0) {
            return round($this->price / $this->sqm, 2);
        }
        return null;
    }
}
