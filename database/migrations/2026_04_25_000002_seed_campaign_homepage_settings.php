<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $settings = [
            'campaign_notification_email' => config('mail.from.address'),
            'campaign_whatsapp_number' => '',
            'campaign_office_address' => 'Nepal',
            'homepage_eyebrow' => 'Nepali Congress Digital Headquarters',
            'homepage_primary_message' => 'A disciplined campaign for democracy, development, and accountable local action.',
            'homepage_secondary_message' => 'Inspired by modern global campaign platforms: clear message, strong biography, issue priorities, rapid response, volunteer pathways, and direct supporter communication.',
            'campaign_issue_1_title' => 'Clean Governance',
            'campaign_issue_1_description' => 'Transparent public service, measurable delivery, and citizen-first decision making.',
            'campaign_issue_2_title' => 'Jobs & Local Economy',
            'campaign_issue_2_description' => 'Youth opportunity, small enterprise support, agriculture modernization, and local infrastructure.',
            'campaign_issue_3_title' => 'Education & Health',
            'campaign_issue_3_description' => 'Better schools, accessible health services, digital learning, and dignity for families.',
            'campaign_issue_4_title' => 'Community Projects',
            'campaign_issue_4_description' => 'Ward-level project intake using official province, district, municipality, and ward data.',
        ];

        foreach ($settings as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'type' => 'text', 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'campaign_notification_email',
            'campaign_whatsapp_number',
            'campaign_office_address',
            'homepage_eyebrow',
            'homepage_primary_message',
            'homepage_secondary_message',
            'campaign_issue_1_title',
            'campaign_issue_1_description',
            'campaign_issue_2_title',
            'campaign_issue_2_description',
            'campaign_issue_3_title',
            'campaign_issue_3_description',
            'campaign_issue_4_title',
            'campaign_issue_4_description',
        ])->delete();
    }
};
