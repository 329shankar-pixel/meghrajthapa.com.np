<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityPhoto extends Model
{
    /** @use HasFactory<\Database\Factories\ActivityPhotoFactory> */
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'photo_path',
    ];

    public function activity(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }
}
