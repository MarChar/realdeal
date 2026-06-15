<?php

namespace App\Console\Commands;

use App\Models\OutgoingNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProcessNotifications extends Command
{
    protected $signature = 'notifications:process';
    protected $description = 'Process pending outgoing notifications';

    public function handle(): void
    {
        $pending = OutgoingNotification::where('status', 'pending')
            ->with('user')
            ->limit(50)
            ->get();

        $this->info("Processing {$pending->count()} pending notifications...");

        foreach ($pending as $notification) {
            try {
                if ($notification->type === 'email') {
                    $this->sendEmail($notification);
                } elseif ($notification->type === 'sms') {
                    $this->sendSms($notification);
                }

                $notification->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                $this->line("Sent {$notification->type} ({$notification->channel}) to user #{$notification->user_id}");
            } catch (\Exception $e) {
                $notification->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);

                Log::error("Failed to send notification #{$notification->id}: {$e->getMessage()}");
                $this->error("Failed notification #{$notification->id}: {$e->getMessage()}");
            }
        }
    }

    protected function sendEmail(OutgoingNotification $notification): void
    {
        $data = [
            'subject' => $notification->subject,
            'body' => $notification->body,
        ];

        Mail::send('emails.notification', $data, function ($message) use ($notification) {
            $message->to($notification->user->email)
                ->subject($notification->subject ?? 'Notification');
        });
    }

    protected function sendSms(OutgoingNotification $notification): void
    {
        $twilio = new \Twilio\Rest\Client(
            config('services.twilio.sid'),
            config('services.twilio.auth_token')
        );

        $twilio->messages->create(
            $notification->user->phone,
            [
                'from' => config('services.twilio.from'),
                'body' => $notification->body,
            ]
        );
    }
}
