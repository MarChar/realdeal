<?php

use App\Http\Controllers\Admin\PropertyController as AdminPropertyController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SitemapController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\PropertyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('dashboard');

    Route::get('users', [UserController::class, 'index'])->name('users');
    Route::get('users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('properties/crawl', [AdminPropertyController::class, 'crawl'])->name('properties.crawl');
    Route::post('properties/crawl', [AdminPropertyController::class, 'saveCrawl'])->name('properties.crawl.store');
    Route::get('properties', [AdminPropertyController::class, 'index'])->name('properties.index');
    Route::post('properties/recrawl', [AdminPropertyController::class, 'recrawl'])->name('properties.recrawl');
    Route::delete('properties/{property}', [AdminPropertyController::class, 'destroy'])->name('properties.destroy');

    Route::get('properties/sitemap', fn () => redirect()->route('admin.properties.crawl'));
    Route::post('properties/sitemap', [SitemapController::class, 'crawl'])->name('properties.sitemap.crawl');

    Route::get('settings', [SettingController::class, 'index'])->name('settings');
    Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
});

Route::post('/compare', [PropertyController::class, 'compare'])->name('property.compare');
Route::get('/property/{property}', [PropertyController::class, 'show'])->name('property.show');

Route::post('/search', [\App\Http\Controllers\SearchController::class, 'search'])->name('search');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
