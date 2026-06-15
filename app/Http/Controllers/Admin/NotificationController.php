<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OutgoingNotification;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $notifications = OutgoingNotification::with('user')
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    public function show(OutgoingNotification $notification): Response
    {
        $notification->load('user');

        return Inertia::render('admin/notifications/show', [
            'notification' => $notification,
        ]);
    }

    public function resend(OutgoingNotification $notification): RedirectResponse
    {
        $notification->update([
            'status' => 'pending',
            'error_message' => null,
            'sent_at' => null,
        ]);

        return redirect()->route('admin.notifications.show', $notification)
            ->with('success', 'Notification queued for resend.');
    }
}
