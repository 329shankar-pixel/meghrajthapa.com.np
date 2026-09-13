<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartyMember extends Model
{
    /** @use HasFactory<\Database\Factories\PartyMemberFactory> */
    use HasFactory, SoftDeletes;

    /** @var list<string> */
    protected $fillable = [
        'full_name',
        'gender',
        'phone',
        'email',
        'occupation',
        'party_member_type_id',
        'date_of_birth',
        'joined_nc_at',
        'province_id',
        'district_id',
        'municipality_id',
        'ward_number',
        'tole',
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'tiktok_url',
        'linkedin_url',
        'address_type',
        'lives_abroad',
        'country',
        'permanent_province_id',
        'permanent_district_id',
        'permanent_municipality_id',
        'permanent_ward_number',
        'permanent_tole',
        'is_temp_same_as_perm',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'joined_nc_at' => 'date',
            'lives_abroad' => 'boolean',
            'is_temp_same_as_perm' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<PartyMemberType, $this>
     */
    public function partyMemberType(): BelongsTo
    {
        return $this->belongsTo(PartyMemberType::class);
    }

    /**
     * Scope a query to apply filters.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filters
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFilter($query, array $filters)
    {
        if (isset($filters['province_id']) && $filters['province_id'] !== '' && $filters['province_id'] !== 'all') {
            $query->where('province_id', $filters['province_id']);
        }
        if (isset($filters['district_id']) && $filters['district_id'] !== '' && $filters['district_id'] !== 'all') {
            $query->where('district_id', $filters['district_id']);
        }
        if (isset($filters['municipality_id']) && $filters['municipality_id'] !== '' && $filters['municipality_id'] !== 'all') {
            $query->where('municipality_id', $filters['municipality_id']);
        }
        if (isset($filters['ward_number']) && $filters['ward_number'] !== '' && $filters['ward_number'] !== 'all') {
            $query->where('ward_number', $filters['ward_number']);
        }
        if (isset($filters['party_member_type_id']) && $filters['party_member_type_id'] !== '' && $filters['party_member_type_id'] !== 'all') {
            $query->where('party_member_type_id', $filters['party_member_type_id']);
        }
        if (isset($filters['lives_abroad']) && $filters['lives_abroad'] !== '' && $filters['lives_abroad'] !== 'all') {
            $query->where('lives_abroad', $filters['lives_abroad'] === 'yes');
        }

        return $query;
    }
}
