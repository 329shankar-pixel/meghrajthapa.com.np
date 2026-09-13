<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resource extends Model
{
    /** @use HasFactory<\Database\Factories\ResourceFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'project_category',
        'urgency',
        'description',
        'estimated_budget',
        'beneficiaries',
        'province_id',
        'district_id',
        'municipality_id',
        'ward_number',
        'tole',
        'person_name',
        'person_email',
        'person_phone',
        'whatsapp_url',
        'email_notified_at',
        'notification_status',
        'submitted_ip',
        'user_agent',
        'is_bookmarked',
        'is_important',
        'bookmarked_at',
    ];

    protected function casts(): array
    {
        return [
            'is_bookmarked' => 'boolean',
            'is_important' => 'boolean',
            'bookmarked_at' => 'datetime',
            'email_notified_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<ResourcePhoto, $this>
     */
    public function photos(): HasMany
    {
        return $this->hasMany(ResourcePhoto::class);
    }
}
