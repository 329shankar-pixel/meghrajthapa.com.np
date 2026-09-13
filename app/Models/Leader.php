<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leader extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'email',
        'phone',
        'slug',
        'image',
        'bio',
        'social_links',
    ];

    protected $casts = [
        'social_links' => 'array',
    ];

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    public function infographics()
    {
        return $this->hasMany(Infographic::class);
    }

    public function videos()
    {
        return $this->hasMany(LeaderVideo::class);
    }

    public function posts()
    {
        return $this->hasMany(LeaderPost::class);
    }
    
    public function galleries()
    {
        return $this->hasMany(LeaderGallery::class);
    }

    public function categories()
    {
        return $this->hasMany(LeaderCategory::class);
    }

    public function timelines()
    {
        return $this->hasMany(LeaderTimeline::class);
    }
}
