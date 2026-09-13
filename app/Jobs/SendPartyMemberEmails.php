<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendPartyMemberEmails implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $subject,
        public string $content,
        public array $filters = [],
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
        \App\Models\PartyMember::query()
            ->filter($this->filters)
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->chunk(100, function ($members) {
                foreach ($members as $member) {
                    \Illuminate\Support\Facades\Mail::to($member->email)
                        ->send(new \App\Mail\CustomPartyMemberEmail(
                            $this->subject,
                            $this->content,
                            $this->attachmentPath,
                            $this->attachmentName
                        ));
                }
            });

        if ($this->attachmentPath) {
            \Illuminate\Support\Facades\Storage::delete($this->attachmentPath);
        }
    }
}
