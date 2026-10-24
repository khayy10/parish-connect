<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentRequest extends Model
{
    protected $fillable = [
        'user_id', 'document_type', 'record_name', 'event_date',
        'purpose', 'contact_number', 'status', 'staff_remarks',
        'processed_by', 'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date:Y-m-d',
            'processed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
