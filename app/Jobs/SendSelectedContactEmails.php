<?php

namespace App\Jobs;

use App\Mail\CustomPartyMemberEmail;
use App\Models\SentEmail;
use App\Models\SentEmailRecipient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendSelectedContactEmails implements ShouldQueue
{
    use Queueable;

    /**
     * @param array<int, string> $recipients
     */
    public function __construct(
        public string $subject,
        public string $message,
        public array $recipients,
        public ?int $sentEmailId = null
    ) {
        //
    }

    public function handle(): void
    {
        $sentEmail = $this->sentEmailId ? SentEmail::find($this->sentEmailId) : null;
        $sentEmail?->forceFill(['status' => 'sending'])->save();

        foreach ($this->recipients as $email) {
            $recipient = $sentEmail
                ? SentEmailRecipient::firstOrCreate(
                    ['sent_email_id' => $sentEmail->id, 'email' => $email],
                    ['status' => 'queued']
                )
                : null;

            try {
                Mail::to($email)->send(new CustomPartyMemberEmail(
                    $this->subject,
                    $this->message
                ));

                $recipient?->forceFill([
                    'status' => 'sent',
                    'error' => null,
                    'sent_at' => now(),
                ])->save();
            } catch (Throwable $exception) {
                $recipient?->forceFill([
                    'status' => 'failed',
                    'error' => $exception->getMessage(),
                ])->save();
            }
        }

        $sentEmail?->refreshDeliveryCounts();
    }
}
