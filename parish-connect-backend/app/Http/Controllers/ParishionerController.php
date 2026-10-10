<?php
namespace App\Http\Controllers;
use App\Models\Parishioner;
use Illuminate\Http\Request;
class ParishionerController extends Controller {
    public function index(Request $r) {
        $q= Parishioner::with('user')->latest();
        if ($r->q)$q->where(fn($x)=>$x->where('first_name', 'like', '%'.$r->q.'%')->orWhere('last_name', 'like', '%'.$r->q.'%'));
        return $q->paginate(20);
    }
    public function show(Parishioner $parishioner) {
        return $parishioner->load('user');
    }
    public function update(Request $r, Parishioner $parishioner) {
        $parishioner->update($r->validate(['first_name'=>'sometimes|required', 'middle_name'=>'nullable', 'last_name'=>'nullable', 'birth_date'=>'nullable|date', 'gender'=>'nullable|in:Male,Female', 'address'=>'nullable', 'phone'=>'nullable']));
        return $parishioner;
    }
    public function destroy(Parishioner $parishioner) {
        $parishioner->delete();
        return response()->noContent();
    }
}
