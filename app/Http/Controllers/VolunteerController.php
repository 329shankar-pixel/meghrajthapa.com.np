<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVolunteerRequest;
use App\Models\Event;
use App\Models\Volunteer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Sagautam5\LocalStateNepal\Entities\Province;

class VolunteerController extends Controller
{
    public function __construct()
    {
        // No index/show for volunteers (nested in event)
        $this->middleware('permission:create-events')->only(['create', 'store']);
        $this->middleware('permission:update-events')->only(['edit', 'update']);
        $this->middleware('permission:delete-events')->only(['destroy']);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $eventId = $request->query('event_id');
        $event = Event::findOrFail($eventId);

        $province = new Province('en');
        $provinces = collect($province->allProvinces())->map(fn ($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name,
        ]);

        return Inertia::render('volunteers/create', [
            'event' => $event,
            'provinces' => $provinces,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVolunteerRequest $request): RedirectResponse
    {
        Volunteer::create($request->validated());

        if ($request->user()->hasPermission('view-events') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('events.show', $request->event_id)
                ->with('success', 'Volunteer added successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Volunteer added successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Volunteer $volunteer): Response
    {
        $volunteer->load('event');

        $province = new Province('en');
        $provinces = collect($province->allProvinces())->map(fn ($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name,
        ]);

        $district = new \Sagautam5\LocalStateNepal\Entities\District('en');
        $districts = collect($district->getDistrictsByProvince($volunteer->province_id))->map(fn ($d) => [
            'id' => is_array($d) ? $d['id'] : $d->id,
            'name' => is_array($d) ? $d['name'] : $d->name,
        ]);

        $municipality = new \Sagautam5\LocalStateNepal\Entities\Municipality('en');
        $municipalities = collect($municipality->getMunicipalitiesByDistrict($volunteer->district_id))->map(fn ($m) => [
            'id' => is_array($m) ? $m['id'] : $m->id,
            'name' => is_array($m) ? $m['name'] : $m->name,
        ]);

        return Inertia::render('volunteers/edit', [
            'volunteer' => $volunteer,
            'provinces' => $provinces,
            'districts' => $districts,
            'municipalities' => $municipalities,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(\App\Http\Requests\UpdateVolunteerRequest $request, Volunteer $volunteer): RedirectResponse
    {
        $volunteer->update($request->validated());

        if ($request->user()->hasPermission('view-events') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('events.show', $volunteer->event_id)
                ->with('success', 'Volunteer updated successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Volunteer updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Volunteer $volunteer): RedirectResponse
    {
        $eventId = $volunteer->event_id;
        $volunteer->delete();

        if (request()->user()->hasPermission('view-events') || request()->user()->hasRole('administrator')) {
            return redirect()
                ->route('events.show', $eventId)
                ->with('success', 'Volunteer removed successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Volunteer removed successfully.');
    }
}
