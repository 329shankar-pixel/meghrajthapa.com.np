<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Support\LocationScope;

class SiteSettingController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-settings')->only(['index']);
        $this->middleware('permission:update-settings')->only(['update']);
    }

    public function index(): Response
    {
        return Inertia::render('settings/index', [
            'settings' => Setting::all()->pluck('value', 'key'),
            'locationOptions' => LocationScope::adminOptions(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $imageKeys = ['hero_image', 'unity_image', 'favicon', 'site_logo', 'party_flag', 'election_symbol'];

        foreach ($request->all() as $key => $value) {
            if ($request->hasFile($key)) {
                $path = $request->file($key)->store('settings', 'public');
                Setting::set($key, $path, 'image');
            } elseif (in_array($key, $imageKeys)) {
                // Skip if it's an image key but no file was uploaded
                continue;
            } else {
                Setting::set($key, $value);
            }
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
