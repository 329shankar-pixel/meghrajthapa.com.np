<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Sagautam5\LocalStateNepal\Entities\District;
use Sagautam5\LocalStateNepal\Entities\Municipality;
use Sagautam5\LocalStateNepal\Entities\Province;

class LocationController extends Controller
{
    /**
     * Get all provinces.
     */
    public function getProvinces(): JsonResponse
    {
        $province = new Province('en');
        $provinces = collect($province->allProvinces())->map(fn ($p) => [
            'id' => is_array($p) ? $p['id'] : $p->id,
            'name' => is_array($p) ? $p['name'] : $p->name,
        ]);

        return response()->json($provinces);
    }

    /**
     * Get districts for a province.
     */
    public function getDistricts(int $provinceId): JsonResponse
    {
        $district = new District('en');
        $districts = collect($district->getDistrictsByProvince($provinceId))->map(fn ($d) => [
            'id' => is_array($d) ? $d['id'] : $d->id,
            'name' => is_array($d) ? $d['name'] : $d->name,
        ]);

        return response()->json($districts);
    }

    /**
     * Get municipalities for a district.
     */
    public function getMunicipalities(int $districtId): JsonResponse
    {
        $municipality = new Municipality('en');
        $municipalities = collect($municipality->getMunicipalitiesByDistrict($districtId))->map(fn ($m) => [
            'id' => is_array($m) ? $m['id'] : $m->id,
            'name' => is_array($m) ? $m['name'] : $m->name,
            'category_id' => is_array($m) ? $m['category_id'] : $m->category_id,
        ]);

        return response()->json($municipalities);
    }
}
