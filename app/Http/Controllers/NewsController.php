<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNewsRequest;
use App\Http\Requests\UpdateNewsRequest;
use App\Models\News;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-news')->only(['index', 'show']);
        $this->middleware('permission:create-news')->only(['create', 'store']);
        $this->middleware('permission:update-news')->only(['edit', 'update']);
        $this->middleware('permission:delete-news')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $news = News::latest()->paginate(15);

        return Inertia::render('news/index', [
            'news' => $news,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('news/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreNewsRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $request->file('featured_image')->store('news', 'public');
        }

        News::create($data);

        if ($request->user()->hasPermission('view-news') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('news.index')
                ->with('success', 'News created successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'News created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(News $news): Response
    {
        return Inertia::render('news/show', [
            'news' => $news,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(News $news): Response
    {
        return Inertia::render('news/edit', [
            'news' => $news,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateNewsRequest $request, News $news): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            if ($news->featured_image) {
                Storage::disk('public')->delete($news->featured_image);
            }
            $data['featured_image'] = $request->file('featured_image')->store('news', 'public');
        }

        $news->update($data);

        if ($request->user()->hasPermission('view-news') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('news.index')
                ->with('success', 'News updated successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'News updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(News $news): RedirectResponse
    {
        if ($news->featured_image) {
            Storage::disk('public')->delete($news->featured_image);
        }

        $news->delete();

        if (request()->user()->hasPermission('view-news') || request()->user()->hasRole('administrator')) {
            return redirect()
                ->route('news.index')
                ->with('success', 'News deleted successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'News deleted successfully.');
    }
}
