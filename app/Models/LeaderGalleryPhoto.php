<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaderGalleryPhoto extends Model
{
    protected $fillable = ['leader_gallery_id', 'photo_path'];

    public function gallery()
    {
        return $this->belongsTo(LeaderGallery::class, 'leader_gallery_id');
    }
}
