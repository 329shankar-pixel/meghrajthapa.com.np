<?php

namespace App\Http\Controllers;

use App\Jobs\SendSelectedContactEmails;
use App\Models\Leader;
use App\Models\PartyMember;
use App\Models\Resource;
use App\Models\SentEmail;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class EmailCenterController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-emails')->only(['index', 'show']);
        $this->middleware('permission:create-emails')->only('send');
    }

    public function index(Request $request): Response
    {
        $type = $request->input('type', 'all');
        $search = trim((string) $request->input('search', ''));

        $recipients = $this->recipients()
            ->when($type !== 'all', fn (Collection $items) => $items->where('type', $type))
            ->when($search !== '', function (Collection $items) use ($search) {
                $needle = mb_strtolower($search);

                return $items->filter(fn (array $item) => str_contains(mb_strtolower($item['name']), $needle)
                    || str_contains(mb_strtolower($item['email']), $needle)
                    || str_contains(mb_strtolower($item['source']), $needle)
                    || str_contains(mb_strtolower($item['meta'] ?? ''), $needle));
            })
            ->values();

        return Inertia::render('emails/index', [
            'recipients' => $recipients,
            'types' => $this->recipientTypes(),
            'filters' => [
                'type' => $type,
                'search' => $search,
            ],
            'stats' => [
                'total' => $this->recipients()->count(),
                'visible' => $recipients->count(),
                'types' => $this->recipients()->groupBy('type')->map->count(),
            ],
            'sentEmails' => SentEmail::with('user')
                ->latest()
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    public function show(SentEmail $sentEmail): Response
    {
        $sentEmail->load(['user', 'recipients' => fn ($query) => $query->latest()]);

        return Inertia::render('emails/show', [
            'sentEmail' => $sentEmail,
        ]);
    }

    public function send(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'recipients' => 'required|array|min:1|max:500',
            'recipients.*' => 'required|email',
        ]);

        $allowedEmails = $this->recipients()->pluck('email')->unique()->values();
        $selectedEmails = collect($validated['recipients'])
            ->map(fn (string $email) => mb_strtolower(trim($email)))
            ->unique()
            ->filter(fn (string $email) => $allowedEmails->contains($email))
            ->values();

        if ($selectedEmails->isEmpty()) {
            return back()->withErrors(['recipients' => 'Select at least one valid site email.']);
        }

        $sentEmail = SentEmail::create([
            'user_id' => $request->user()?->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'source' => 'email_center',
            'status' => 'queued',
            'recipient_count' => $selectedEmails->count(),
        ]);

        $sentEmail->recipients()->createMany(
            $selectedEmails->map(fn (string $email) => [
                'email' => $email,
                'status' => 'queued',
            ])->all()
        );

        SendSelectedContactEmails::dispatch(
            $validated['subject'],
            $validated['message'],
            $selectedEmails->all(),
            $sentEmail->id
        );

        return back()->with('success', "Email sending process started for {$selectedEmails->count()} recipient(s).");
    }

    private function recipients(): Collection
    {
        return collect()
            ->merge($this->partyMembers())
            ->merge($this->volunteers())
            ->merge($this->communityProjects())
            ->merge($this->teamMembers())
            ->merge($this->users())
            ->merge($this->leaders())
            ->filter(fn (array $item) => filter_var($item['email'], FILTER_VALIDATE_EMAIL))
            ->map(function (array $item) {
                $item['email'] = mb_strtolower($item['email']);
                return $item;
            })
            ->unique(fn (array $item) => "{$item['type']}:{$item['email']}")
            ->sortBy([['type', 'asc'], ['name', 'asc']])
            ->values();
    }

    private function recipientTypes(): array
    {
        return [
            ['value' => 'all', 'label' => 'All Site Emails'],
            ['value' => 'party_members', 'label' => 'Party Members'],
            ['value' => 'volunteers', 'label' => 'Event Volunteers'],
            ['value' => 'community_projects', 'label' => 'Community Projects'],
            ['value' => 'team_members', 'label' => 'Team / Supporters'],
            ['value' => 'users', 'label' => 'Admin Users'],
            ['value' => 'leaders', 'label' => 'Leaders'],
        ];
    }

    private function partyMembers(): Collection
    {
        return PartyMember::query()
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->get(['id', 'full_name', 'email', 'phone', 'ward_number'])
            ->map(fn (PartyMember $member) => [
                'id' => "party-member-{$member->id}",
                'type' => 'party_members',
                'source' => 'Party Member',
                'name' => $member->full_name,
                'email' => $member->email,
                'meta' => trim("{$member->phone} Ward {$member->ward_number}"),
            ]);
    }

    private function volunteers(): Collection
    {
        return Volunteer::query()
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->get(['id', 'full_name', 'email', 'phone', 'ward_number'])
            ->map(fn (Volunteer $volunteer) => [
                'id' => "volunteer-{$volunteer->id}",
                'type' => 'volunteers',
                'source' => 'Event Volunteer',
                'name' => $volunteer->full_name,
                'email' => $volunteer->email,
                'meta' => trim("{$volunteer->phone} Ward {$volunteer->ward_number}"),
            ]);
    }

    private function communityProjects(): Collection
    {
        return Resource::query()
            ->whereNotNull('person_email')
            ->where('person_email', '!=', '')
            ->get(['id', 'title', 'person_name', 'person_email', 'person_phone', 'project_category', 'urgency'])
            ->map(fn (Resource $resource) => [
                'id' => "resource-{$resource->id}",
                'type' => 'community_projects',
                'source' => 'Community Project',
                'name' => $resource->person_name,
                'email' => $resource->person_email,
                'meta' => trim("{$resource->title} {$resource->project_category} {$resource->urgency} {$resource->person_phone}"),
            ]);
    }

    private function teamMembers(): Collection
    {
        return TeamMember::query()
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->get(['id', 'full_name', 'email', 'phone', 'status'])
            ->map(fn (TeamMember $member) => [
                'id' => "team-member-{$member->id}",
                'type' => 'team_members',
                'source' => 'Team / Supporter',
                'name' => $member->full_name,
                'email' => $member->email,
                'meta' => trim("{$member->phone} {$member->status}"),
            ]);
    }

    private function users(): Collection
    {
        return User::query()
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => "user-{$user->id}",
                'type' => 'users',
                'source' => 'Admin User',
                'name' => $user->name,
                'email' => $user->email,
                'meta' => 'Dashboard account',
            ]);
    }

    private function leaders(): Collection
    {
        return Leader::query()
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->get(['id', 'name', 'email', 'phone'])
            ->map(fn (Leader $leader) => [
                'id' => "leader-{$leader->id}",
                'type' => 'leaders',
                'source' => 'Leader',
                'name' => $leader->name,
                'email' => $leader->email,
                'meta' => $leader->phone ?? '',
            ]);
    }
}
