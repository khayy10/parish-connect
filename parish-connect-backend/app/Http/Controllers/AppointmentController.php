<?php
namespace App\Http\Controllers;
use App\Models\Appointment;
use Illuminate\Http\Request;
class AppointmentController extends Controller {
    public function index(Request $r) {
        $q= Appointment::with('user')->latest();
        if ($r->user()->role==='parishioner')$q->where('user_id', $r->user()->id);
        return $q->get();
    }
    public function store(Request $r) {
        $d= $r->validate(['service_type'=>'required|in:Baptism,Wedding,Blessing,Counseling', 'preferred_date'=>'required|date|after_or_equal:today', 'preferred_time'=>'required', 'purpose'=>'nullable|string|max:1000']);
        return Appointment::create([...$d, 'user_id'=>$r->user()->id, 'status'=>'pending']);
    }
    public function update(Request $r, Appointment $appointment) {
        $d= $r->validate(['service_type'=>'sometimes', 'preferred_date'=>'sometimes|date', 'preferred_time'=>'sometimes', 'purpose'=>'nullable', 'status'=>'sometimes|in:pending,approved,rejected,completed,cancelled', 'admin_notes'=>'nullable']);
        $appointment->update($d);
        return $appointment;
    }
    public function destroy(Request $r, Appointment $appointment) {
        if ($r->user()->role==='parishioner'&&$appointment->user_id!==$r->user()->id)abort(403);
        $appointment->delete();
        return response()->noContent();
    }
}
