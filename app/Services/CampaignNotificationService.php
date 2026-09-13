<?php

namespace App\Services;

use App\Mail\CampaignSubmissionNotification;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class CampaignNotificationService
{
    public static function whatsappUrl(?string $phone, string $message): ?string
    {
        if (! $phone) {
            return null;
        }

        $normalized = preg_replace('/\D+/', '', $phone);

        if (! $normalized) {
            return null;
        }

        if (strlen($normalized) === 10 && str_starts_with($normalized, '9')) {
            $normalized = '977'.$normalized;
        }

        return 'https://wa.me/'.$normalized.'?text='.rawurlencode($message);
    }

    public static function notify(Model $record, string $type, array $rows, ?string $senderEmail = null, ?string $senderName = null, ?string $whatsappUrl = null): void
    {
        $partyName = Setting::get('party_name', config('app.name', 'Campaign'));
        $adminEmail = Setting::get('campaign_notification_email')
            ?: Setting::get('contact_email')
            ?: config('mail.from.address');

        $subject = "{$partyName}: New {$type}";
        $heading = "New {$type}";

        try {
            if ($adminEmail) {
                Mail::to($adminEmail)->send(new CampaignSubmissionNotification(
                    mailSubject: $subject,
                    heading: $heading,
                    rows: $rows,
                    whatsappUrl: $whatsappUrl,
                    intro: 'A new public website submission was received and is ready for campaign follow-up.',
                ));
            }

            if ($senderEmail) {
                Mail::to($senderEmail)->send(new CampaignSubmissionNotification(
                    mailSubject: "We received your {$type}",
                    heading: "Thank you, {$senderName}",
                    rows: $rows,
                    whatsappUrl: $whatsappUrl,
                    intro: "Thank you for contacting {$partyName}. The campaign team will review this information and follow up soon.",
                ));
            }

            $record->forceFill([
                'email_notified_at' => now(),
                'notification_status' => 'sent',
            ])->save();
        } catch (Throwable $exception) {
            Log::warning('Campaign notification failed', [
                'type' => $type,
                'record' => $record::class,
                'id' => $record->getKey(),
                'error' => $exception->getMessage(),
            ]);

            $record->forceFill(['notification_status' => 'failed'])->save();
        }
    }
}
