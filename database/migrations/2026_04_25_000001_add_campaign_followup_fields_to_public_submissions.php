<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('team_members', function (Blueprint $table) {
            $table->string('preferred_contact_method')->default('phone')->after('message');
            $table->string('whatsapp_number', 30)->nullable()->after('preferred_contact_method');
            $table->string('whatsapp_url', 800)->nullable()->after('whatsapp_number');
            $table->timestamp('email_notified_at')->nullable()->after('status');
            $table->string('notification_status')->default('pending')->after('email_notified_at');
            $table->string('submitted_ip', 64)->nullable()->after('notification_status');
            $table->text('user_agent')->nullable()->after('submitted_ip');
        });

        Schema::table('resources', function (Blueprint $table) {
            $table->string('project_category')->nullable()->after('title');
            $table->string('urgency')->default('normal')->after('project_category');
            $table->string('estimated_budget')->nullable()->after('description');
            $table->string('beneficiaries')->nullable()->after('estimated_budget');
            $table->string('whatsapp_url', 800)->nullable()->after('person_phone');
            $table->timestamp('email_notified_at')->nullable()->after('whatsapp_url');
            $table->string('notification_status')->default('pending')->after('email_notified_at');
            $table->string('submitted_ip', 64)->nullable()->after('notification_status');
            $table->text('user_agent')->nullable()->after('submitted_ip');
        });

        Schema::table('volunteers', function (Blueprint $table) {
            $table->string('whatsapp_url', 800)->nullable()->after('ward_number');
            $table->timestamp('email_notified_at')->nullable()->after('whatsapp_url');
            $table->string('notification_status')->default('pending')->after('email_notified_at');
            $table->string('submitted_ip', 64)->nullable()->after('notification_status');
            $table->text('user_agent')->nullable()->after('submitted_ip');
        });
    }

    public function down(): void
    {
        Schema::table('team_members', function (Blueprint $table) {
            $table->dropColumn([
                'preferred_contact_method',
                'whatsapp_number',
                'whatsapp_url',
                'email_notified_at',
                'notification_status',
                'submitted_ip',
                'user_agent',
            ]);
        });

        Schema::table('resources', function (Blueprint $table) {
            $table->dropColumn([
                'project_category',
                'urgency',
                'estimated_budget',
                'beneficiaries',
                'whatsapp_url',
                'email_notified_at',
                'notification_status',
                'submitted_ip',
                'user_agent',
            ]);
        });

        Schema::table('volunteers', function (Blueprint $table) {
            $table->dropColumn([
                'whatsapp_url',
                'email_notified_at',
                'notification_status',
                'submitted_ip',
                'user_agent',
            ]);
        });
    }
};
