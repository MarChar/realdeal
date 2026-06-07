<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('source_url', 2048)->unique();
            $table->string('source_website', 50);
            $table->string('external_id', 100)->nullable();
            $table->string('title', 255)->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->string('currency', 3)->default('EUR');
            $table->decimal('sqm', 8, 2)->nullable();
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->unsignedTinyInteger('bathrooms')->nullable();
            $table->unsignedSmallInteger('year_built')->nullable();
            $table->string('condition', 30)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->text('description')->nullable();
            $table->json('image_urls')->nullable();
            $table->timestamp('scraped_at')->nullable();
            $table->timestamps();

            $table->index('source_website');
            $table->index('city');
            $table->index('sqm');
            $table->index('year_built');
            $table->index('price');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
