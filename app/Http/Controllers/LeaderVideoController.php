<?php

namespace App\Http\Controllers;

use App\Models\Leader;
use App\Models\LeaderVideo;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LeaderVideoController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-leader')->only(['index']);
        $this->middleware('permission:create-leader')->only(['store']);
        $this->middleware('permission:update-leader')->only(['update']);
        $this->middleware('permission:delete-leader')->only(['destroy']);
    }

    public function index(): Response|RedirectResponse
    {
        $leader = Leader::first();

        if (!$leader) {
            return redirect()->route('leader.create')->with('error', 'Please create a leader profile first.');
        }

        return Inertia::render('leaders/videos', [
            'leader' => $leader,
            'videos' => $leader->videos()->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $leader = Leader::firstOrFail();

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'youtube_url' => ['required', 'url', 'max:255'],
        ]);

        $leader->videos()->create($data);

        return back()->with('success', 'Video added successfully.');
    }

    public function update(Request $request, LeaderVideo $video): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'youtube_url' => ['required', 'url', 'max:255'],
        ]);

        $video->update($data);

        return back()->with('success', 'Video updated successfully.');
    }

    public function destroy(LeaderVideo $video): RedirectResponse
    {
        $video->delete();

        return back()->with('success', 'Video deleted successfully.');
    }
}
