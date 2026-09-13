<?php

namespace App\Http\Controllers;

use App\Models\PartyMember;
use App\Models\PartyMemberType;
use App\Models\Event;
use App\Models\Volunteer;
use App\Models\Activity;
use App\Models\News;
use App\Models\Post;
use App\Models\Resource;
use App\Models\SentEmail;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Sagautam5\LocalStateNepal\Entities\District;
use Sagautam5\LocalStateNepal\Entities\Municipality;
use Sagautam5\LocalStateNepal\Entities\Province;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $hasPermission = $request->user()->hasPermission('view-dashboard') || $request->user()->hasRole('administrator');

        if (!$hasPermission) {
            return Inertia::render('dashboard', [
                'stats' => [
                    'partyMembers' => 0,
                    'partyMemberTypes' => 0,
                    'events' => 0,
                    'volunteers' => 0,
                    'activities' => 0,
                    'news' => 0,
                    'blog' => 0,
                    'resources' => 0,
                    'bookmarkedProjects' => 0,
                    'importantProjects' => 0,
                    'teamMembers' => 0,
                    'users' => 0,
                    'sentEmails' => 0,
                ],
                'filteredMemberCount' => 0,
                'districtStats' => [],
                'municipalityStats' => [],
                'genderStats' => [],
                'memberTypeStats' => [],
                'projectUrgencyStats' => [],
                'emailStats' => [],
                'recentMembers' => [],
                'recentProjects' => [],
                'upcomingEvents' => [],
                'filters' => [
                    'province_id' => null,
                    'district_id' => null,
                    'municipality_id' => null,
                ],
                'filterOptions' => [
                    'provinces' => [],
                    'districts' => [],
                    'municipalities' => [],
                ],
                'noAccess' => true // Hint for frontend to show empty state message
            ]);
        }

        $provinceId = $request->query('province_id');
        $districtId = $request->query('district_id');
        $municipalityId = $request->query('municipality_id');

        // Build query with filters
        $query = PartyMember::query();
        
        if ($provinceId) {
            $query->where('province_id', $provinceId);
        }
        if ($districtId) {
            $query->where('district_id', $districtId);
        }
        if ($municipalityId) {
            $query->where('municipality_id', $municipalityId);
        }

        $filteredCount = $query->count();

        // Get location statistics
        $districtStats = PartyMember::query()
            ->when($provinceId, fn($q) => $q->where('province_id', $provinceId))
            ->selectRaw('district_id, COUNT(*) as count')
            ->groupBy('district_id')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $municipalityStats = PartyMember::query()
            ->when($provinceId, fn($q) => $q->where('province_id', $provinceId))
            ->when($districtId, fn($q) => $q->where('district_id', $districtId))
            ->selectRaw('municipality_id, COUNT(*) as count')
            ->groupBy('municipality_id')
            ->orderByDesc('count')
            ->limit(10)
            ->get();


        // Map IDs to names using the Nepal location package
        $districtEntity = new District('en');
        $municipalityEntity = new Municipality('en');
        $provinceEntity = new Province('en');

        $districtStatsWithNames = $districtStats->map(function ($stat) use ($districtEntity) {
            $district = collect($districtEntity->allDistricts())->first(fn($d) => (is_array($d) ? $d['id'] : $d->id) == $stat->district_id);
            return [
                'id' => $stat->district_id,
                'name' => $district ? (is_array($district) ? $district['name'] : $district->name) : 'Unknown',
                'count' => $stat->count,
            ];
        });

        $municipalityStatsWithNames = $municipalityStats->map(function ($stat) use ($municipalityEntity) {
            $municipality = collect($municipalityEntity->allMunicipalities())->first(fn($m) => (is_array($m) ? $m['id'] : $m->id) == $stat->municipality_id);
            return [
                'id' => $stat->municipality_id,
                'name' => $municipality ? (is_array($municipality) ? $municipality['name'] : $municipality->name) : 'Unknown',
                'count' => $stat->count,
            ];
        });

        // Get provinces for filter dropdown
        $provinces = collect($provinceEntity->allProvinces())->map(fn($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name,
        ]);

        // Get districts if province selected
        $districts = [];
        if ($provinceId) {
            $districts = collect($districtEntity->getDistrictsByProvince((int)$provinceId))->map(fn($d) => [
                'id' => is_array($d) ? $d['id'] : $d->id,
                'name' => is_array($d) ? $d['name'] : $d->name,
            ]);
        }

        // Get municipalities if district selected
        $municipalities = [];
        if ($districtId) {
            $municipalities = collect($municipalityEntity->getMunicipalitiesByDistrict((int)$districtId))->map(fn($m) => [
                'id' => is_array($m) ? $m['id'] : $m->id,
                'name' => is_array($m) ? $m['name'] : $m->name,
            ]);
        }


        return Inertia::render('dashboard', [
            'stats' => [
                'partyMembers' => PartyMember::count(),
                'partyMemberTypes' => PartyMemberType::count(),
                'events' => Event::count(),
                'volunteers' => Volunteer::count(),
                'activities' => Activity::count(),
                'news' => News::count(),
                'blog' => Post::count(),
                'resources' => Resource::count(),
                'bookmarkedProjects' => Resource::where('is_bookmarked', true)->count(),
                'importantProjects' => Resource::where('is_important', true)->count(),
                'teamMembers' => TeamMember::count(),
                'users' => User::count(),
                'sentEmails' => SentEmail::count(),
            ],
            'genderStats' => PartyMember::selectRaw('gender, COUNT(*) as count')
                ->groupBy('gender')
                ->get()
                ->map(fn ($item) => [
                    'name' => ucfirst((string) ($item->gender ?: 'Unknown')),
                    'count' => $item->count,
                ]),
            'memberTypeStats' => PartyMemberType::withCount('partyMembers')
                ->orderByDesc('party_members_count')
                ->get()
                ->map(fn (PartyMemberType $type) => [
                    'name' => $type->name,
                    'count' => $type->party_members_count,
                ]),
            'projectUrgencyStats' => Resource::selectRaw("COALESCE(urgency, 'normal') as urgency, COUNT(*) as count")
                ->groupBy('urgency')
                ->orderByDesc('count')
                ->get()
                ->map(fn ($item) => [
                    'name' => ucfirst((string) $item->urgency),
                    'count' => $item->count,
                ]),
            'emailStats' => [
                'queued' => SentEmail::whereIn('status', ['queued', 'sending'])->count(),
                'sent' => SentEmail::where('status', 'sent')->count(),
                'errors' => SentEmail::where('status', 'completed_with_errors')->count(),
                'recipients' => SentEmail::sum('recipient_count'),
            ],
            'filteredMemberCount' => $filteredCount,
            'districtStats' => $districtStatsWithNames,
            'municipalityStats' => $municipalityStatsWithNames,
            'recentMembers' => PartyMember::latest()->take(5)->get(),
            'recentProjects' => Resource::latest()->take(5)->get(['id', 'title', 'urgency', 'is_bookmarked', 'is_important', 'created_at']),
            'upcomingEvents' => Event::where('event_date', '>=', now())->orderBy('event_date')->take(5)->get(['id', 'title', 'event_date', 'location']),
            'filters' => [
                'province_id' => $provinceId,
                'district_id' => $districtId,
                'municipality_id' => $municipalityId,
            ],
            'filterOptions' => [
                'provinces' => $provinces,
                'districts' => $districts,
                'municipalities' => $municipalities,
            ],
        ]);
    }
}
