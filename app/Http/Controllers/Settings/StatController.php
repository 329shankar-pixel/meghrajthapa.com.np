<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Stat;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class StatController extends Controller
{
    public function __construct()
    {
        // Stats are part of the public stats settings, so view-settings allows seeing them
        $this->middleware('permission:view-settings')->only(['index', 'show']);
        $this->middleware('permission:create-settings')->only(['create', 'store']);
        $this->middleware('permission:update-settings')->only(['edit', 'update']);
        $this->middleware('permission:delete-settings')->only(['destroy']);
    }

    public function index(): Response
    {
        return Inertia::render('settings/stats/index', [
            'stats' => Stat::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'icon' => 'nullable|string|max:255',
            'value' => 'required|string|max:255',
            'label' => 'required|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        Stat::create($validated);

        return redirect()->back()->with('success', 'Stat item created successfully.');
    }

    public function update(Request $request, Stat $stat): RedirectResponse
    {
        $validated = $request->validate([
            'icon' => 'nullable|string|max:255',
            'value' => 'required|string|max:255',
            'label' => 'required|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $stat->update($validated);

        return redirect()->back()->with('success', 'Stat item updated successfully.');
    }

    public function destroy(Stat $stat): RedirectResponse
    {
        $stat->delete();

        return redirect()->back()->with('success', 'Stat item deleted successfully.');
    }
}
