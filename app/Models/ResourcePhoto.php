<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ResourcePhoto extends Model
{
    /** @use HasFactory<\Database\Factories\ResourcePhotoFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'resource_id',
        'photo_path',
    ];

    /**
     * @return BelongsTo<Resource, $this>
     */
    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }
}
