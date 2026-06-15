<?php

use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PropertyController as AdminPropertyController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SitemapController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::patch('notifications/{id}/read', function ($id) {
        $user = request()->user();
        $notification = $user->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
        }
        return back();
    })->name('notifications.read');
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

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications');
    Route::get('notifications/{notification}', [NotificationController::class, 'show'])->name('notifications.show');
    Route::post('notifications/{notification}/resend', [NotificationController::class, 'resend'])->name('notifications.resend');
});

Route::post('/compare', [PropertyController::class, 'compare'])->name('property.compare');
Route::get('/property/{property}', [PropertyController::class, 'show'])->name('property.show');

Route::post('/search', [SearchController::class, 'search'])->name('search');
Route::get('/recent-searches', [SearchController::class, 'recentSearches'])->name('recent-searches');
Route::get('/recent-searches/{id}', [SearchController::class, 'getRecentSearch'])->name('recent-searches.show');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
