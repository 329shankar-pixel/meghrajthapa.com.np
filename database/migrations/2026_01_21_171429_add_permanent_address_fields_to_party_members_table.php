<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('party_members', function (Blueprint $table) {
            // Permanent Address (Always Nepal-based for registration usually)
            $table->unsignedInteger('permanent_province_id')->nullable()->after('tole');
            $table->unsignedInteger('permanent_district_id')->nullable()->after('permanent_province_id');
            $table->unsignedInteger('permanent_municipality_id')->nullable()->after('permanent_district_id');
            $table->unsignedInteger('permanent_ward_number')->nullable()->after('permanent_municipality_id');
            $table->string('permanent_tole')->nullable()->after('permanent_ward_number');
            
            // Link toggle
            $table->boolean('is_temp_same_as_perm')->default(false)->after('permanent_tole');

            // Rename existing address fields to temporary_* for clarity (using change() is not always safe with all drivers, so we just prefix in logic or rename columns)
            // But to avoid breaking existing queries, I'll keep existing names as 'temporary' and add permanent.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('party_members', function (Blueprint $table) {
            $table->dropColumn([
                'permanent_province_id',
                'permanent_district_id',
                'permanent_municipality_id',
                'permanent_ward_number',
                'permanent_tole',
                'is_temp_same_as_perm',
            ]);
        });
    }
};
