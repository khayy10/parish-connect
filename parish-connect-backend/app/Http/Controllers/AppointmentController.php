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
        $isParishioner = $r->user()->role === 'parishioner';
        if ($isParishioner && $appointment->user_id !== $r->user()->id) abort(403);
        if ($isParishioner && $appointment->status !== 'pending') abort(403, 'Only pending requests can be changed.');
        $fields = [
            'service_type' => 'sometimes|required|in:Baptism,Wedding,Blessing,Counseling',
            'preferred_date' => 'sometimes|required|date',
            'preferred_time' => 'sometimes|required',
            'purpose' => 'nullable|string|max:1000',
        ];
        if (!$isParishioner) {
            $fields['status'] = 'sometimes|in:pending,approved,rejected,completed,cancelled';
            $fields['admin_notes'] = 'nullable|string';
        }
        $appointment->update($r->validate($fields));
        return $appointment;
    }
    public function destroy(Request $r, Appointment $appointment) {
        if ($r->user()->role === 'parishioner') {
            if ($appointment->user_id !== $r->user()->id || $appointment->status !== 'pending') abort(403);
        }
        $appointment->delete();
        return response()->noContent();
    }
}
