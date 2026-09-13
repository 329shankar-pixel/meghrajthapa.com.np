<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeaderRequest;
use App\Http\Requests\UpdateLeaderRequest;
use App\Models\Leader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LeaderController extends Controller
{
    public function __construct()
    {
        // 'show' is public
        $this->middleware('permission:create-leader')->only(['create', 'store']);
        $this->middleware('permission:update-leader')->only([
            'editProfile', 'updateProfile',
            'editBiography', 'updateBiography'
        ]);
        // Delete is not implemented in LeaderController for the profile itself (only contents), but if it was...
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response|RedirectResponse
    {
        if (Leader::exists()) {
            $canView = request()->user()->hasPermission('view-leader') || request()->user()->hasRole('administrator');
            return redirect()->route($canView ? 'leader.biography' : 'dashboard');
        }

        return Inertia::render('leaders/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLeaderRequest $request): RedirectResponse
    {
        $canView = $request->user()->hasPermission('view-leader') || $request->user()->hasRole('administrator');
        $redirectRoute = $canView ? 'leader.biography' : 'dashboard';

        if (Leader::exists()) {
             return redirect()->route($redirectRoute)->with('error', 'Leader profile already exists.');
        }

        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('leaders', 'public');
        }

        Leader::create($data);

        return redirect()->route($redirectRoute)->with('success', 'Leader profile created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug): Response
    {
        $leader = Leader::where('slug', $slug)->with(['quotes', 'infographics'])->firstOrFail();

        return Inertia::render('leaders/show', [
            'leader' => $leader,
        ]);
    }

    /**
     * Show the form for editing the leader profile.
     */
    public function editProfile(): Response|RedirectResponse
    {
        $leader = Leader::first();

        if (!$leader) {
            return redirect()->route('leader.create');
        }

        return Inertia::render('leaders/profile', [
            'leader' => $leader,
        ]);
    }

    /**
     * Update the leader profile.
     */
    public function updateProfile(UpdateLeaderRequest $request): RedirectResponse
    {
        $leader = Leader::firstOrFail();
        $data = $request->validated();
        
        $data['slug'] = Str::slug($data['name']);

        if ($request->hasFile('image')) {
            if ($leader->image) {
                Storage::disk('public')->delete($leader->image);
            }
            $data['image'] = $request->file('image')->store('leaders', 'public');
        }

        $leader->update($data);

        if ($request->user()->hasPermission('view-leader') || $request->user()->hasRole('administrator')) {
            return redirect()->route('leader.profile')->with('success', 'Profile updated successfully.');
        }

        return redirect()->route('dashboard')->with('success', 'Profile updated successfully.');
    }

    /**
     * Show the form for editing the biography.
     */
    public function editBiography(): Response|RedirectResponse
    {
        $leader = Leader::first();

        if (!$leader) {
            return redirect()->route('leader.create');
        }

        return Inertia::render('leaders/biography', [
            'leader' => $leader,
        ]);
    }

    /**
     * Update the biography.
     */
    public function updateBiography(UpdateLeaderRequest $request): RedirectResponse
    {
        $leader = Leader::firstOrFail();
        $data = $request->validated();

        $leader->update($data);

        if ($request->user()->hasPermission('view-leader') || $request->user()->hasRole('administrator')) {
            return redirect()->route('leader.biography')->with('success', 'Biography updated successfully.');
        }

        return redirect()->route('dashboard')->with('success', 'Biography updated successfully.');
    }
}
