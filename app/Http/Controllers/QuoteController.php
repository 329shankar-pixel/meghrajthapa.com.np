<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuoteRequest;
use App\Http\Requests\UpdateQuoteRequest;
use App\Models\Quote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

use App\Models\Leader;
use Inertia\Inertia;
use Inertia\Response;

class QuoteController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-leader')->only(['index']);
        $this->middleware('permission:create-leader')->only(['store']);
        $this->middleware('permission:update-leader')->only(['update']);
        $this->middleware('permission:delete-leader')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(): Response|RedirectResponse
    {
        $leader = Leader::first();

        if (!$leader) {
             return redirect()->route('leader.create')->with('error', 'Please create a leader profile first.');
        }

        return Inertia::render('leaders/quotes', [
            'leader' => $leader,
            'quotes' => $leader->quotes()->latest()->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuoteRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('quotes', 'public');
        }

        Quote::create($data);

        return back()->with('success', 'Quote added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Quote $quote)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Quote $quote)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuoteRequest $request, Quote $quote): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($quote->image) {
                Storage::disk('public')->delete($quote->image);
            }
            $data['image'] = $request->file('image')->store('quotes', 'public');
        }

        $quote->update($data);

        return back()->with('success', 'Quote updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quote $quote): RedirectResponse
    {
        if ($quote->image) {
            Storage::disk('public')->delete($quote->image);
        }

        $quote->delete();

        return back()->with('success', 'Quote deleted successfully.');
    }
}
