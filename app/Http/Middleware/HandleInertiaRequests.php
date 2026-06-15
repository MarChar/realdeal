<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $contentSettings = Setting::where('key', 'like', 'content_%')->get()->pluck('value', 'key');

        $notifications = null;
        $unreadCount = 0;

        if ($request->user()) {
            $notifications = $request->user()
                ->notifications()
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($n) => [
                    'id' => $n->id,
                    'title' => $n->data['title'] ?? 'Notification',
                    'body' => $n->data['body'] ?? '',
                    'icon' => $n->data['icon'] ?? 'Bell',
                    'action_url' => $n->data['action_url'] ?? null,
                    'read_at' => $n->read_at,
                    'created_at' => $n->created_at,
                ]);

            $unreadCount = $request->user()->unreadNotifications()->count();
        }

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'error' => $request->session()->get('error'),
            'success' => $request->session()->get('success'),
            'searchResults' => $request->session()->get('searchResults'),
            'content' => $contentSettings,
            'notifications' => $notifications,
            'unread_notifications_count' => $unreadCount,
        ]);
    }
}
