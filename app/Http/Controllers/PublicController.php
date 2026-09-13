<?php

namespace App\Http\Controllers;

use App\Models\Leader;
use App\Models\News;
use App\Models\TeamMember;
use App\Services\CampaignNotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Support\LocationScope;

class PublicController extends Controller
{
    /**
     * Display the public homepage.
     */
    public function index(): Response
    {
        $leader = Leader::with(['timelines' => function ($query) {
            $query->orderBy('date', 'desc');
        }])->first();

        $stats = \App\Models\Stat::orderBy('sort_order')->get();
        $missions = \App\Models\Mission::orderBy('sort_order')->get();
        $news = News::where('is_published', true)->latest('published_at')->take(6)->get();
        $posts = \App\Models\Post::where('is_published', true)->latest('published_at')->take(3)->get();
        $events = \App\Models\Event::latest('event_date')->take(3)->get();
        $activities = \App\Models\Activity::with('photos')->latest('date')->take(3)->get();

        return Inertia::render('public/index', [
            'leader' => $leader,
            'timelines' => $leader?->timelines ?? [],
            'news' => $news,
            'posts' => $posts,
            'events' => $events,
            'activities' => $activities,
            'stats' => $stats,
            'missions' => $missions,
            'partyName' => \App\Models\Setting::get('party_name', config('app.name', 'राजनीतिक दल')),
            'settings' => \App\Models\Setting::all()->pluck('value', 'key'),
        ]);
    }

    /**
     * Handle join team form submission.
     */
    public function joinTeam(\App\Http\Requests\JoinTeamRequest $request): \Illuminate\Http\RedirectResponse
    {
        $whatsappUrl = CampaignNotificationService::whatsappUrl(
            $request->phone,
            "Namaste {$request->full_name}, thank you for joining our campaign team. We will contact you soon."
        );

        $teamMember = TeamMember::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'message' => $request->message,
            'preferred_contact_method' => 'whatsapp',
            'whatsapp_number' => $request->phone,
            'whatsapp_url' => $whatsappUrl,
            'submitted_ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
        ]);

        CampaignNotificationService::notify($teamMember, 'campaign team request', [
            'Name' => $teamMember->full_name,
            'Email' => $teamMember->email,
            'Phone' => $teamMember->phone,
            'Address' => $teamMember->address,
            'Message' => $teamMember->message,
            'Preferred Contact' => $teamMember->preferred_contact_method,
        ], $teamMember->email, $teamMember->full_name, $whatsappUrl);

        return redirect()->back()->with('success', 'Thank you for joining! We will contact you soon.');
    }

    public function biography(): Response
    {
        $leader = Leader::with(['timelines' => function ($query) {
            $query->orderBy('date', 'desc');
        }])->first();

        return Inertia::render('public/biography', [
            'leader' => $leader,
            'timelines' => $leader?->timelines ?? [],
        ]);
    }

    public function news(): Response
    {
        return Inertia::render('public/news/index', [
            'news' => News::where('is_published', true)->latest('published_at')->paginate(12),
            'leader' => Leader::first(),
        ]);
    }

    public function newsShow(News $news): Response
    {
        return Inertia::render('public/news/show', [
            'news' => $news,
            'leader' => Leader::first(),
        ]);
    }

    public function blog(): Response
    {
        return Inertia::render('public/blog/index', [
            'posts' => \App\Models\Post::where('is_published', true)->latest('published_at')->paginate(12),
            'leader' => Leader::first(),
        ]);
    }

    public function blogShow(\App\Models\Post $post): Response
    {
        return Inertia::render('public/blog/show', [
            'post' => $post,
            'leader' => Leader::first(),
        ]);
    }

    public function events(): Response
    {
        return Inertia::render('public/events/index', [
            'events' => \App\Models\Event::latest('event_date')->paginate(12),
            'leader' => Leader::first(),
        ]);
    }

    public function activities(): Response
    {
        return Inertia::render('public/activities/index', [
            'activities' => \App\Models\Activity::with('photos')->latest('date')->paginate(12),
            'leader' => Leader::first(),
        ]);
    }

    public function activityShow(\App\Models\Activity $activity): Response
    {
        return Inertia::render('public/activities/show', [
            'activity' => $activity->load('photos'),
            'leader' => Leader::first(),
        ]);
    }

    public function galleries(Request $request): Response
    {
        $query = \App\Models\LeaderGallery::query()->latest()->with(['photos', 'category']);

        if ($request->filled('category_id') && $request->category_id !== 'all') {
            $query->where('leader_category_id', $request->category_id);
        }

        return Inertia::render('public/galleries/index', [
            'galleries' => $query->paginate(12)->withQueryString(),
            'categories' => \App\Models\LeaderCategory::whereHas('galleries')->get(['id', 'name']),
            'leader' => Leader::first(),
            'filters' => $request->only(['category_id']),
        ]);
    }

    public function infographics(): Response
    {
        return Inertia::render('public/infographics/index', [
            'infographics' => \App\Models\Infographic::latest()->paginate(12),
            'leader' => Leader::first(),
        ]);
    }

    public function resources(): Response
    {
        return Inertia::render('public/resources/index', [
            'resources' => \App\Models\Resource::latest()->paginate(12),
            'leader' => Leader::first(),
        ]);
    }

    public function videos(): Response
    {
        return Inertia::render('public/videos/index', [
            'videos' => \App\Models\LeaderVideo::latest()->paginate(12),
            'leader' => Leader::first(),
        ]);
    }

    public function resourceSubmit(): Response
    {
        $province = new \Sagautam5\LocalStateNepal\Entities\Province('en');
        $provinces = collect($province->allProvinces())->map(fn ($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name,
        ]);

        return Inertia::render('public/resources/submit', [
            'provinces' => $provinces,
            'leader' => Leader::first(),
            'locationScope' => LocationScope::payload(),
        ]);
    }

    public function resourceStore(\App\Http\Requests\ResourceRequest $request): \Illuminate\Http\RedirectResponse
    {
        $validated = LocationScope::applyTo($request->validated());
        unset($validated['photos']);

        $resource = \App\Models\Resource::create($validated);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('resources/photos', 'public');
                $resource->photos()->create(['photo_path' => $path]);
            }
        }

        return redirect()->route('public.resources.submit')->with('success', 'Resource submitted successfully. Thank you!');
    }

    public function eventShow(\App\Models\Event $event): Response
    {
        $province = new \Sagautam5\LocalStateNepal\Entities\Province('en');
        $provinces = collect($province->allProvinces())->map(fn ($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name,
        ]);

        return Inertia::render('public/events/show', [
            'event' => $event,
            'provinces' => $provinces,
            'leader' => Leader::first(),
        ]);
    }

    public function volunteerStore(\App\Http\Requests\StoreVolunteerRequest $request, \App\Models\Event $event): \Illuminate\Http\RedirectResponse
    {
        $validated = LocationScope::applyTo($request->validated());

        $whatsappUrl = CampaignNotificationService::whatsappUrl(
            $validated['phone'],
            "Namaste {$validated['full_name']}, thank you for volunteering for {$event->title}. Our campaign team will contact you soon."
        );

        $volunteer = \App\Models\Volunteer::create([
            'event_id' => $event->id,
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'province_id' => $validated['province_id'],
            'district_id' => $validated['district_id'],
            'municipality_id' => $validated['municipality_id'],
            'ward_number' => $validated['ward_number'],
            'whatsapp_url' => $whatsappUrl,
            'submitted_ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
        ]);

        CampaignNotificationService::notify($volunteer, 'event volunteer registration', [
            'Event' => $event->title,
            'Name' => $volunteer->full_name,
            'Email' => $volunteer->email,
            'Phone' => $volunteer->phone,
            'Province ID' => $volunteer->province_id,
            'District ID' => $volunteer->district_id,
            'Municipality ID' => $volunteer->municipality_id,
            'Ward' => $volunteer->ward_number,
        ], $volunteer->email, $volunteer->full_name, $whatsappUrl);

        return redirect()->route('public.events.show', $event)->with('success', 'Thank you for volunteering! We will contact you soon.');
    }
}
