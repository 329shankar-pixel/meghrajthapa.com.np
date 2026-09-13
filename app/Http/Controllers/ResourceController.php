<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResourceRequest;
use App\Models\Resource;
use App\Models\ResourcePhoto;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Sagautam5\LocalStateNepal\Entities\District;
use Sagautam5\LocalStateNepal\Entities\Municipality;
use Sagautam5\LocalStateNepal\Entities\Province;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ResourceController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-resources')->only(['index', 'show', 'bookmarks', 'recycle', 'exportExcel', 'exportPdf', 'downloadPdf', 'template']);
        $this->middleware('permission:create-resources')->only(['create', 'store', 'import']);
        $this->middleware('permission:update-resources')->only(['edit', 'update', 'restore', 'bulkRestore']);
        $this->middleware('permission:delete-resources')->only(['destroy', 'destroyPhoto', 'bulkDestroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Resource::query()->with('photos');

        $this->applyResourceFilters($query, $request);

        $resources = $query
            ->orderByDesc('is_important')
            ->orderByDesc('is_bookmarked')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Location data for names
        $provinceHelper = new Province('en');
        $districtHelper = new District('en');
        $municipalityHelper = new Municipality('en');

        $resources->getCollection()->transform(function ($resource) use ($provinceHelper, $districtHelper, $municipalityHelper) {
            $resource->province_name = $this->getLocationName($provinceHelper->find($resource->province_id));
            $resource->district_name = $this->getLocationName($districtHelper->find($resource->district_id));
            $resource->municipality_name = $this->getLocationName($municipalityHelper->find($resource->municipality_id));
            return $resource;
        });

        // Stats
        $stats = [
            'total' => Resource::count(),
            'bookmarked' => Resource::where('is_bookmarked', true)->count(),
            'important' => Resource::where('is_important', true)->count(),
            'by_province' => Resource::select('province_id')
                ->selectRaw('count(*) as count')
                ->groupBy('province_id')
                ->get()
                ->map(function($item) use ($provinceHelper) {
                    $province = $provinceHelper->find($item->province_id);
                    return [
                        'name' => is_object($province) ? $province->name : (is_array($province) ? $province['name'] : 'Unknown'),
                        'count' => $item->count,
                    ];
                }),
        ];

        return Inertia::render('resources/index', [
            'resources' => $resources,
            'filters' => $request->only(['search', 'province_id', 'district_id', 'municipality_id', 'ward_number', 'status']),
            'stats' => $stats,
            'provinces' => $this->getProvincesForSelect($provinceHelper),
        ]);
    }

    public function bookmarks(Request $request)
    {
        $query = Resource::query()
            ->with('photos')
            ->where('is_bookmarked', true);

        $this->applyResourceFilters($query, $request);
        if ($request->input('status') === 'important' || $request->input('priority') === 'important') {
            $query->where('is_important', true);
        }

        $resources = $query
            ->orderByDesc('is_important')
            ->orderByDesc('bookmarked_at')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $provinceHelper = new Province('en');
        $districtHelper = new District('en');
        $municipalityHelper = new Municipality('en');

        $resources->getCollection()->transform(function ($resource) use ($provinceHelper, $districtHelper, $municipalityHelper) {
            $resource->province_name = $this->getLocationName($provinceHelper->find($resource->province_id));
            $resource->district_name = $this->getLocationName($districtHelper->find($resource->district_id));
            $resource->municipality_name = $this->getLocationName($municipalityHelper->find($resource->municipality_id));
            return $resource;
        });

        return Inertia::render('resources/bookmarks', [
            'resources' => $resources,
            'filters' => $request->only(['search', 'priority', 'province_id', 'district_id', 'municipality_id', 'ward_number']),
            'stats' => [
                'bookmarked' => Resource::where('is_bookmarked', true)->count(),
                'important' => Resource::where('is_bookmarked', true)->where('is_important', true)->count(),
            ],
            'provinces' => $this->getProvincesForSelect($provinceHelper),
        ]);
    }

    public function recycle(Request $request)
    {
        $query = Resource::onlyTrashed()->with('photos');

        $this->applyResourceFilters($query, $request);

        $resources = $query
            ->latest('deleted_at')
            ->paginate(15)
            ->withQueryString();

        $provinceHelper = new Province('en');
        $districtHelper = new District('en');
        $municipalityHelper = new Municipality('en');

        $resources->getCollection()->transform(function ($resource) use ($provinceHelper, $districtHelper, $municipalityHelper) {
            $resource->province_name = $this->getLocationName($provinceHelper->find($resource->province_id));
            $resource->district_name = $this->getLocationName($districtHelper->find($resource->district_id));
            $resource->municipality_name = $this->getLocationName($municipalityHelper->find($resource->municipality_id));
            return $resource;
        });

        return Inertia::render('resources/recycle', [
            'resources' => $resources,
            'filters' => $request->only(['search', 'province_id', 'district_id', 'municipality_id', 'ward_number', 'status']),
            'stats' => [
                'deleted' => Resource::onlyTrashed()->count(),
                'important' => Resource::onlyTrashed()->where('is_important', true)->count(),
                'bookmarked' => Resource::onlyTrashed()->where('is_bookmarked', true)->count(),
            ],
            'provinces' => $this->getProvincesForSelect($provinceHelper),
        ]);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:resources,id'],
        ]);

        Resource::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', count($validated['ids']) . ' project(s) moved to recycle bin.');
    }

    public function restore(int $resource): RedirectResponse
    {
        $resource = Resource::withTrashed()->findOrFail($resource);
        $resource->restore();

        return back()->with('success', 'Project restored successfully.');
    }

    public function bulkRestore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $restored = Resource::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->restore();

        return back()->with('success', $restored . ' project(s) restored successfully.');
    }

    public function template(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $headers = [
            'title',
            'project_category',
            'urgency',
            'description',
            'estimated_budget',
            'beneficiaries',
            'province_id',
            'district_id',
            'municipality_id',
            'ward_number',
            'tole',
            'person_name',
            'person_email',
            'person_phone',
        ];

        $sheet->fromArray($headers, null, 'A1');
        $sheet->fromArray([
            'Community drinking water upgrade',
            'Infrastructure',
            'high',
            'Detailed community project request with background, need, expected impact, and local coordination notes.',
            'NPR 500000',
            '350 households',
            1,
            1,
            101,
            5,
            'Main tole',
            'Ram Bahadur',
            'ram@example.com',
            '9800000000',
        ], null, 'A2');

        $sheet->getStyle('A1:N1')->getFont()->setBold(true);
        foreach (range('A', 'N') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'community-project-upload-template.xlsx';

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0',
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        $spreadsheet = IOFactory::load($validated['file']->getRealPath());
        $rows = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);
        $headers = array_map(fn($value) => trim((string) $value), array_shift($rows) ?? []);

        $imported = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            $values = array_values($row);
            $data = array_combine($headers, $values);
            if (!$data) {
                $skipped++;
                continue;
            }

            $payload = [
                'title' => trim((string) ($data['title'] ?? '')),
                'project_category' => $data['project_category'] ?? null,
                'urgency' => $data['urgency'] ?? null,
                'description' => trim((string) ($data['description'] ?? '')),
                'estimated_budget' => $data['estimated_budget'] ?? null,
                'beneficiaries' => $data['beneficiaries'] ?? null,
                'province_id' => (int) ($data['province_id'] ?? 0),
                'district_id' => (int) ($data['district_id'] ?? 0),
                'municipality_id' => (int) ($data['municipality_id'] ?? 0),
                'ward_number' => (int) ($data['ward_number'] ?? 0),
                'tole' => $data['tole'] ?? null,
                'person_name' => trim((string) ($data['person_name'] ?? '')),
                'person_email' => trim((string) ($data['person_email'] ?? '')),
                'person_phone' => trim((string) ($data['person_phone'] ?? '')),
            ];

            if (!$payload['title'] || !$payload['description'] || !$payload['province_id'] || !$payload['district_id'] || !$payload['municipality_id'] || !$payload['ward_number'] || !$payload['person_name'] || !filter_var($payload['person_email'], FILTER_VALIDATE_EMAIL) || !$payload['person_phone']) {
                $skipped++;
                continue;
            }

            Resource::create($payload);
            $imported++;
        }

        return back()->with('success', "{$imported} project(s) imported. {$skipped} row(s) skipped.");
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $resources = $this->getFilteredResourcesForExport($request);
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['ID', 'Title', 'Category', 'Urgency', 'Description', 'Budget', 'Beneficiaries', 'Province', 'District', 'Municipality', 'Ward', 'Tole', 'Contact Name', 'Email', 'Phone', 'Bookmarked', 'Important', 'Created At'];
        $sheet->fromArray($headers, null, 'A1');
        $sheet->getStyle('A1:R1')->getFont()->setBold(true);

        $row = 2;
        foreach ($resources as $resource) {
            $sheet->fromArray([
                $resource->id,
                $resource->title,
                $resource->project_category,
                $resource->urgency,
                $resource->description,
                $resource->estimated_budget,
                $resource->beneficiaries,
                $resource->province_name,
                $resource->district_name,
                $resource->municipality_name,
                $resource->ward_number,
                $resource->tole,
                $resource->person_name,
                $resource->person_email,
                $resource->person_phone,
                $resource->is_bookmarked ? 'Yes' : 'No',
                $resource->is_important ? 'Yes' : 'No',
                $resource->created_at?->format('Y-m-d'),
            ], null, "A{$row}");
            $row++;
        }

        foreach (range('A', 'R') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'community-projects-' . now()->format('Y-m-d-His') . '.xlsx';

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0',
        ]);
    }

    public function exportPdf(Request $request): HttpResponse
    {
        $resources = $this->getFilteredResourcesForExport($request);

        $pdf = Pdf::loadView('exports.resources', [
            'resources' => $resources,
            'exportDate' => now()->format('F j, Y'),
            'filters' => $this->getActiveFilters($request),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('community-projects-' . now()->format('Y-m-d-His') . '.pdf');
    }

    public function downloadPdf(Resource $resource): HttpResponse
    {
        $this->hydrateLocationNames(collect([$resource]));
        $resource->load('photos');

        $pdf = Pdf::loadView('exports.resource-detail', [
            'resource' => $resource,
            'exportDate' => now()->format('F j, Y'),
        ])->setPaper('a4');

        return $pdf->download('project-' . $resource->id . '-' . str($resource->title)->slug() . '.pdf');
    }

    public function toggleBookmark(Resource $resource)
    {
        $resource->forceFill([
            'is_bookmarked' => ! $resource->is_bookmarked,
            'bookmarked_at' => $resource->is_bookmarked ? null : now(),
        ])->save();

        return back()->with('success', $resource->is_bookmarked ? 'Project bookmarked.' : 'Project removed from bookmarks.');
    }

    public function toggleImportant(Resource $resource)
    {
        $resource->forceFill([
            'is_important' => ! $resource->is_important,
        ])->save();

        return back()->with('success', $resource->is_important ? 'Project marked important.' : 'Project unmarked as important.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $provinceHelper = new Province('en');
        return Inertia::render('resources/create', [
            'provinces' => collect($provinceHelper->allProvinces())->map(fn($p) => [
                'id' => is_array($p) ? $p['id'] : $p->id,
                'name' => is_array($p) ? $p['name'] : $p->name
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ResourceRequest $request)
    {
        $resource = Resource::create($request->validated());

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('resources/photos', 'public');
                $resource->photos()->create(['photo_path' => $path]);
            }
        }

        if ($request->user()->hasPermission('view-resources') || $request->user()->hasRole('administrator')) {
            return redirect()->route('resources.index')->with('success', 'Resource created successfully.');
        }

        return redirect()->route('dashboard')->with('success', 'Resource created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Resource $resource)
    {
        $provinceHelper = new Province('en');
        $districtHelper = new District('en');
        $municipalityHelper = new Municipality('en');

        $resource->load('photos');
        $resource->province_name = $this->getLocationName($provinceHelper->find($resource->province_id));
        $resource->district_name = $this->getLocationName($districtHelper->find($resource->district_id));
        $resource->municipality_name = $this->getLocationName($municipalityHelper->find($resource->municipality_id));

        return Inertia::render('resources/show', [
            'resource' => $resource,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Resource $resource)
    {
        $provinceHelper = new Province('en');
        $districtHelper = new District('en');
        $municipalityHelper = new Municipality('en');

        $resource->load('photos');

        // Get initial lists for editing
        $provinces = collect($provinceHelper->allProvinces())->map(fn($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name
        ]);
        $districts = collect($districtHelper->getDistrictsByProvince($resource->province_id))->map(fn($d) => [
            'id' => is_array($d) ? $d['id'] : $d->id,
            'name' => is_array($d) ? $d['name'] : $d->name
        ]);
        $municipalities = collect($municipalityHelper->getMunicipalitiesByDistrict($resource->district_id))->map(fn($m) => [
            'id' => is_array($m) ? $m['id'] : $m->id,
            'name' => is_array($m) ? $m['name'] : $m->name
        ]);

        return Inertia::render('resources/edit', [
            'resource' => $resource,
            'provinces' => $provinces,
            'initialDistricts' => $districts,
            'initialMunicipalities' => $municipalities,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ResourceRequest $request, Resource $resource)
    {
        $resource->update($request->validated());

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('resources/photos', 'public');
                $resource->photos()->create(['photo_path' => $path]);
            }
        }

        if ($request->user()->hasPermission('view-resources') || $request->user()->hasRole('administrator')) {
            return redirect()->route('resources.index')->with('success', 'Resource updated successfully.');
        }

        return redirect()->route('dashboard')->with('success', 'Resource updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Resource $resource): RedirectResponse
    {
        $resource->delete();

        if (request()->user()->hasPermission('view-resources') || request()->user()->hasRole('administrator')) {
            return redirect()->route('resources.index')->with('success', 'Project moved to recycle bin.');
        }

        return redirect()->route('dashboard')->with('success', 'Project moved to recycle bin.');
    }

    /**
     * Remove a specific photo.
     */
    public function destroyPhoto(ResourcePhoto $photo)
    {
        $photo->delete();

        return back()->with('success', 'Photo moved to recycle bin.');
    }

    private function applyResourceFilters($query, Request $request): void
    {
        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('person_name', 'like', "%{$search}%")
                    ->orWhere('person_email', 'like', "%{$search}%")
                    ->orWhere('person_phone', 'like', "%{$search}%")
                    ->orWhere('project_category', 'like', "%{$search}%")
                    ->orWhere('urgency', 'like', "%{$search}%");
            });
        }

        if ($request->filled('province_id') && $request->province_id !== 'all') {
            $query->where('province_id', $request->province_id);
        }
        if ($request->filled('district_id') && $request->district_id !== 'all') {
            $query->where('district_id', $request->district_id);
        }
        if ($request->filled('municipality_id') && $request->municipality_id !== 'all') {
            $query->where('municipality_id', $request->municipality_id);
        }
        if ($request->filled('ward_number') && $request->ward_number !== 'all') {
            $query->where('ward_number', $request->ward_number);
        }
        if ($request->input('status') === 'bookmarked') {
            $query->where('is_bookmarked', true);
        }
        if ($request->input('status') === 'important') {
            $query->where('is_important', true);
        }
    }

    private function getFilteredResourcesForExport(Request $request)
    {
        $query = Resource::query()->with('photos')->latest();

        if ($request->boolean('only_bookmarked')) {
            $query->where('is_bookmarked', true);
        }

        if ($request->boolean('trashed')) {
            $query->onlyTrashed();
        }

        $this->applyResourceFilters($query, $request);

        $resources = $query->get();
        $this->hydrateLocationNames($resources);

        return $resources;
    }

    private function hydrateLocationNames($resources): void
    {
        $provinceHelper = new Province('en');
        $districtHelper = new District('en');
        $municipalityHelper = new Municipality('en');

        foreach ($resources as $resource) {
            $resource->province_name = $this->getLocationName($provinceHelper->find($resource->province_id));
            $resource->district_name = $this->getLocationName($districtHelper->find($resource->district_id));
            $resource->municipality_name = $this->getLocationName($municipalityHelper->find($resource->municipality_id));
        }
    }

    private function getActiveFilters(Request $request): array
    {
        $filters = [];

        foreach (['search' => 'Search', 'status' => 'Status', 'ward_number' => 'Ward'] as $key => $label) {
            if ($request->filled($key) && $request->input($key) !== 'all') {
                $filters[$label] = $request->input($key);
            }
        }

        if ($request->boolean('only_bookmarked')) {
            $filters['Bookmarked'] = 'Yes';
        }

        if ($request->boolean('trashed')) {
            $filters['Recycle Bin'] = 'Deleted records only';
        }

        return $filters;
    }

    private function getProvincesForSelect(Province $provinceHelper)
    {
        return collect($provinceHelper->allProvinces())->map(fn($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name
        ])->values();
    }

    /**
     * Get name from location object/array safely.
     */
    private function getLocationName(mixed $location): string
    {
        if (is_object($location)) {
            return $location->name ?? 'Unknown';
        }
        if (is_array($location)) {
            return $location['name'] ?? 'Unknown';
        }
        return 'Unknown';
    }
}
