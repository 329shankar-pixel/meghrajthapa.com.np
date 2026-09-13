<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SentEmail extends Model
{
    protected $fillable = [
        'user_id',
        'subject',
        'message',
        'source',
        'status',
        'recipient_count',
        'sent_count',
        'failed_count',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(SentEmailRecipient::class);
    }

    public function refreshDeliveryCounts(): void
    {
        $sentCount = $this->recipients()->where('status', 'sent')->count();
        $failedCount = $this->recipients()->where('status', 'failed')->count();
        $queuedCount = $this->recipients()->where('status', 'queued')->count();

        $this->forceFill([
            'sent_count' => $sentCount,
            'failed_count' => $failedCount,
            'status' => $queuedCount > 0 ? 'sending' : ($failedCount > 0 ? 'completed_with_errors' : 'sent'),
            'sent_at' => $queuedCount > 0 ? $this->sent_at : now(),
        ])->save();
    }
}
