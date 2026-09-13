<?php

namespace App\Http\Controllers;

use App\Models\PartyMember;
use App\Models\PartyMemberType;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Sagautam5\LocalStateNepal\Entities\District;
use Sagautam5\LocalStateNepal\Entities\Municipality;
use Sagautam5\LocalStateNepal\Entities\Province;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PartyMemberExportController extends Controller
{
    /**
     * Export filtered party members to Excel.
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $members = $this->getFilteredMembers($request);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Headers
        $headers = ['ID', 'Full Name', 'Gender', 'Phone', 'Email', 'Occupation', 'Member Type', 'Date of Birth', 'Joined At', 'Province', 'District', 'Municipality', 'Ward', 'Tole', 'Lives Abroad', 'Country'];
        $sheet->fromArray($headers, null, 'A1');

        // Style headers
        $sheet->getStyle('A1:P1')->getFont()->setBold(true);

        // Data
        $row = 2;
        foreach ($members as $member) {
            $sheet->fromArray([
                $member->id,
                $member->full_name,
                $member->gender,
                $member->phone,
                $member->email,
                $member->occupation,
                $member->partyMemberType?->name ?? 'N/A',
                $member->date_of_birth?->format('Y-m-d'),
                $member->joined_nc_at?->format('Y-m-d'),
                $member->province_name ?? 'N/A',
                $member->district_name ?? 'N/A',
                $member->municipality_name ?? 'N/A',
                $member->ward_number,
                $member->tole,
                $member->lives_abroad ? 'Yes' : 'No',
                $member->country ?? 'Nepal',
            ], null, "A{$row}");
            $row++;
        }

        // Auto-size columns
        foreach (range('A', 'P') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        $filename = 'party-members-' . now()->format('Y-m-d-His') . '.xlsx';

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Export filtered party members to PDF.
     */
    public function exportPdf(Request $request): HttpResponse
    {
        $members = $this->getFilteredMembers($request);

        $pdf = Pdf::loadView('exports.party-members', [
            'members' => $members,
            'exportDate' => now()->format('F j, Y'),
            'filters' => $this->getActiveFilters($request),
        ]);

        $pdf->setPaper('a4', 'landscape');

        $filename = 'party-members-' . now()->format('Y-m-d-His') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Get filtered members with location names.
     */
    private function getFilteredMembers(Request $request)
    {
        $query = PartyMember::with('partyMemberType')->latest();

        if ($request->boolean('trashed')) {
            $query->onlyTrashed();
        }

        // Apply filters
        if ($request->province_id && $request->province_id !== 'all') {
            $query->where('province_id', $request->province_id);
        }
        if ($request->district_id && $request->district_id !== 'all') {
            $query->where('district_id', $request->district_id);
        }
        if ($request->municipality_id && $request->municipality_id !== 'all') {
            $query->where('municipality_id', $request->municipality_id);
        }
        if ($request->ward_number && $request->ward_number !== 'all') {
            $query->where('ward_number', $request->ward_number);
        }
        if ($request->party_member_type_id && $request->party_member_type_id !== 'all') {
            $query->where('party_member_type_id', $request->party_member_type_id);
        }
        if ($request->lives_abroad && $request->lives_abroad !== 'all') {
            $query->where('lives_abroad', $request->lives_abroad === 'yes');
        }

        $members = $query->get();

        // Add location names
        $province = new Province('en');
        $district = new District('en');
        $municipality = new Municipality('en');

        $provinces = collect($province->allProvinces());
        $districts = collect($district->allDistricts());
        $municipalities = collect($municipality->allMunicipalities());

        foreach ($members as $member) {
            $member->province_name = $this->getLocationName($provinces, $member->province_id);
            $member->district_name = $this->getLocationName($districts, $member->district_id);
            $member->municipality_name = $this->getLocationName($municipalities, $member->municipality_id);
        }

        return $members;
    }

    private function getLocationName($items, $id): string
    {
        if (!$id) {
            return 'N/A';
        }
        $item = $items->first(fn($p) => (is_array($p) ? $p['id'] : $p->id) == $id);
        return $item ? (is_array($item) ? $item['name'] : $item->name) : 'N/A';
    }

    private function getActiveFilters(Request $request): array
    {
        $filters = [];

        if ($request->province_id && $request->province_id !== 'all') {
            $province = new Province('en');
            $provinces = collect($province->allProvinces());
            $filters['Province'] = $this->getLocationName($provinces, $request->province_id);
        }

        if ($request->party_member_type_id && $request->party_member_type_id !== 'all') {
            $type = PartyMemberType::find($request->party_member_type_id);
            $filters['Member Type'] = $type?->name ?? 'Unknown';
        }

        if ($request->lives_abroad && $request->lives_abroad !== 'all') {
            $filters['Lives Abroad'] = $request->lives_abroad === 'yes' ? 'Yes' : 'No';
        }

        if ($request->boolean('trashed')) {
            $filters['Recycle Bin'] = 'Deleted records only';
        }

        return $filters;
    }
}
