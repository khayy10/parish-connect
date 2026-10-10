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
        $conflict= Reservation::where('facility', $d['facility'])->where('reservation_date', $d['reservation_date'])->whereIn('status', ['pending', 'approved'])->where(fn($q)=>$q->whereBetween('start_time', [$d['start_time'], $d['end_time']])->orWhereBetween('end_time', [$d['start_time'], $d['end_time']]))->exists();
        if ($conflict)return response()->json(['message'=>'Facility schedule conflicts with an existing request.'], 422);
        return Reservation::create([...$d, 'user_id'=>$r->user()->id, 'status'=>'pending']);
    }
    public function update(Request $r, Reservation $reservation) {
        $reservation->update($r->validate(['facility'=>'sometimes', 'event_name'=>'sometimes', 'reservation_date'=>'sometimes|date', 'start_time'=>'sometimes', 'end_time'=>'sometimes', 'purpose'=>'nullable', 'status'=>'sometimes|in:pending,approved,rejected,completed,cancelled', 'admin_notes'=>'nullable']));
        return $reservation;
    }
    public function destroy(Request $r, Reservation $reservation) {
        if ($r->user()->role==='parishioner'&&$reservation->user_id!==$r->user()->id)abort(403);
        $reservation->delete();
        return response()->noContent();
    }
}
