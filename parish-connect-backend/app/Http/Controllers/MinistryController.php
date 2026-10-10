<?php
namespace App\Http\Controllers;
use App\Models\Ministry;
use Illuminate\Http\Request;
class MinistryController extends Controller {
    public function index() {
        return Ministry::with(['coordinator', 'members'])->get();
    }
    public function store(Request $r) {
        return Ministry::create($r->validate(['name'=>'required|unique:ministries', 'description'=>'nullable', 'coordinator_id'=>'nullable|exists:users,id']));
    }
    public function update(Request $r, Ministry $ministry) {
        $ministry->update($r->validate(['name'=>'sometimes|required', 'description'=>'nullable', 'coordinator_id'=>'nullable|exists:users,id']));
        return $ministry;
    }
    public function addMember(Request $r, Ministry $ministry) {
        $d= $r->validate(['user_id'=>'required|exists:users,id', 'position'=>'nullable|string']);
        $ministry->members()->syncWithoutDetaching([$d['user_id']=>['position'=>$d['position']??'Volunteer']]);
        return $ministry->load('members');
    }
    public function removeMember(Ministry $ministry, $user) {
        $ministry->members()->detach($user);
        return response()->noContent();
    }
    public function destroy(Ministry $ministry) {
        $ministry->delete();
        return response()->noContent();
    }
}
