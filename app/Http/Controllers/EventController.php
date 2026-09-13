<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Sagautam5\LocalStateNepal\Entities\District;
use Sagautam5\LocalStateNepal\Entities\Municipality;
use Sagautam5\LocalStateNepal\Entities\Province;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EventController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-events')->only(['index', 'show', 'exportVolunteersCsv', 'exportVolunteersPdf']);
        $this->middleware('permission:create-events')->only(['create', 'store']);
        $this->middleware('permission:update-events')->only(['edit', 'update']);
        $this->middleware('permission:delete-events')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $query = Event::withCount('volunteers')->latest();

        if (request('province_id') && request('province_id') !== 'all') {
            $query->where('province_id', request('province_id'));
        }
        if (request('district_id') && request('district_id') !== 'all') {
            $query->where('district_id', request('district_id'));
        }
        if (request('municipality_id') && request('municipality_id') !== 'all') {
            $query->where('municipality_id', request('municipality_id'));
        }
        if (request('ward_number') && request('ward_number') !== 'all') {
            $query->where('ward_number', request('ward_number'));
        }

        $events = $query->paginate(15)->withQueryString();

        // Get provinces for filter
        $provinceHelper = new Province('en');
        $provinces = collect($provinceHelper->allProvinces())->map(fn($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name
        ])->values();

        // Map location names for display
        $districtHelper = new District('en');
        $municipalityHelper = new Municipality('en');

        $events->getCollection()->transform(function ($event) use ($provinceHelper, $districtHelper, $municipalityHelper) {
            $event->province_name = $this->getLocationName($provinceHelper->allProvinces(), $event->province_id);
            $event->district_name = $this->getLocationName($districtHelper->allDistricts(), $event->district_id);
            $event->municipality_name = $this->getLocationName($municipalityHelper->allMunicipalities(), $event->municipality_id);
            return $event;
        });

        return Inertia::render('events/index', [
            'events' => $events,
            'filters' => request()->all(['province_id', 'district_id', 'municipality_id', 'ward_number']),
            'provinces' => $provinces,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $province = new Province('en');
        $provinces = collect($province->allProvinces())->map(fn($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name
        ])->values();

        return Inertia::render('events/create', [
            'provinces' => $provinces,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('events', 'public');
        }

        Event::create($data);

        if ($request->user()->hasPermission('view-events') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('events.index')
                ->with('success', 'Event created successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Event created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event): Response
    {
        $event->load(['volunteers']);
        $volunteers = $this->getVolunteersWithLocation($event);

        // Get location names
        $province = new Province('en');
        $district = new District('en');
        $municipality = new Municipality('en');

        $event->province_name = $this->getLocationName($province->allProvinces(), $event->province_id);
        $event->district_name = $this->getLocationName($district->allDistricts(), $event->district_id);
        $event->municipality_name = $this->getLocationName($municipality->allMunicipalities(), $event->municipality_id);

        return Inertia::render('events/show', [
            'event' => $event,
            'volunteers' => $volunteers,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event): Response
    {
        $provinceHelper = new Province('en');
        $districtHelper = new District('en');
        $municipalityHelper = new Municipality('en');

        $provinces = collect($provinceHelper->allProvinces())->map(fn($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name
        ])->values();

        $districts = collect($districtHelper->getDistrictsByProvince($event->province_id))->map(fn($d) => [
            'id' => is_array($d) ? $d['id'] : $d->id,
            'name' => is_array($d) ? $d['name'] : $d->name
        ])->values();

        $municipalities = collect($municipalityHelper->getMunicipalitiesByDistrict($event->district_id))->map(fn($m) => [
            'id' => is_array($m) ? $m['id'] : $m->id,
            'name' => is_array($m) ? $m['name'] : $m->name
        ])->values();

        return Inertia::render('events/edit', [
            'event' => $event,
            'provinces' => $provinces,
            'districts' => $districts,
            'municipalities' => $municipalities,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('events', 'public');
        }

        $event->update($data);

        if ($request->user()->hasPermission('view-events') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('events.index')
                ->with('success', 'Event updated successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Event updated successfully.');
    }

    /**
     * Send email to all volunteers of the event.
     */
    public function sendVolunteerEmail(\Illuminate\Http\Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('mail-attachments');
            $attachmentName = $request->file('attachment')->getClientOriginalName();
        }

        \App\Jobs\SendEventVolunteerEmails::dispatch(
            $event,
            $validated['subject'],
            $validated['content'],
            $attachmentPath,
            $attachmentName
        );

        return redirect()
            ->back()
            ->with('success', 'Email sending process has been started for all volunteers.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        if (request()->user()->hasPermission('view-events') || request()->user()->hasRole('administrator')) {
            return redirect()
                ->route('events.index')
                ->with('success', 'Event deleted successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Event deleted successfully.');
    }

    private function getVolunteersWithLocation(Event $event)
    {
        $provinceHelper = new Province('en');
        $districtHelper = new District('en');
        $municipalityHelper = new Municipality('en');

        $provinces = $provinceHelper->allProvinces();
        $districts = $districtHelper->allDistricts();
        $municipalities = $municipalityHelper->allMunicipalities();

        return $event->volunteers->map(function ($volunteer) use ($provinces, $districts, $municipalities) {
            $volunteer->province_name = $this->getLocationName($provinces, $volunteer->province_id);
            $volunteer->district_name = $this->getLocationName($districts, $volunteer->district_id);
            $volunteer->municipality_name = $this->getLocationName($municipalities, $volunteer->municipality_id);
            return $volunteer;
        });
    }

    private function getLocationName(mixed $items, int|string|null $id): string
    {
        if (!$id) return 'Unknown';
        $item = collect($items)->first(fn($p) => (is_array($p) ? $p['id'] : $p->id) == $id);
        return $item ? (is_array($item) ? $item['name'] : $item->name) : 'Unknown';
    }
}
