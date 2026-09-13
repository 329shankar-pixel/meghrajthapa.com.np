<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    protected $fillable = [
        'leader_id',
        'quote',
        'image',
    ];

    public function leader()
    {
        return $this->belongsTo(Leader::class);
    }
}
