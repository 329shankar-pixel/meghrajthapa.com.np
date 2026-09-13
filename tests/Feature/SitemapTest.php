<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can access the sitemap', function () {
    $response = $this->get('/sitemap.xml');

    $response->assertSuccessful();
    $response->assertHeader('Content-Type', 'text/xml; charset=utf-8');
    $response->assertSee('<urlset', false);
    $response->assertSee('<loc>', false);
});

it('includes the homepage in the sitemap', function () {
    $response = $this->get('/sitemap.xml');

    $response->assertSee(url('/'));
});
