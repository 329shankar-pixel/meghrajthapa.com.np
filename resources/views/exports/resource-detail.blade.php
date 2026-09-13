<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $resource->title }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #1f2933; font-size: 12px; line-height: 1.55; }
        .header { background: #006400; color: #fff; padding: 22px; border-bottom: 8px solid #C8102E; }
        .eyebrow { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; }
        h1 { margin: 8px 0 0; font-size: 26px; line-height: 1.15; }
        .badges { margin-top: 12px; }
        .badge { display: inline-block; border: 1px solid #fff; border-radius: 99px; padding: 4px 9px; margin-right: 5px; font-size: 10px; font-weight: bold; }
        .section { margin-top: 22px; }
        h2 { color: #C8102E; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 15px; }
        .grid { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .grid td { border: 1px solid #e5e7eb; padding: 9px; vertical-align: top; }
        .label { color: #006400; font-weight: bold; font-size: 10px; text-transform: uppercase; }
        .value { margin-top: 3px; font-size: 12px; }
        .description { white-space: pre-wrap; background: #f8faf8; border-left: 4px solid #006400; padding: 14px; }
        .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #667085; }
    </style>
</head>
<body>
    <div class="header">
        <div class="eyebrow">Nepali Congress Campaign Community Project</div>
        <h1>{{ $resource->title }}</h1>
        <div class="badges">
            <span class="badge">{{ $resource->municipality_name }}, Ward {{ $resource->ward_number }}</span>
            <span class="badge">{{ $resource->project_category ?: 'Community Project' }}</span>
            <span class="badge">{{ $resource->urgency ?: 'Normal Priority' }}</span>
            @if($resource->is_bookmarked)<span class="badge">Bookmarked</span>@endif
            @if($resource->is_important)<span class="badge">Important</span>@endif
        </div>
    </div>

    <div class="section">
        <h2>Project Overview</h2>
        <div class="description">{{ $resource->description }}</div>
    </div>

    <div class="section">
        <h2>Project Details</h2>
        <table class="grid">
            <tr>
                <td>
                    <div class="label">Expected Budget</div>
                    <div class="value">{{ $resource->estimated_budget ?: 'Not specified' }}</div>
                </td>
                <td>
                    <div class="label">Beneficiaries</div>
                    <div class="value">{{ $resource->beneficiaries ?: 'Not specified' }}</div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="label">Full Location</div>
                    <div class="value">{{ $resource->tole ?: 'Local community' }}, {{ $resource->municipality_name }}-{{ $resource->ward_number }}, {{ $resource->district_name }}, {{ $resource->province_name }}</div>
                </td>
                <td>
                    <div class="label">Submitted</div>
                    <div class="value">{{ optional($resource->created_at)->format('F j, Y') }}</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>Community Contact</h2>
        <table class="grid">
            <tr>
                <td>
                    <div class="label">Name</div>
                    <div class="value">{{ $resource->person_name }}</div>
                </td>
                <td>
                    <div class="label">Phone</div>
                    <div class="value">{{ $resource->person_phone }}</div>
                </td>
                <td>
                    <div class="label">Email</div>
                    <div class="value">{{ $resource->person_email }}</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">Downloaded on {{ $exportDate }}. This document is generated from the campaign project management system.</div>
</body>
</html>
