<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeaderTimelineRequest;
use App\Http\Requests\UpdateLeaderTimelineRequest;
use App\Models\Leader;
use App\Models\LeaderTimeline;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LeaderTimelineController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response|RedirectResponse
    {
        $leader = Leader::first();

        if (! $leader) {
            return redirect()->route('leader.create')->with('error', 'Please create a leader profile first.');
        }

        return Inertia::render('leaders/timelines/index', [
            'leader' => $leader,
            'timelines' => $leader->timelines()->orderBy('date', 'desc')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLeaderTimelineRequest $request): RedirectResponse
    {
        $leader = Leader::firstOrFail();
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('leader-timelines', 'public');
        }

        $leader->timelines()->create($data);

        return redirect()->route('leader.timelines.index')->with('success', 'Timeline entry created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLeaderTimelineRequest $request, LeaderTimeline $timeline): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            if ($timeline->photo) {
                Storage::disk('public')->delete($timeline->photo);
            }
            $data['photo'] = $request->file('photo')->store('leader-timelines', 'public');
        }

        $timeline->update($data);

        return redirect()->route('leader.timelines.index')->with('success', 'Timeline entry updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LeaderTimeline $timeline): RedirectResponse
    {
        if ($timeline->photo) {
            Storage::disk('public')->delete($timeline->photo);
        }

        $timeline->delete();

        return back()->with('success', 'Timeline entry deleted successfully.');
    }
}
