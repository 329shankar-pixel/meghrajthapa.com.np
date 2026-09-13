<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $partyName = DB::table('settings')->where('key', 'party_name')->value('value');
        $currentLabel = DB::table('settings')->where('key', 'campaign_label')->value('value');

        if (! $currentLabel || ($partyName && $currentLabel === "{$partyName} Campaign")) {
            DB::table('settings')->updateOrInsert(
                ['key' => 'campaign_label'],
                [
                    'value' => 'Nepali Congress Campaign',
                    'type' => 'text',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        //
    }
};
