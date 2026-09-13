<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SentEmailRecipient extends Model
{
    protected $fillable = [
        'sent_email_id',
        'email',
        'status',
        'error',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }

    public function sentEmail(): BelongsTo
    {
        return $this->belongsTo(SentEmail::class);
    }
}
