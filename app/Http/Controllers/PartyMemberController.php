<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartyMemberRequest;
use App\Models\PartyMember;
use App\Models\PartyMemberType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Sagautam5\LocalStateNepal\Entities\District;
use Sagautam5\LocalStateNepal\Entities\Municipality;
use Sagautam5\LocalStateNepal\Entities\Province;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PartyMemberController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-members')->only(['index', 'show', 'recycle', 'template', 'exportExcel', 'exportPdf', 'getCountries', 'sendEmail']);
        $this->middleware('permission:create-members')->only(['create', 'store', 'import']);
        $this->middleware('permission:update-members')->only(['edit', 'update', 'restore', 'bulkRestore']);
        $this->middleware('permission:delete-members')->only(['destroy', 'bulkDestroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $query = PartyMember::with('partyMemberType')
            ->filter(request()->only(['province_id', 'district_id', 'municipality_id', 'ward_number', 'party_member_type_id', 'lives_abroad']))
            ->latest();

        $partyMembers = $query->paginate(15)->withQueryString();

        // Calculate Stats
        $stats = [
            'total_members' => PartyMember::count(),
            'by_gender' => PartyMember::selectRaw('gender, count(*) as count')
                ->groupBy('gender')
                ->pluck('count', 'gender'),
            'by_type' => PartyMember::selectRaw('party_member_types.name, count(*) as count')
                ->join('party_member_types', 'party_members.party_member_type_id', '=', 'party_member_types.id')
                ->groupBy('party_member_types.name')
                ->pluck('count', 'name'),
            'lives_abroad' => PartyMember::where('lives_abroad', true)->count(),
        ];

        // Get provinces for filter
        $provinceHelper = new Province('en');
        $provinces = collect($provinceHelper->allProvinces())->map(fn($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name
        ])->values();

        // Get member types for filter
        $memberTypes = PartyMemberType::select('id', 'name')->get();

        return Inertia::render('party-members/index', [
            'partyMembers' => $partyMembers,
            'filters' => request()->all(['province_id', 'district_id', 'municipality_id', 'ward_number', 'party_member_type_id', 'lives_abroad']),
            'stats' => $stats,
            'provinces' => $provinces,
            'memberTypes' => $memberTypes,
        ]);
    }

    public function recycle(Request $request): Response
    {
        $query = PartyMember::onlyTrashed()
            ->with('partyMemberType')
            ->filter($request->only(['province_id', 'district_id', 'municipality_id', 'ward_number', 'party_member_type_id', 'lives_abroad']))
            ->latest('deleted_at');

        $partyMembers = $query->paginate(15)->withQueryString();

        $provinceHelper = new Province('en');
        $provinces = collect($provinceHelper->allProvinces())->map(fn($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name
        ])->values();

        return Inertia::render('party-members/recycle', [
            'partyMembers' => $partyMembers,
            'filters' => $request->all(['province_id', 'district_id', 'municipality_id', 'ward_number', 'party_member_type_id', 'lives_abroad']),
            'stats' => [
                'deleted' => PartyMember::onlyTrashed()->count(),
                'lives_abroad' => PartyMember::onlyTrashed()->where('lives_abroad', true)->count(),
                'by_type' => PartyMember::onlyTrashed()
                    ->selectRaw('party_member_types.name, count(*) as count')
                    ->join('party_member_types', 'party_members.party_member_type_id', '=', 'party_member_types.id')
                    ->groupBy('party_member_types.name')
                    ->pluck('count', 'name'),
            ],
            'provinces' => $provinces,
            'memberTypes' => PartyMemberType::select('id', 'name')->get(),
        ]);
    }

    public function template(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $headers = [
            'full_name',
            'gender',
            'phone',
            'email',
            'occupation',
            'party_member_type_id',
            'date_of_birth',
            'joined_nc_at',
            'permanent_province_id',
            'permanent_district_id',
            'permanent_municipality_id',
            'permanent_ward_number',
            'permanent_tole',
            'is_temp_same_as_perm',
            'province_id',
            'district_id',
            'municipality_id',
            'ward_number',
            'tole',
            'lives_abroad',
            'country',
            'facebook_url',
            'twitter_url',
            'instagram_url',
            'tiktok_url',
            'linkedin_url',
        ];

        $sheet->fromArray($headers, null, 'A1');
        $sheet->fromArray([
            'Sita Sharma',
            'female',
            '9800000000',
            'sita@example.com',
            'Teacher',
            PartyMemberType::query()->value('id') ?? 1,
            '1990-01-15',
            now()->format('Y-m-d'),
            1,
            1,
            101,
            5,
            'Main tole',
            'yes',
            1,
            1,
            101,
            5,
            'Main tole',
            'no',
            '',
            '',
            '',
            '',
            '',
            '',
        ], null, 'A2');

        $sheet->getStyle('A1:Z1')->getFont()->setBold(true);
        foreach (range('A', 'Z') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="party-members-upload-template.xlsx"',
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

        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            $data = array_combine($headers, array_values($row));
            if (!$data) {
                $skipped++;
                continue;
            }

            $payload = $this->normalizeMemberImportRow($data);

            if (!$this->isValidMemberImportPayload($payload)) {
                $skipped++;
                continue;
            }

            $member = PartyMember::withTrashed()->where('email', $payload['email'])->first();

            if ($member) {
                $member->fill($payload);
                if ($member->trashed()) {
                    $member->restore();
                }
                $member->save();
                $updated++;
                continue;
            }

            PartyMember::create($payload);
            $created++;
        }

        return back()->with('success', "{$created} member(s) created. {$updated} member(s) updated/restored. {$skipped} row(s) skipped.");
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:party_members,id'],
        ]);

        PartyMember::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', count($validated['ids']) . ' member(s) moved to recycle bin.');
    }

    public function restore(int $partyMember): RedirectResponse
    {
        $partyMember = PartyMember::withTrashed()->findOrFail($partyMember);
        $partyMember->restore();

        return back()->with('success', 'Party member restored successfully.');
    }

    public function bulkRestore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
        ]);

        $restored = PartyMember::onlyTrashed()
            ->whereIn('id', $validated['ids'])
            ->restore();

        return back()->with('success', $restored . ' member(s) restored successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $province = new Province('en');
        $provinces = collect($province->allProvinces())->map(fn ($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name,
        ]);

        $partyMemberTypes = PartyMemberType::all(['id', 'name', 'description']);

        return Inertia::render('party-members/create', [
            'provinces' => $provinces,
            'partyMemberTypes' => $partyMemberTypes,
            'countries' => $this->getCountries(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePartyMemberRequest $request): RedirectResponse
    {
        PartyMember::create($request->validated());

        if ($request->user()->hasPermission('view-members') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('party-members.index')
                ->with('success', 'Party member created successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Party member created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PartyMember $partyMember): Response
    {
        $partyMember->load('partyMemberType');

        // Default values
        $provinceName = 'N/A';
        $districtName = 'N/A';
        $municipalityName = 'N/A';

        if (!$partyMember->lives_abroad) {
            $province = new Province('en');
            $district = new District('en');
            $municipality = new Municipality('en');

            $provinceData = collect($province->allProvinces())
                ->first(fn ($p) => (is_array($p) ? $p['id'] : $p->id) == $partyMember->province_id);
            $provinceName = $provinceData ? (is_array($provinceData) ? $provinceData['name'] : $provinceData->name) : 'N/A';

            $districtData = collect($district->allDistricts())
                ->first(fn ($d) => (is_array($d) ? $d['id'] : $d->id) == $partyMember->district_id);
            $districtName = $districtData ? (is_array($districtData) ? $districtData['name'] : $districtName = $districtData->name) : 'N/A';

            $municipalityData = collect($municipality->allMunicipalities())
                ->first(fn ($m) => (is_array($m) ? $m['id'] : $m->id) == $partyMember->municipality_id);
            $municipalityName = $municipalityData ? (is_array($municipalityData) ? $municipalityData['name'] : $municipalityData->name) : 'N/A';
        }

        // Permanent address
        $permProvinceName = 'N/A';
        $permDistrictName = 'N/A';
        $permMunicipalityName = 'N/A';

        if ($partyMember->permanent_province_id) {
            $province = new Province('en');
            $district = new District('en');
            $municipality = new Municipality('en');

            $pData = collect($province->allProvinces())->first(fn($p) => (is_array($p) ? $p['id'] : $p->id) == $partyMember->permanent_province_id);
            $permProvinceName = $pData ? (is_array($pData) ? $pData['name'] : $pData->name) : 'N/A';

            $dData = collect($district->allDistricts())->first(fn($d) => (is_array($d) ? $d['id'] : $d->id) == $partyMember->permanent_district_id);
            $permDistrictName = $dData ? (is_array($dData) ? $dData['name'] : $dData->name) : 'N/A';

            $mData = collect($municipality->allMunicipalities())->first(fn($m) => (is_array($m) ? $m['id'] : $m->id) == $partyMember->permanent_municipality_id);
            $permMunicipalityName = $mData ? (is_array($mData) ? $mData['name'] : $mData->name) : 'N/A';
        }

        return Inertia::render('party-members/show', [
            'partyMember' => $partyMember,
            'location' => [
                'province' => $provinceName,
                'district' => $districtName,
                'municipality' => $municipalityName,
            ],
            'permLocation' => [
                'province' => $permProvinceName,
                'district' => $permDistrictName,
                'municipality' => $permMunicipalityName,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PartyMember $partyMember): Response
    {
        $province = new Province('en');
        $district = new District('en');
        $municipality = new Municipality('en');

        $provinces = collect($province->allProvinces())->map(fn ($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name,
        ]);

        $districts = collect($district->getDistrictsByProvince($partyMember->province_id))->map(fn ($d) => [
            'id' => is_array($d) ? $d['id'] : $d->id,
            'name' => is_array($d) ? $d['name'] : $d->name,
        ]);

        $municipalities = collect($municipality->getMunicipalitiesByDistrict($partyMember->district_id))->map(fn ($m) => [
            'id' => is_array($m) ? $m['id'] : $m->id,
            'name' => is_array($m) ? $m['name'] : $m->name,
        ]);

        // Permanent address locations
        $permDistricts = collect($district->getDistrictsByProvince($partyMember->permanent_province_id))->map(fn ($d) => [
            'id' => is_array($d) ? $d['id'] : $d->id,
            'name' => is_array($d) ? $d['name'] : $d->name,
        ]);

        $permMunicipalities = collect($municipality->getMunicipalitiesByDistrict($partyMember->permanent_district_id))->map(fn ($m) => [
            'id' => is_array($m) ? $m['id'] : $m->id,
            'name' => is_array($m) ? $m['name'] : $m->name,
        ]);

        $partyMemberTypes = PartyMemberType::all(['id', 'name', 'description']);

        return Inertia::render('party-members/edit', [
            'partyMember' => $partyMember,
            'provinces' => $provinces,
            'districts' => $districts,
            'municipalities' => $municipalities,
            'permDistricts' => $permDistricts,
            'permMunicipalities' => $permMunicipalities,
            'partyMemberTypes' => $partyMemberTypes,
            'countries' => $this->getCountries(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StorePartyMemberRequest $request, PartyMember $partyMember): RedirectResponse
    {
        $partyMember->update($request->validated());

        if ($request->user()->hasPermission('view-members') || $request->user()->hasRole('administrator')) {
            return redirect()
                ->route('party-members.index')
                ->with('success', 'Party member updated successfully.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Party member updated successfully.');
    }

    /**
     * Send email to filtered members.
     */
    public function sendEmail(\Illuminate\Http\Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'attachment' => 'nullable|file|max:10240', // Max 10MB
            'filters' => 'nullable|array',
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('mail-attachments');
            $attachmentName = $request->file('attachment')->getClientOriginalName();
        }

        $filters = collect($validated['filters'] ?? [])
            ->only(['province_id', 'district_id', 'municipality_id', 'ward_number', 'party_member_type_id', 'lives_abroad'])
            ->reject(fn ($value) => $value === null || $value === '' || $value === 'all')
            ->all();

        \App\Jobs\SendPartyMemberEmails::dispatch(
            $validated['subject'],
            $validated['content'],
            $filters,
            $attachmentPath,
            $attachmentName
        );

        return redirect()
            ->back()
            ->with('success', 'Email sending process has been started for selected members.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PartyMember $partyMember): RedirectResponse
    {
        $partyMember->delete();

        if (request()->user()->hasPermission('view-members') || request()->user()->hasRole('administrator')) {
            return redirect()
                ->route('party-members.index')
                ->with('success', 'Party member moved to recycle bin.');
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Party member moved to recycle bin.');
    }

    /**
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function normalizeMemberImportRow(array $data): array
    {
        $livesAbroad = $this->truthy($data['lives_abroad'] ?? false);
        $sameAsPermanent = $this->truthy($data['is_temp_same_as_perm'] ?? true);

        $payload = [
            'full_name' => trim((string) ($data['full_name'] ?? '')),
            'gender' => strtolower(trim((string) ($data['gender'] ?? ''))),
            'phone' => trim((string) ($data['phone'] ?? '')),
            'email' => strtolower(trim((string) ($data['email'] ?? ''))),
            'occupation' => $this->nullableString($data['occupation'] ?? null),
            'party_member_type_id' => (int) ($data['party_member_type_id'] ?? 0),
            'date_of_birth' => $this->dateValue($data['date_of_birth'] ?? null),
            'joined_nc_at' => $this->dateValue($data['joined_nc_at'] ?? null),
            'permanent_province_id' => (int) ($data['permanent_province_id'] ?? 0),
            'permanent_district_id' => (int) ($data['permanent_district_id'] ?? 0),
            'permanent_municipality_id' => (int) ($data['permanent_municipality_id'] ?? 0),
            'permanent_ward_number' => (int) ($data['permanent_ward_number'] ?? 0),
            'permanent_tole' => $this->nullableString($data['permanent_tole'] ?? null),
            'is_temp_same_as_perm' => $sameAsPermanent,
            'province_id' => (int) ($data['province_id'] ?? 0),
            'district_id' => (int) ($data['district_id'] ?? 0),
            'municipality_id' => (int) ($data['municipality_id'] ?? 0),
            'ward_number' => (int) ($data['ward_number'] ?? 0),
            'tole' => $this->nullableString($data['tole'] ?? null),
            'lives_abroad' => $livesAbroad,
            'country' => $this->nullableString($data['country'] ?? null),
            'facebook_url' => $this->nullableString($data['facebook_url'] ?? null),
            'twitter_url' => $this->nullableString($data['twitter_url'] ?? null),
            'instagram_url' => $this->nullableString($data['instagram_url'] ?? null),
            'tiktok_url' => $this->nullableString($data['tiktok_url'] ?? null),
            'linkedin_url' => $this->nullableString($data['linkedin_url'] ?? null),
            'address_type' => 'permanent',
        ];

        if ($livesAbroad) {
            $payload['province_id'] = null;
            $payload['district_id'] = null;
            $payload['municipality_id'] = null;
            $payload['ward_number'] = null;
            $payload['tole'] = null;
        } elseif ($sameAsPermanent) {
            $payload['province_id'] = $payload['permanent_province_id'];
            $payload['district_id'] = $payload['permanent_district_id'];
            $payload['municipality_id'] = $payload['permanent_municipality_id'];
            $payload['ward_number'] = $payload['permanent_ward_number'];
            $payload['tole'] = $payload['permanent_tole'];
        }

        return $payload;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function isValidMemberImportPayload(array $payload): bool
    {
        if (!$payload['full_name'] || !in_array($payload['gender'], ['male', 'female', 'other'], true)) {
            return false;
        }

        if (!$payload['phone'] || !filter_var($payload['email'], FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        if (!$payload['party_member_type_id'] || !PartyMemberType::whereKey($payload['party_member_type_id'])->exists()) {
            return false;
        }

        if (!$payload['date_of_birth'] || !$payload['permanent_province_id'] || !$payload['permanent_district_id'] || !$payload['permanent_municipality_id'] || !$payload['permanent_ward_number']) {
            return false;
        }

        if ($payload['lives_abroad']) {
            return (bool) $payload['country'];
        }

        return (bool) ($payload['province_id'] && $payload['district_id'] && $payload['municipality_id'] && $payload['ward_number']);
    }

    private function nullableString(mixed $value): ?string
    {
        $value = trim((string) $value);
        return $value === '' ? null : $value;
    }

    private function truthy(mixed $value): bool
    {
        return in_array(strtolower(trim((string) $value)), ['1', 'true', 'yes', 'y', 'on'], true);
    }

    private function dateValue(mixed $value): ?string
    {
        if (!$value) {
            return null;
        }

        if (is_numeric($value)) {
            return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $value)->format('Y-m-d');
        }

        try {
            return \Illuminate\Support\Carbon::parse((string) $value)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Get list of countries for abroad members.
     *
     * @return array<int, array{code: string, name: string}>
     */
    private function getCountries(): array
    {
        return [
            ['code' => 'AF', 'name' => 'Afghanistan'],
            ['code' => 'AL', 'name' => 'Albania'],
            ['code' => 'DZ', 'name' => 'Algeria'],
            ['code' => 'AR', 'name' => 'Argentina'],
            ['code' => 'AU', 'name' => 'Australia'],
            ['code' => 'AT', 'name' => 'Austria'],
            ['code' => 'BD', 'name' => 'Bangladesh'],
            ['code' => 'BE', 'name' => 'Belgium'],
            ['code' => 'BT', 'name' => 'Bhutan'],
            ['code' => 'BR', 'name' => 'Brazil'],
            ['code' => 'BN', 'name' => 'Brunei'],
            ['code' => 'KH', 'name' => 'Cambodia'],
            ['code' => 'CA', 'name' => 'Canada'],
            ['code' => 'CN', 'name' => 'China'],
            ['code' => 'CY', 'name' => 'Cyprus'],
            ['code' => 'CZ', 'name' => 'Czech Republic'],
            ['code' => 'DK', 'name' => 'Denmark'],
            ['code' => 'EG', 'name' => 'Egypt'],
            ['code' => 'FI', 'name' => 'Finland'],
            ['code' => 'FR', 'name' => 'France'],
            ['code' => 'DE', 'name' => 'Germany'],
            ['code' => 'GR', 'name' => 'Greece'],
            ['code' => 'HK', 'name' => 'Hong Kong'],
            ['code' => 'HU', 'name' => 'Hungary'],
            ['code' => 'IS', 'name' => 'Iceland'],
            ['code' => 'IN', 'name' => 'India'],
            ['code' => 'ID', 'name' => 'Indonesia'],
            ['code' => 'IE', 'name' => 'Ireland'],
            ['code' => 'IL', 'name' => 'Israel'],
            ['code' => 'IT', 'name' => 'Italy'],
            ['code' => 'JP', 'name' => 'Japan'],
            ['code' => 'JO', 'name' => 'Jordan'],
            ['code' => 'KW', 'name' => 'Kuwait'],
            ['code' => 'LV', 'name' => 'Latvia'],
            ['code' => 'LB', 'name' => 'Lebanon'],
            ['code' => 'LT', 'name' => 'Lithuania'],
            ['code' => 'LU', 'name' => 'Luxembourg'],
            ['code' => 'MO', 'name' => 'Macau'],
            ['code' => 'MY', 'name' => 'Malaysia'],
            ['code' => 'MV', 'name' => 'Maldives'],
            ['code' => 'MT', 'name' => 'Malta'],
            ['code' => 'MX', 'name' => 'Mexico'],
            ['code' => 'MM', 'name' => 'Myanmar'],
            ['code' => 'NL', 'name' => 'Netherlands'],
            ['code' => 'NZ', 'name' => 'New Zealand'],
            ['code' => 'NO', 'name' => 'Norway'],
            ['code' => 'OM', 'name' => 'Oman'],
            ['code' => 'PK', 'name' => 'Pakistan'],
            ['code' => 'PH', 'name' => 'Philippines'],
            ['code' => 'PL', 'name' => 'Poland'],
            ['code' => 'PT', 'name' => 'Portugal'],
            ['code' => 'QA', 'name' => 'Qatar'],
            ['code' => 'RO', 'name' => 'Romania'],
            ['code' => 'RU', 'name' => 'Russia'],
            ['code' => 'SA', 'name' => 'Saudi Arabia'],
            ['code' => 'SG', 'name' => 'Singapore'],
            ['code' => 'SK', 'name' => 'Slovakia'],
            ['code' => 'SI', 'name' => 'Slovenia'],
            ['code' => 'ZA', 'name' => 'South Africa'],
            ['code' => 'KR', 'name' => 'South Korea'],
            ['code' => 'ES', 'name' => 'Spain'],
            ['code' => 'LK', 'name' => 'Sri Lanka'],
            ['code' => 'SE', 'name' => 'Sweden'],
            ['code' => 'CH', 'name' => 'Switzerland'],
            ['code' => 'TW', 'name' => 'Taiwan'],
            ['code' => 'TH', 'name' => 'Thailand'],
            ['code' => 'TR', 'name' => 'Turkey'],
            ['code' => 'AE', 'name' => 'United Arab Emirates'],
            ['code' => 'GB', 'name' => 'United Kingdom'],
            ['code' => 'US', 'name' => 'United States'],
            ['code' => 'VN', 'name' => 'Vietnam'],
        ];
    }
}
