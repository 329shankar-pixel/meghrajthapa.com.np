<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('party_members', function (Blueprint $table) {
            $table->unsignedInteger('province_id')->nullable()->change();
            $table->unsignedInteger('district_id')->nullable()->change();
            $table->unsignedInteger('municipality_id')->nullable()->change();
            $table->unsignedInteger('ward_number')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('party_members', function (Blueprint $table) {
            $table->unsignedInteger('province_id')->nullable(false)->change();
            $table->unsignedInteger('district_id')->nullable(false)->change();
            $table->unsignedInteger('municipality_id')->nullable(false)->change();
            $table->unsignedInteger('ward_number')->nullable(false)->change();
        });
    }
};
