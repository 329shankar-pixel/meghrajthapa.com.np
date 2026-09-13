<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Volunteer extends Model
{
    /** @use HasFactory<\Database\Factories\VolunteerFactory> */
    use HasFactory;

    protected $fillable = [
        'event_id',
        'full_name',
        'phone',
        'email',
        'province_id',
        'district_id',
        'municipality_id',
        'ward_number',
        'whatsapp_url',
        'email_notified_at',
        'notification_status',
        'submitted_ip',
        'user_agent',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
