<?php

use App\Http\Controllers\LocationController;
use App\Http\Controllers\PartyMemberController;
use App\Http\Controllers\PartyMemberTypeController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\EmailCenterController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Sitemap
Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index'])->name('sitemap');

// Public Routes
Route::get('/', [PublicController::class, 'index'])->name('home');
Route::post('/join-team', [PublicController::class, 'joinTeam'])->name('join-team');
Route::get('/joinnow', [\App\Http\Controllers\JoinController::class, 'index'])->name('join.index');
Route::post('/joinnow', [\App\Http\Controllers\JoinController::class, 'store'])->name('join.store');

// New Public Section Routes
Route::get('/biography', [PublicController::class, 'biography'])->name('public.biography');
Route::get('/updates/news', [PublicController::class, 'news'])->name('public.news');
Route::get('/updates/news/{news:slug}', [PublicController::class, 'newsShow'])->name('public.news.show');
Route::get('/updates/blog', [PublicController::class, 'blog'])->name('public.blog');
Route::get('/updates/blog/{post:slug}', [PublicController::class, 'blogShow'])->name('public.blog.show');
Route::get('/program/events', [PublicController::class, 'events'])->name('public.events');
Route::get('/program/activities', [PublicController::class, 'activities'])->name('public.activities');
Route::get('/media/galleries', [PublicController::class, 'galleries'])->name('public.galleries');
Route::get('/media/infographics', [PublicController::class, 'infographics'])->name('public.infographics');
Route::get('/media/videos', [PublicController::class, 'videos'])->name('public.videos');
Route::get('/public-resources/submit', [PublicController::class, 'resourceSubmit'])->name('public.resources.submit');
Route::post('/public-resources/submit', [PublicController::class, 'resourceStore'])->name('public.resources.store');

// Public Event Detail and Volunteer Registration
Route::get('/program/events/{event}', [PublicController::class, 'eventShow'])->name('public.events.show');
Route::post('/program/events/{event}/volunteer', [PublicController::class, 'volunteerStore'])->name('public.volunteer.store');

// Public Location API routes
Route::get('/api/provinces', [LocationController::class, 'getProvinces'])->name('api.provinces');
Route::get('/api/provinces/{province}/districts', [LocationController::class, 'getDistricts'])->name('api.districts');
Route::get('/api/districts/{district}/municipalities', [LocationController::class, 'getMunicipalities'])->name('api.municipalities');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Role and Permission routes
    Route::resource('roles', \App\Http\Controllers\RoleController::class);
    Route::resource('permissions', \App\Http\Controllers\PermissionController::class);
    Route::resource('users', \App\Http\Controllers\UserController::class);

    // Party Member routes
    // Removed middleware group closure, applied to individual routes if needed or in controller
    Route::post('party-members/send-email', [PartyMemberController::class, 'sendEmail'])->name('party-members.send-email');
    Route::get('party-members/recycle', [PartyMemberController::class, 'recycle'])->name('party-members.recycle');
    Route::post('party-members/bulk-delete', [PartyMemberController::class, 'bulkDestroy'])->name('party-members.bulk-delete');
    Route::post('party-members/bulk-restore', [PartyMemberController::class, 'bulkRestore'])->name('party-members.bulk-restore');
    Route::post('party-members/{partyMember}/restore', [PartyMemberController::class, 'restore'])->name('party-members.restore');
    Route::get('party-members-upload/template', [PartyMemberController::class, 'template'])->name('party-members.template');
    Route::post('party-members-upload/import', [PartyMemberController::class, 'import'])->name('party-members.import');
    Route::resource('party-members', PartyMemberController::class);
    Route::get('party-members-export/excel', [\App\Http\Controllers\PartyMemberExportController::class, 'exportExcel'])->name('party-members.export.excel');
    Route::get('party-members-export/pdf', [\App\Http\Controllers\PartyMemberExportController::class, 'exportPdf'])->name('party-members.export.pdf');

    Route::resource('party-member-types', PartyMemberTypeController::class);
    Route::resource('news', \App\Http\Controllers\NewsController::class);
    Route::resource('blog', \App\Http\Controllers\BlogController::class)->parameters(['blog' => 'post']);
    
    Route::resource('activities', \App\Http\Controllers\ActivityController::class);
    Route::delete('activity-photos/{photo}', [\App\Http\Controllers\ActivityController::class, 'destroyPhoto'])->name('activities.photos.destroy');

    Route::resource('events', \App\Http\Controllers\EventController::class);
    Route::get('events/{event}/export-volunteers-csv', [\App\Http\Controllers\EventController::class, 'exportVolunteersCsv'])->name('events.export-volunteers-csv');
    Route::get('events/{event}/export-volunteers-pdf', [\App\Http\Controllers\EventController::class, 'exportVolunteersPdf'])->name('events.export-volunteers-pdf');
    Route::post('events/{event}/send-volunteer-email', [\App\Http\Controllers\EventController::class, 'sendVolunteerEmail'])->name('events.send-volunteer-email');
    Route::resource('volunteers', \App\Http\Controllers\VolunteerController::class);

    Route::get('resources/bookmarks', [\App\Http\Controllers\ResourceController::class, 'bookmarks'])->name('resources.bookmarks');
    Route::get('resources/recycle', [\App\Http\Controllers\ResourceController::class, 'recycle'])->name('resources.recycle');
    Route::post('resources/bulk-delete', [\App\Http\Controllers\ResourceController::class, 'bulkDestroy'])->name('resources.bulk-delete');
    Route::post('resources/bulk-restore', [\App\Http\Controllers\ResourceController::class, 'bulkRestore'])->name('resources.bulk-restore');
    Route::post('resources/{resource}/restore', [\App\Http\Controllers\ResourceController::class, 'restore'])->name('resources.restore');
    Route::get('resources-upload/template', [\App\Http\Controllers\ResourceController::class, 'template'])->name('resources.template');
    Route::post('resources-upload/import', [\App\Http\Controllers\ResourceController::class, 'import'])->name('resources.import');
    Route::get('resources-export/excel', [\App\Http\Controllers\ResourceController::class, 'exportExcel'])->name('resources.export.excel');
    Route::get('resources-export/pdf', [\App\Http\Controllers\ResourceController::class, 'exportPdf'])->name('resources.export.pdf');
    Route::get('resources/{resource}/download-pdf', [\App\Http\Controllers\ResourceController::class, 'downloadPdf'])->name('resources.download-pdf');
    Route::resource('resources', \App\Http\Controllers\ResourceController::class);
    Route::post('resources/{resource}/bookmark', [\App\Http\Controllers\ResourceController::class, 'toggleBookmark'])->name('resources.toggle-bookmark');
    Route::post('resources/{resource}/important', [\App\Http\Controllers\ResourceController::class, 'toggleImportant'])->name('resources.toggle-important');
    Route::delete('resource-photos/{photo}', [\App\Http\Controllers\ResourceController::class, 'destroyPhoto'])->name('resources.photos.destroy');

    Route::get('email-center', [EmailCenterController::class, 'index'])->name('email-center.index');
    Route::post('email-center/send', [EmailCenterController::class, 'send'])->name('email-center.send');
    Route::get('email-center/{sentEmail}', [EmailCenterController::class, 'show'])->name('email-center.show');
    
    // Leader Routes
    Route::get('leader/create', [\App\Http\Controllers\LeaderController::class, 'create'])->name('leader.create');
    Route::post('leader', [\App\Http\Controllers\LeaderController::class, 'store'])->name('leader.store');
    Route::get('leader/profile', [\App\Http\Controllers\LeaderController::class, 'editProfile'])->name('leader.profile');
    Route::put('leader/profile', [\App\Http\Controllers\LeaderController::class, 'updateProfile'])->name('leader.update_profile');
    Route::get('leader/biography', [\App\Http\Controllers\LeaderController::class, 'editBiography'])->name('leader.biography');
    Route::put('leader/biography', [\App\Http\Controllers\LeaderController::class, 'updateBiography'])->name('leader.update_biography');
    
    // Quote Routes (Scoped to the single leader)
    Route::get('leader/quotes', [\App\Http\Controllers\QuoteController::class, 'index'])->name('leader.quotes');
    Route::post('quotes', [\App\Http\Controllers\QuoteController::class, 'store'])->name('quotes.store');
    Route::delete('quotes/{quote}', [\App\Http\Controllers\QuoteController::class, 'destroy'])->name('quotes.destroy');

    // Infographic Routes (Scoped to the single leader)
    Route::get('leader/infographics', [\App\Http\Controllers\InfographicController::class, 'index'])->name('leader.infographics');
    Route::post('infographics', [\App\Http\Controllers\InfographicController::class, 'store'])->name('infographics.store');
    Route::delete('infographics/{infographic}', [\App\Http\Controllers\InfographicController::class, 'destroy'])->name('infographics.destroy');

    // Leader Video Routes
    Route::get('leader/videos', [\App\Http\Controllers\LeaderVideoController::class, 'index'])->name('leader.videos');
    Route::post('leader/videos', [\App\Http\Controllers\LeaderVideoController::class, 'store'])->name('leader.videos.store');
    Route::put('leader/videos/{video}', [\App\Http\Controllers\LeaderVideoController::class, 'update'])->name('leader.videos.update');
    Route::delete('leader/videos/{video}', [\App\Http\Controllers\LeaderVideoController::class, 'destroy'])->name('leader.videos.destroy');

    // Leader Category Routes
    Route::post('leader/categories', [\App\Http\Controllers\LeaderCategoryController::class, 'store'])->name('leader.categories.store');
    Route::delete('leader/categories/{category}', [\App\Http\Controllers\LeaderCategoryController::class, 'destroy'])->name('leader.categories.destroy');

    // Leader Gallery Routes
    Route::get('leader/galleries', [\App\Http\Controllers\LeaderGalleryController::class, 'index'])->name('leader.galleries');
    Route::get('leader/galleries/create', [\App\Http\Controllers\LeaderGalleryController::class, 'create'])->name('leader.galleries.create');
    Route::post('leader/galleries', [\App\Http\Controllers\LeaderGalleryController::class, 'store'])->name('leader.galleries.store');
    Route::get('leader/galleries/{gallery}/edit', [\App\Http\Controllers\LeaderGalleryController::class, 'edit'])->name('leader.galleries.edit');
    Route::put('leader/galleries/{gallery}', [\App\Http\Controllers\LeaderGalleryController::class, 'update'])->name('leader.galleries.update');
    Route::delete('leader/galleries/{gallery}', [\App\Http\Controllers\LeaderGalleryController::class, 'destroy'])->name('leader.galleries.destroy');
    Route::delete('leader/gallery-photos/{photo}', [\App\Http\Controllers\LeaderGalleryController::class, 'destroyPhoto'])->name('leader.gallery_photos.destroy');

    // Leader Timeline Routes
    Route::get('leader/timelines', [\App\Http\Controllers\LeaderTimelineController::class, 'index'])->name('leader.timelines.index');
    Route::post('leader/timelines', [\App\Http\Controllers\LeaderTimelineController::class, 'store'])->name('leader.timelines.store');
    Route::put('leader/timelines/{timeline}', [\App\Http\Controllers\LeaderTimelineController::class, 'update'])->name('leader.timelines.update');
    Route::delete('leader/timelines/{timeline}', [\App\Http\Controllers\LeaderTimelineController::class, 'destroy'])->name('leader.timelines.destroy');

    // Site Settings Routes
    Route::get('site-settings', [\App\Http\Controllers\Settings\SiteSettingController::class, 'index'])->name('site-settings.index');
    Route::post('site-settings', [\App\Http\Controllers\Settings\SiteSettingController::class, 'update'])->name('site-settings.update');
    Route::resource('stats', \App\Http\Controllers\Settings\StatController::class);
    Route::resource('missions', \App\Http\Controllers\Settings\MissionController::class);

});

// Public Community Resources Routes
Route::get('/community/resources/submit', [\App\Http\Controllers\PublicResourceController::class, 'create'])->name('community.resources.create');
Route::post('/community/resources/submit', [\App\Http\Controllers\PublicResourceController::class, 'store'])->name('community.resources.store');

// Public Activity Route
Route::get('/program/activities/{activity:slug}', [\App\Http\Controllers\PublicController::class, 'activityShow'])->name('public.activities.show');

// Public Leader Route (Must be after specific /leader routes)
Route::get('/leader/{slug}', [\App\Http\Controllers\LeaderController::class, 'show'])->name('leader.show');

require __DIR__.'/settings.php';
