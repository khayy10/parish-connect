<?php

// Exact allow-list for direct API calls. The Vercel /api proxy also keeps requests same-origin.
$origins = array_filter(array_map(
    fn ($value) => rtrim(trim($value), '/'),
    explode(',', (string) env('FRONTEND_URLS', env('FRONTEND_URL', '')))
));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_unique(array_merge([
        'https://parish-connect-kb48.vercel.app',
        'https://parish-connect-kb48-pqkkn4k8f-denkhayla-6282.vercel.app',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ], $origins))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 3600,
    'supports_credentials' => false, // This app uses Sanctum bearer tokens, not cookies.
];
