<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResourceRequest;
use App\Models\Leader;
use App\Models\Resource;
use App\Services\CampaignNotificationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Sagautam5\LocalStateNepal\Entities\Province;
use App\Support\LocationScope;

class PublicResourceController extends Controller
{
    /**
     * Show the form for creating a new community resource.
     */
    public function create(): Response
    {
        $provinceHelper = new Province('en');
        return Inertia::render('public/resources/submit', [
            'provinces' => collect($provinceHelper->allProvinces())->map(fn($p) => [
                'id' => is_array($p) ? $p['id'] : $p->id,
                'name' => is_array($p) ? $p['name'] : $p->name
            ]),
            'leader' => Leader::first(),
            'locationScope' => LocationScope::payload(),
        ]);
    }

    /**
     * Store a newly created community resource.
     */
    public function store(ResourceRequest $request): RedirectResponse
    {
        $validated = LocationScope::applyTo($request->validated());
        unset($validated['photos']);

        $whatsappUrl = CampaignNotificationService::whatsappUrl(
            $validated['person_phone'] ?? null,
            "Namaste {$validated['person_name']}, thank you for submitting '{$validated['title']}'. Our campaign team will review this community project."
        );

        $resource = Resource::create([
            ...$validated,
            'urgency' => $validated['urgency'] ?? 'normal',
            'whatsapp_url' => $whatsappUrl,
            'submitted_ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
        ]);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('resources/photos', 'public');
                $resource->photos()->create(['photo_path' => $path]);
            }
        }

        CampaignNotificationService::notify($resource, 'community project submission', [
            'Project' => $resource->title,
            'Category' => $resource->project_category,
            'Urgency' => $resource->urgency,
            'Description' => $resource->description,
            'Estimated Budget' => $resource->estimated_budget,
            'Beneficiaries' => $resource->beneficiaries,
            'Province ID' => $resource->province_id,
            'District ID' => $resource->district_id,
            'Municipality ID' => $resource->municipality_id,
            'Ward' => $resource->ward_number,
            'Tole' => $resource->tole,
            'Contact Person' => $resource->person_name,
            'Email' => $resource->person_email,
            'Phone' => $resource->person_phone,
        ], $resource->person_email, $resource->person_name, $whatsappUrl);

        return redirect()->route('community.resources.create')->with('success', 'Thank you for submitting your community project! We will review it shortly.');
    }
}
