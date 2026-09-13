<?php

namespace App\Http\Controllers;

use App\Models\Leader;
use App\Models\LeaderCategory;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class LeaderCategoryController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $leader = Leader::firstOrFail();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $leader->categories()->create($data);

        return back()->with('success', 'Category added successfully.');
    }

    public function destroy(LeaderCategory $category): RedirectResponse
    {
        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
