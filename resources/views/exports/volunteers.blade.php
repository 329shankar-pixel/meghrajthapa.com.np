<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Volunteers List - {{ $event->title }}</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #1a56db;
        }
        .header p {
            margin: 5px 0 0;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #f3f4f6;
            text-align: left;
            padding: 10px;
            border-bottom: 2px solid #e5e7eb;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        .footer {
            margin-top: 50px;
            text-align: right;
            font-size: 10px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Volunteers List</h1>
        <p><strong>Event:</strong> {{ $event->title }}</p>
        <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($event->event_date)->format('F d, Y h:i A') }}</p>
        @if($event->location)
            <p><strong>Location:</strong> {{ $event->location }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Ward</th>
            </tr>
        </thead>
        <tbody>
            @foreach($volunteers as $v)
                <tr>
                    <td>{{ $v['full_name'] }}</td>
                    <td>
                        {{ $v['phone'] }}<br>
                        <span style="color: #666;">{{ $v['email'] }}</span>
                    </td>
                    <td>
                        {{ $v['location']['province'] }}<br>
                        <span style="color: #666;">{{ $v['location']['district'] }}, {{ $v['location']['municipality'] }}</span>
                    </td>
                    <td>{{ $v['ward_number'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Generated on {{ now()->format('F d, Y h:i A') }}
    </div>
</body>
</html>
