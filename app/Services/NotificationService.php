<?php

namespace App\Services;

use App\Models\OutgoingNotification;
use App\Models\User;
use App\Notifications\WelcomeNotification;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    public function welcome(User $user): void
    {
        $user->notify(new WelcomeNotification);

        OutgoingNotification::create([
            'user_id' => $user->id,
            'type' => 'email',
            'channel' => 'welcome',
            'subject' => 'Welcome to RealDeal!',
            'body' => "Welcome {$user->name} to RealDeal! We are excited to have you on board.",
            'status' => 'pending',
        ]);
    }
}
