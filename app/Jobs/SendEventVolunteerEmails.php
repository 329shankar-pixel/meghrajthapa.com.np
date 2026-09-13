<?php

namespace App\Jobs;

use App\Mail\CustomVolunteerEmail;
use App\Models\Event;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class SendEventVolunteerEmails implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Event $event,
        public string $subject,
        public string $content,
        public ?string $attachmentPath = null,
        public ?string $attachmentName = null
    )
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->event->volunteers()
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->chunk(100, function ($volunteers) {
                foreach ($volunteers as $volunteer) {
                    Mail::to($volunteer->email)
                        ->send(new CustomVolunteerEmail(
                            $this->subject,
                            $this->content,
                            $this->attachmentPath,
                            $this->attachmentName
                        ));
                }
            });

        if ($this->attachmentPath) {
            Storage::delete($this->attachmentPath);
        }
    }
}
