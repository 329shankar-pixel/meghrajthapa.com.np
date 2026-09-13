<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Party Members Export</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #cc0000;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            color: #cc0000;
            font-size: 18px;
        }
        .header p {
            margin: 5px 0 0;
            color: #666;
            font-size: 11px;
        }
        .filters {
            margin-bottom: 15px;
            padding: 8px;
            background: #f5f5f5;
            border-radius: 4px;
        }
        .filters span {
            margin-right: 15px;
            font-size: 9px;
        }
        .filters strong {
            color: #008000;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background: #cc0000;
            color: white;
            padding: 8px 4px;
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
        }
        td {
            padding: 6px 4px;
            border-bottom: 1px solid #ddd;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 8px;
            color: #999;
        }
        .count {
            text-align: right;
            font-size: 10px;
            margin-bottom: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Party Members Directory</h1>
        <p>Exported on {{ $exportDate }}</p>
    </div>

    @if(count($filters) > 0)
    <div class="filters">
        <strong>Applied Filters:</strong>
        @foreach($filters as $key => $value)
            <span>{{ $key }}: <strong>{{ $value }}</strong></span>
        @endforeach
    </div>
    @endif

    <div class="count">
        Total Members: <strong>{{ count($members) }}</strong>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Member Type</th>
                <th>Province</th>
                <th>District</th>
                <th>Municipality</th>
                <th>Ward</th>
            </tr>
        </thead>
        <tbody>
            @foreach($members as $index => $member)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $member->full_name }}</td>
                <td>{{ $member->gender }}</td>
                <td>{{ $member->phone }}</td>
                <td>{{ $member->email ?? '-' }}</td>
                <td>{{ $member->partyMemberType?->name ?? 'N/A' }}</td>
                <td>{{ $member->province_name ?? 'N/A' }}</td>
                <td>{{ $member->district_name ?? 'N/A' }}</td>
                <td>{{ $member->municipality_name ?? 'N/A' }}</td>
                <td>{{ $member->ward_number ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        This document was automatically generated. For official use only.
    </div>
</body>
</html>
