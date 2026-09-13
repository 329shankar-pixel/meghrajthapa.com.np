<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaderVideo extends Model
{
    protected $fillable = ['leader_id', 'title', 'youtube_url'];

    public function leader()
    {
        return $this->belongsTo(Leader::class);
    }
}
