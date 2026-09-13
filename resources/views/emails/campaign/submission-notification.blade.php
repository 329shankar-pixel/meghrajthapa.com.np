<x-mail::message>
# {{ $heading }}

@if($intro)
{{ $intro }}
@endif

<x-mail::table>
| Field | Value |
| --- | --- |
@foreach($rows as $label => $value)
| {{ $label }} | {{ is_array($value) ? implode(', ', $value) : ($value ?: '-') }} |
@endforeach
</x-mail::table>

@if($whatsappUrl)
<x-mail::button :url="$whatsappUrl">
Open WhatsApp Follow-up
</x-mail::button>
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
