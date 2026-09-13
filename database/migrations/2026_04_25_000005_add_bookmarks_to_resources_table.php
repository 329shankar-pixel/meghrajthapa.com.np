<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->boolean('is_bookmarked')->default(false)->after('user_agent')->index();
            $table->boolean('is_important')->default(false)->after('is_bookmarked')->index();
            $table->timestamp('bookmarked_at')->nullable()->after('is_important');
        });
    }

    public function down(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->dropColumn(['is_bookmarked', 'is_important', 'bookmarked_at']);
        });
    }
};
