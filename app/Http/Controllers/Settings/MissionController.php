<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Mission;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MissionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-settings')->only(['index', 'show']);
        $this->middleware('permission:create-settings')->only(['create', 'store']);
        $this->middleware('permission:update-settings')->only(['edit', 'update']);
        $this->middleware('permission:delete-settings')->only(['destroy']);
    }

    public function index(): Response
    {
        return Inertia::render('settings/missions/index', [
            'missions' => Mission::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        Mission::create($validated);

        return redirect()->back()->with('success', 'Mission item created successfully.');
    }

    public function update(Request $request, Mission $mission): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $mission->update($validated);

        return redirect()->back()->with('success', 'Mission item updated successfully.');
    }

    public function destroy(Mission $mission): RedirectResponse
    {
        $mission->delete();

        return redirect()->back()->with('success', 'Mission item deleted successfully.');
    }
}
