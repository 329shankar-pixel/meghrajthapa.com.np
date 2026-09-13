<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResourceRequest extends FormRequest
{
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
        return [
            'title' => 'required|string|max:255',
            'project_category' => 'nullable|string|max:255',
            'urgency' => 'nullable|string|max:50',
            'description' => 'required|string',
            'estimated_budget' => 'nullable|string|max:255',
            'beneficiaries' => 'nullable|string|max:255',
            'province_id' => 'required|integer',
            'district_id' => 'required|integer',
            'municipality_id' => 'required|integer',
            'ward_number' => 'required|integer',
            'tole' => 'nullable|string|max:255',
            'person_name' => 'required|string|max:255',
            'person_email' => 'required|email|max:255',
            'person_phone' => 'required|string|max:20',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ];
    }
}
