<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartyMemberTypeRequest;
use App\Models\PartyMemberType;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PartyMemberTypeController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-member-types')->only(['index', 'show']);
        $this->middleware('permission:create-member-types')->only(['create', 'store']);
        $this->middleware('permission:update-member-types')->only(['edit', 'update']);
        $this->middleware('permission:delete-member-types')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $partyMemberTypes = PartyMemberType::withCount('partyMembers')
            ->latest()
            ->get();

        return Inertia::render('party-member-types/index', [
            'partyMemberTypes' => $partyMemberTypes,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('party-member-types/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePartyMemberTypeRequest $request): RedirectResponse
    {
        PartyMemberType::create($request->validated());

        // Smart redirect based on permissions
        if ($request->user()->hasPermission('view-member-types') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('party-member-types.index')
                ->with('success', 'Member type created successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Member type created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PartyMemberType $partyMemberType): Response
    {
        return Inertia::render('party-member-types/edit', [
            'partyMemberType' => $partyMemberType,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StorePartyMemberTypeRequest $request, PartyMemberType $partyMemberType): RedirectResponse
    {
        $partyMemberType->update($request->validated());

        if ($request->user()->hasPermission('view-member-types') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('party-member-types.index')
                ->with('success', 'Member type updated successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Member type updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PartyMemberType $partyMemberType): RedirectResponse
    {
        if ($partyMemberType->partyMembers()->count() > 0) {
            return back()->with('error', 'Cannot delete member type that has associated members.');
        }

        $partyMemberType->delete();

        if (request()->user()->hasPermission('view-member-types') || request()->user()->hasRole('administrator')) {
            return redirect()
                ->route('party-member-types.index')
                ->with('success', 'Member type deleted successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Member type deleted successfully.');
    }
}
