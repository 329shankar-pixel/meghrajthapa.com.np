<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CampaignSubmissionNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $mailSubject,
        public string $heading,
        public array $rows,
        public ?string $whatsappUrl = null,
        public ?string $intro = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->mailSubject);
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.campaign.submission-notification',
            with: [
                'heading' => $this->heading,
                'rows' => $this->rows,
                'whatsappUrl' => $this->whatsappUrl,
                'intro' => $this->intro,
            ],
        );
    }
}
