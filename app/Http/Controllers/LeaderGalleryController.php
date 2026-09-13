<?php

namespace App\Http\Controllers;

use App\Models\Leader;
use App\Models\LeaderGallery;
use App\Models\LeaderGalleryPhoto;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LeaderGalleryController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-leader')->only(['index', 'show']);
        $this->middleware('permission:create-leader')->only(['create', 'store', 'destroyPhoto']);
        $this->middleware('permission:update-leader')->only(['edit', 'update']);
        $this->middleware('permission:delete-leader')->only(['destroy']);
    }

    public function index(): Response|RedirectResponse
    {
        $leader = Leader::first();

        if (!$leader) {
            return redirect()->route('leader.create')->with('error', 'Please create a leader profile first.');
        }

        return Inertia::render('leaders/galleries/index', [
            'leader' => $leader,
            'galleries' => $leader->galleries()->with('category', 'photos')->latest()->get(),
            'categories' => $leader->categories()->get(),
        ]);
    }

    public function create(): Response|RedirectResponse
    {
         $leader = Leader::first();
         if (!$leader) {
            return redirect()->route('leader.create');
        }

        return Inertia::render('leaders/galleries/create', [
            'leader' => $leader,
            'categories' => $leader->categories()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $leader = Leader::firstOrFail();

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'leader_category_id' => ['nullable', 'exists:leader_categories,id'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
            'photos.*' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('leader-galleries', 'public');
        }

        $gallery = $leader->galleries()->create($data);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('leader-gallery-photos', 'public');
                $gallery->photos()->create(['photo_path' => $path]);
            }
        }

        if ($request->user()->hasPermission('view-leader') || $request->user()->hasRole('administrator')) {
            return redirect()->route('leader.galleries')->with('success', 'Gallery created successfully.');
        }

        return redirect()->route('dashboard')->with('success', 'Gallery created successfully.');
    }
    
    public function edit(LeaderGallery $gallery): Response
    {
         $leader = Leader::firstOrFail();

         return Inertia::render('leaders/galleries/edit', [
            'leader' => $leader,
            'gallery' => $gallery->load('photos'),
            'categories' => $leader->categories()->get(),
         ]);
    }

    public function update(Request $request, LeaderGallery $gallery): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'leader_category_id' => ['nullable', 'exists:leader_categories,id'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
            'photos.*' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('cover_image')) {
            if ($gallery->cover_image) {
                Storage::disk('public')->delete($gallery->cover_image);
            }
            $data['cover_image'] = $request->file('cover_image')->store('leader-galleries', 'public');
        }

        $gallery->update($data);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('leader-gallery-photos', 'public');
                $gallery->photos()->create(['photo_path' => $path]);
            }
        }

        if ($request->user()->hasPermission('view-leader') || $request->user()->hasRole('administrator')) {
            return redirect()->route('leader.galleries')->with('success', 'Gallery updated successfully.');
        }

        return redirect()->route('dashboard')->with('success', 'Gallery updated successfully.');
    }

    public function destroy(LeaderGallery $gallery): RedirectResponse
    {
        if ($gallery->cover_image) {
            Storage::disk('public')->delete($gallery->cover_image);
        }
        
        foreach($gallery->photos as $photo){
             Storage::disk('public')->delete($photo->photo_path);
        }

        $gallery->delete();

        return back()->with('success', 'Gallery deleted successfully.');
    }

    public function destroyPhoto(LeaderGalleryPhoto $photo): RedirectResponse
    {
        Storage::disk('public')->delete($photo->photo_path);
        $photo->delete();
        
        return back()->with('success', 'Photo deleted successfully.');
    }
}
