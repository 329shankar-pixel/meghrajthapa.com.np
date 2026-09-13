<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActivityRequest;
use App\Models\Activity;
use App\Models\ActivityPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-activities')->only(['index', 'show']);
        $this->middleware('permission:create-activities')->only(['create', 'store']);
        $this->middleware('permission:update-activities')->only(['edit', 'update']);
        $this->middleware('permission:delete-activities')->only(['destroy', 'destroyPhoto']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $activities = Activity::with('photos')->latest()->paginate(15);

        return Inertia::render('activities/index', [
            'activities' => $activities,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('activities/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ActivityRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $activity = Activity::create([
            'title' => $data['title'],
            'slug' => $data['slug'] ?? null,
            'description' => $data['description'] ?? null,
            'date' => $data['date'] ?? now(),
            'location' => $data['location'] ?? null,
        ]);

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('activities', 'public');
            $activity->update(['cover_image' => $path]);
        }

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('activities', 'public');
                $activity->photos()->create(['photo_path' => $path]);
            }
        }

        if ($request->user()->hasPermission('view-activities') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('activities.index')
                ->with('success', 'Activity created successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Activity created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Activity $activity): Response
    {
        return Inertia::render('activities/show', [
            'activity' => $activity->load('photos'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Activity $activity): Response
    {
        return Inertia::render('activities/edit', [
            'activity' => $activity->load('photos'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ActivityRequest $request, Activity $activity): RedirectResponse
    {
        $data = $request->validated();

        $activity->update([
            'title' => $data['title'],
            'slug' => $data['slug'] ?? null,
            'description' => $data['description'] ?? null,
            'date' => $data['date'] ?? $activity->date,
            'location' => $data['location'] ?? $activity->location,
        ]);

        if ($request->hasFile('cover_image')) {
            if ($activity->cover_image) {
                Storage::disk('public')->delete($activity->cover_image);
            }
            $path = $request->file('cover_image')->store('activities', 'public');
            $activity->update(['cover_image' => $path]);
        }

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('activities', 'public');
                $activity->photos()->create(['photo_path' => $path]);
            }
        }

        if ($request->user()->hasPermission('view-activities') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('activities.index')
                ->with('success', 'Activity updated successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Activity updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Activity $activity): RedirectResponse
    {
        foreach ($activity->photos as $photo) {
            Storage::disk('public')->delete($photo->photo_path);
        }

        $activity->delete();

        if (request()->user()->hasPermission('view-activities') || request()->user()->hasRole('administrator')) {
            return redirect()
                ->route('activities.index')
                ->with('success', 'Activity deleted successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Activity deleted successfully.');
    }

    /**
     * Remove a specific photo from an activity.
     */
    public function destroyPhoto(ActivityPhoto $photo): RedirectResponse
    {
        Storage::disk('public')->delete($photo->photo_path);
        $photo->delete();

        return back()->with('success', 'Photo deleted successfully.');
    }
}
