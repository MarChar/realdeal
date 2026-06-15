<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class WelcomeNotification extends Notification
{
    use Queueable;

    public function __construct()
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to RealDeal!')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Welcome to RealDeal. We are excited to have you on board.')
            ->line('Start exploring properties and find the best deals!')
            ->action('Visit Dashboard', url('/dashboard'))
            ->line('Thank you for joining us!');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Welcome to RealDeal!',
            'body' => 'Welcome ' . $notifiable->name . '! We are excited to have you on board.',
            'icon' => 'UserPlus',
            'action_url' => '/dashboard',
        ];
    }
}
