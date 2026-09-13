<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaderGallery extends Model
{
    protected $fillable = ['leader_id', 'leader_category_id', 'title', 'description', 'cover_image'];

    public function leader()
    {
        return $this->belongsTo(Leader::class);
    }

    public function category()
    {
        return $this->belongsTo(LeaderCategory::class, 'leader_category_id');
    }

    public function photos()
    {
        return $this->hasMany(LeaderGalleryPhoto::class);
    }
}
