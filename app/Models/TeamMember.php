<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    /** @use HasFactory<\Database\Factories\TeamMemberFactory> */
    use HasFactory;

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'address',
        'message',
        'preferred_contact_method',
        'whatsapp_number',
        'whatsapp_url',
        'status',
        'email_notified_at',
        'notification_status',
        'submitted_ip',
        'user_agent',
    ];
}
