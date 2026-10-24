<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DocumentRequestController extends Controller
{
    private const DOCUMENT_TYPES = [
        'Baptismal Certificate',
        'Confirmation Certificate',
        'Marriage Certificate',
        'Burial Certificate',
        'Other Parish Record',
    ];

    private const STATUSES = [
        'pending', 'in_review', 'ready_for_pickup', 'released', 'rejected',
    ];

    public function index(Request $request)
    {
        $user = $request->user();
        $query = DocumentRequest::query()->latest();

        if ($user->role === 'parishioner') {
            $query->where('user_id', $user->id);
        } else {
            // Staff may verify the applicant's name and contact details.
            $query->with('user:id,name,email,phone');
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'document_type' => ['required', Rule::in(self::DOCUMENT_TYPES)],
            'record_name' => ['required', 'string', 'max:255'],
            'event_date' => ['nullable', 'date', 'before_or_equal:today'],
            'purpose' => ['required', 'string', 'max:500'],
            'contact_number' => ['nullable', 'string', 'max:30'],
        ]);

        $document = DocumentRequest::create([
            ...$data,
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Document request submitted. The parish office will review it.',
            'request' => $document,
        ], 201);
    }

    public function update(Request $request, DocumentRequest $documentRequest)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
            'staff_remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $documentRequest->update([
            'status' => $data['status'],
            'staff_remarks' => $data['staff_remarks'] ?? null,
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Document request status updated.',
            'request' => $documentRequest->fresh(),
        ]);
    }
}
