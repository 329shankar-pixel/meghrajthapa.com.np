<?php

namespace App\Http\Controllers;

use App\Models\Infographic;
use App\Models\Leader;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class InfographicController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-leader')->only(['index']);
        $this->middleware('permission:create-leader')->only(['store']);
        $this->middleware('permission:delete-leader')->only(['destroy']);
    }

    public function index(): Response|RedirectResponse
    {
        $leader = Leader::first();

        if (!$leader) {
            return redirect()->route('leader.create')->with('error', 'Please create a leader profile first.');
        }

        return Inertia::render('leaders/infographics', [
            'leader' => $leader,
            'infographics' => $leader->infographics()->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $leader = Leader::firstOrFail();

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'photo' => ['required', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('infographics', 'public');
        }

        $leader->infographics()->create($data);

        return back()->with('success', 'Infographic added successfully.');
    }

    public function destroy(Infographic $infographic): RedirectResponse
    {
        if ($infographic->photo) {
            Storage::disk('public')->delete($infographic->photo);
        }

        $infographic->delete();

        return back()->with('success', 'Infographic deleted successfully.');
    }
}
