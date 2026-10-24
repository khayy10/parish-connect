<?php
namespace App\Http\Controllers;
use App\Models\Reservation;
use Illuminate\Http\Request;
class ReservationController extends Controller {
    public function index(Request $r) {
        $q= Reservation::with('user')->latest();
        if ($r->user()->role==='parishioner')$q->where('user_id', $r->user()->id);
        return $q->get();
    }
    public function store(Request $r) {
        $d= $r->validate(['facility'=>'required|string', 'event_name'=>'required|string', 'reservation_date'=>'required|date|after_or_equal:today', 'start_time'=>'required', 'end_time'=>'required|after:start_time', 'purpose'=>'nullable|string']);
        $conflict= Reservation::where('facility', $d['facility'])->where('reservation_date', $d['reservation_date'])->whereIn('status', ['pending', 'approved'])->where(fn($q)=>$q->where('start_time', '<', $d['end_time'])->where('end_time', '>', $d['start_time']))->exists();
        if ($conflict)return response()->json(['message'=>'Facility schedule conflicts with an existing request.'], 422);
        return Reservation::create([...$d, 'user_id'=>$r->user()->id, 'status'=>'pending']);
    }
    public function update(Request $r, Reservation $reservation) {
        $isParishioner = $r->user()->role === 'parishioner';
        if ($isParishioner && $reservation->user_id !== $r->user()->id) abort(403);
        if ($isParishioner && $reservation->status !== 'pending') abort(403, 'Only pending requests can be changed.');
        $fields = [
            'facility' => 'sometimes|required|string',
            'event_name' => 'sometimes|required|string',
            'reservation_date' => 'sometimes|required|date',
            'start_time' => 'sometimes|required',
            'end_time' => 'sometimes|required',
            'purpose' => 'nullable|string',
        ];
        if (!$isParishioner) {
            $fields['status'] = 'sometimes|in:pending,approved,rejected,completed,cancelled';
            $fields['admin_notes'] = 'nullable|string';
        }
        $reservation->update($r->validate($fields));
        return $reservation;
    }
    public function destroy(Request $r, Reservation $reservation) {
        if ($r->user()->role === 'parishioner') {
            if ($reservation->user_id !== $r->user()->id || $reservation->status !== 'pending') abort(403);
        }
        $reservation->delete();
        return response()->noContent();
    }
}
