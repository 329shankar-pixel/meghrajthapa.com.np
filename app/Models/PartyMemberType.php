<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartyMemberType extends Model
{
    /** @use HasFactory<\Database\Factories\PartyMemberTypeFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * @return HasMany<PartyMember, $this>
     */
    public function partyMembers(): HasMany
    {
        return $this->hasMany(PartyMember::class);
    }
}
