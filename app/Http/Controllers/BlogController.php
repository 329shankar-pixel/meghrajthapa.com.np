<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-blog')->only(['index', 'show']);
        $this->middleware('permission:create-blog')->only(['create', 'store']);
        $this->middleware('permission:update-blog')->only(['edit', 'update']);
        $this->middleware('permission:delete-blog')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $posts = Post::with('user')->latest()->paginate(15);

        return Inertia::render('blog/index', [
            'posts' => $posts,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('blog/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $request->file('featured_image')->store('blog', 'public');
        }

        $request->user()->posts()->create($data);

        if ($request->user()->hasPermission('view-blog') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('blog.index')
                ->with('success', 'Blog post created successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Blog post created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post): Response
    {
        return Inertia::render('blog/show', [
            'post' => $post->load('user'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post): Response
    {
        return Inertia::render('blog/edit', [
            'post' => $post,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            if ($post->featured_image) {
                Storage::disk('public')->delete($post->featured_image);
            }
            $data['featured_image'] = $request->file('featured_image')->store('blog', 'public');
        }

        $post->update($data);

        if ($request->user()->hasPermission('view-blog') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('blog.index')
                ->with('success', 'Blog post updated successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Blog post updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post): RedirectResponse
    {
        if ($post->featured_image) {
            Storage::disk('public')->delete($post->featured_image);
        }

        $post->delete();

        if (request()->user()->hasPermission('view-blog') || request()->user()->hasRole('administrator')) {
            return redirect()
                ->route('blog.index')
                ->with('success', 'Blog post deleted successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Blog post deleted successfully.');
    }
}
