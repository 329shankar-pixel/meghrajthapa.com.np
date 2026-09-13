<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PartyMemberTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\PartyMemberType::firstOrCreate(
            ['name' => 'NSU'],
            ['description' => 'Nepal Students Union']
        );

        \App\Models\PartyMemberType::firstOrCreate(
            ['name' => 'Tarun Dal'],
            ['description' => 'Nepali Congress Youth Wing']
        );
    }
}
