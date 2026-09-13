<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaderCategory extends Model
{
    protected $fillable = ['leader_id', 'name'];

    public function leader()
    {
        return $this->belongsTo(Leader::class);
    }

    public function posts()
    {
        return $this->hasMany(LeaderPost::class, 'leader_category_id');
    }

    public function galleries()
    {
        return $this->hasMany(LeaderGallery::class, 'leader_category_id');
    }
}
