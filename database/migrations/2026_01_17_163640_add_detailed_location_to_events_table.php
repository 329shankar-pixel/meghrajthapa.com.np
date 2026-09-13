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
        Schema::table('events', function (Blueprint $table) {
            $table->unsignedBigInteger('province_id')->nullable()->after('location');
            $table->unsignedBigInteger('district_id')->nullable()->after('province_id');
            $table->unsignedBigInteger('municipality_id')->nullable()->after('district_id');
            $table->unsignedInteger('ward_number')->nullable()->after('municipality_id');
            $table->string('tole')->nullable()->after('ward_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['province_id', 'district_id', 'municipality_id', 'ward_number', 'tole']);
        });
    }
};
