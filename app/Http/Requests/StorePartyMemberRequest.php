<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePartyMemberRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $livesAbroad = $this->boolean('lives_abroad');
        $isTempSameAsPerm = $this->boolean('is_temp_same_as_perm');

        $normalized = [
            'lives_abroad' => $livesAbroad,
            'is_temp_same_as_perm' => $isTempSameAsPerm,
        ];

        if ($livesAbroad) {
            $normalized = array_merge($normalized, [
                'province_id' => null,
                'district_id' => null,
                'municipality_id' => null,
                'ward_number' => null,
                'tole' => null,
            ]);
        } elseif ($isTempSameAsPerm) {
            $normalized = array_merge($normalized, [
                'province_id' => $this->input('permanent_province_id'),
                'district_id' => $this->input('permanent_district_id'),
                'municipality_id' => $this->input('permanent_municipality_id'),
                'ward_number' => $this->input('permanent_ward_number'),
                'tole' => $this->input('permanent_tole'),
                'country' => null,
            ]);
        } else {
            $normalized['country'] = null;
        }

        $this->merge($normalized);
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $memberId = $this->route('party_member');
        $livesAbroad = $this->boolean('lives_abroad');
        $isTempSameAsPerm = $this->boolean('is_temp_same_as_perm');

        return [
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'in:male,female,other'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'unique:party_members,email,'.($memberId->id ?? $memberId)],
            'occupation' => ['nullable', 'string', 'max:255'],
            'party_member_type_id' => ['required', 'exists:party_member_types,id'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'joined_nc_at' => ['nullable', 'date'],

            // Permanent Address (Always required and in Nepal)
            'permanent_province_id' => ['required', 'integer', 'min:1'],
            'permanent_district_id' => ['required', 'integer', 'min:1'],
            'permanent_municipality_id' => ['required', 'integer', 'min:1'],
            'permanent_ward_number' => ['required', 'integer', 'min:1', 'max:33'],
            'permanent_tole' => ['nullable', 'string', 'max:255'],

            // Link toggle
            'is_temp_same_as_perm' => ['required', 'boolean'],

            // Temporary Address fields - required only if not living abroad AND not same as permanent
            'province_id' => [($livesAbroad || $isTempSameAsPerm) ? 'nullable' : 'required', 'integer', 'min:1'],
            'district_id' => [($livesAbroad || $isTempSameAsPerm) ? 'nullable' : 'required', 'integer', 'min:1'],
            'municipality_id' => [($livesAbroad || $isTempSameAsPerm) ? 'nullable' : 'required', 'integer', 'min:1'],
            'ward_number' => [($livesAbroad || $isTempSameAsPerm) ? 'nullable' : 'required', 'integer', 'min:1', 'max:33'],
            'tole' => ['nullable', 'string', 'max:255'],
            'address_type' => ['nullable', 'in:permanent,temporary'], // address_type is legacy now, but keeping for compatibility

            // Living abroad
            'lives_abroad' => ['required', 'boolean'],
            'country' => [$livesAbroad ? 'required' : 'nullable', 'string', 'max:255'],

            // Social Media (all optional)
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'twitter_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'tiktok_url' => ['nullable', 'url', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
        ];
    }
}
