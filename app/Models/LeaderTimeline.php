<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaderTimeline extends Model
{
    /** @use HasFactory<\Database\Factories\LeaderTimelineFactory> */
    use HasFactory;

    protected $fillable = [
        'leader_id',
        'title',
        'date',
        'photo',
    ];

    /**
     * Get the leader that owns the timeline.
     */
    public function leader(): BelongsTo
    {
        return $this->belongsTo(Leader::class);
    }
}
