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
        Schema::create('leader_videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leader_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('youtube_url');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leader_videos');
    }
};
