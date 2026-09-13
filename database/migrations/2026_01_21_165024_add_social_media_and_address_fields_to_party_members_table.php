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
            // Social Media Links (all optional)
            $table->string('facebook_url')->nullable()->after('tole');
            $table->string('twitter_url')->nullable()->after('facebook_url');
            $table->string('instagram_url')->nullable()->after('twitter_url');
            $table->string('tiktok_url')->nullable()->after('instagram_url');
            $table->string('linkedin_url')->nullable()->after('tiktok_url');

            // Address Type: permanent or temporary
            $table->enum('address_type', ['permanent', 'temporary'])->default('permanent')->after('linkedin_url');

            // Living abroad fields
            $table->boolean('lives_abroad')->default(false)->after('address_type');
            $table->string('country')->nullable()->after('lives_abroad');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('party_members', function (Blueprint $table) {
            $table->dropColumn([
                'facebook_url',
                'twitter_url',
                'instagram_url',
                'tiktok_url',
                'linkedin_url',
                'address_type',
                'lives_abroad',
                'country',
            ]);
        });
    }
};
