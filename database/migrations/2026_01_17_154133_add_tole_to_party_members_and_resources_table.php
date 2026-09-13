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
            $table->string('tole')->nullable()->after('ward_number');
        });

        Schema::table('resources', function (Blueprint $table) {
            $table->string('tole')->nullable()->after('ward_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('party_members', function (Blueprint $table) {
            $table->dropColumn('tole');
        });

        Schema::table('resources', function (Blueprint $table) {
            $table->dropColumn('tole');
        });
    }
};
