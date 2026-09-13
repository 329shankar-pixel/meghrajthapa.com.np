<?php

namespace App\Support;

use App\Models\Setting;
use Sagautam5\LocalStateNepal\Entities\District;
use Sagautam5\LocalStateNepal\Entities\Municipality;
use Sagautam5\LocalStateNepal\Entities\Province;

class LocationScope
{
    public static function payload(): array
    {
        $provinceId = Setting::get('location_scope_province_id');
        $districtId = Setting::get('location_scope_district_id');
        $municipalityId = Setting::get('location_scope_municipality_id');

        return [
            'province_id' => $provinceId ? (string) $provinceId : '',
            'district_id' => $districtId ? (string) $districtId : '',
            'municipality_id' => $municipalityId ? (string) $municipalityId : '',
        ];
    }

    public static function provinces(): array
    {
        $province = new Province('en');

        return collect($province->allProvinces())->map(fn ($item) => [
            'id' => is_array($item) ? $item['id'] : $item->id,
            'name' => is_array($item) ? $item['name'] : $item->name,
        ])->values()->all();
    }

    public static function districts(?int $provinceId): array
    {
        if (!$provinceId) {
            return [];
        }

        $district = new District('en');

        return collect($district->getDistrictsByProvince($provinceId))->map(fn ($item) => [
            'id' => is_array($item) ? $item['id'] : $item->id,
            'name' => is_array($item) ? $item['name'] : $item->name,
        ])->values()->all();
    }

    public static function municipalities(?int $districtId): array
    {
        if (!$districtId) {
            return [];
        }

        $municipality = new Municipality('en');

        return collect($municipality->getMunicipalitiesByDistrict($districtId))->map(fn ($item) => [
            'id' => is_array($item) ? $item['id'] : $item->id,
            'name' => is_array($item) ? $item['name'] : $item->name,
            'category_id' => is_array($item) ? $item['category_id'] : $item->category_id,
        ])->values()->all();
    }

    public static function adminOptions(): array
    {
        $scope = self::payload();

        return [
            'scope' => $scope,
            'provinces' => self::provinces(),
            'districts' => self::districts($scope['province_id'] ? (int) $scope['province_id'] : null),
            'municipalities' => self::municipalities($scope['district_id'] ? (int) $scope['district_id'] : null),
        ];
    }

    public static function applyTo(array $data, array $prefixes = ['']): array
    {
        $scope = self::payload();

        foreach ($prefixes as $prefix) {
            if ($scope['province_id']) {
                $data[$prefix.'province_id'] = $scope['province_id'];
            }

            if ($scope['district_id']) {
                $data[$prefix.'district_id'] = $scope['district_id'];
            }

            if ($scope['municipality_id']) {
                $data[$prefix.'municipality_id'] = $scope['municipality_id'];
            }
        }

        return $data;
    }
}
