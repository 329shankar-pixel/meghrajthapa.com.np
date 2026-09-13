<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Infographic extends Model
{
    protected $fillable = [
        'leader_id',
        'title',
        'photo',
        'description',
    ];

    public function leader()
    {
        return $this->belongsTo(Leader::class);
    }
}
