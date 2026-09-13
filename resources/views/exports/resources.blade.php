<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Community Projects Export</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 9px; color: #222; }
        .header { border-bottom: 4px solid #C8102E; padding-bottom: 10px; margin-bottom: 14px; }
        .brand { color: #006400; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        h1 { color: #C8102E; margin: 4px 0; font-size: 20px; }
        .meta { color: #555; }
        .filters { background: #f5f8f5; border-left: 4px solid #006400; padding: 8px; margin-bottom: 12px; }
        .filters span { margin-right: 14px; }
        .summary { text-align: right; margin-bottom: 8px; color: #555; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #006400; color: white; padding: 7px 5px; text-align: left; text-transform: uppercase; font-size: 8px; }
        td { border-bottom: 1px solid #ddd; padding: 6px 5px; vertical-align: top; }
        tr:nth-child(even) { background: #fafafa; }
        .flag { color: #C8102E; font-weight: bold; }
        .muted { color: #666; }
        .footer { margin-top: 18px; text-align: center; color: #777; font-size: 8px; border-top: 1px solid #ddd; padding-top: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">Nepali Congress Campaign</div>
        <h1>Community Projects Export</h1>
        <div class="meta">Exported on {{ $exportDate }}</div>
    </div>

    @if(count($filters) > 0)
        <div class="filters">
            <strong>Applied filters:</strong>
            @foreach($filters as $key => $value)
                <span>{{ $key }}: <strong>{{ $value }}</strong></span>
            @endforeach
        </div>
    @endif

    <div class="summary">Total Projects: <strong>{{ count($resources) }}</strong></div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Project</th>
                <th>Category</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Budget</th>
                <th>Flags</th>
            </tr>
        </thead>
        <tbody>
            @foreach($resources as $index => $resource)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $resource->title }}</strong><br>
                        <span class="muted">{{ \Illuminate\Support\Str::limit($resource->description, 180) }}</span>
                    </td>
                    <td>{{ $resource->project_category ?: 'Community project' }}<br><span class="muted">{{ $resource->urgency ?: 'Normal' }}</span></td>
                    <td>{{ $resource->municipality_name }}, Ward {{ $resource->ward_number }}<br><span class="muted">{{ $resource->district_name }}, {{ $resource->province_name }}</span></td>
                    <td>{{ $resource->person_name }}<br><span class="muted">{{ $resource->person_phone }} | {{ $resource->person_email }}</span></td>
                    <td>{{ $resource->estimated_budget ?: '-' }}<br><span class="muted">{{ $resource->beneficiaries ?: '' }}</span></td>
                    <td>
                        @if($resource->is_bookmarked)<span class="flag">Bookmarked</span><br>@endif
                        @if($resource->is_important)<span class="flag">Important</span>@endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">Soft-delete policy: exported records are preserved unless restored or archived by an authorized admin.</div>
</body>
</html>
