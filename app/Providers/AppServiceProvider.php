<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        try {
            $settings = Setting::whereIn('key', [
                'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password',
                'smtp_encryption', 'smtp_from_address', 'smtp_from_name',
                'twilio_sid', 'twilio_auth_token', 'twilio_from_number',
            ])->get()->pluck('value', 'key');

            if ($settings->get('smtp_host')) {
                Config::set('mail.mailers.smtp.host', $settings->get('smtp_host'));
                Config::set('mail.mailers.smtp.port', $settings->get('smtp_port'));
                Config::set('mail.mailers.smtp.username', $settings->get('smtp_username'));
                Config::set('mail.mailers.smtp.password', $settings->get('smtp_password'));
                Config::set('mail.mailers.smtp.encryption', $settings->get('smtp_encryption'));
                Config::set('mail.from.address', $settings->get('smtp_from_address'));
                Config::set('mail.from.name', $settings->get('smtp_from_name'));
            }

            if ($settings->get('twilio_sid')) {
                Config::set('services.twilio.sid', $settings->get('twilio_sid'));
                Config::set('services.twilio.auth_token', $settings->get('twilio_auth_token'));
                Config::set('services.twilio.from', $settings->get('twilio_from_number'));
            }
        } catch (\Exception $e) {
        }
    }
}
