<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
class UserController extends Controller {
    public function index() {
        return User::latest()->get();
    }
    public function update(Request $r, User $user) {
        $user->update($r->validate(['name'=>'sometimes|required', 'phone'=>'nullable', 'role'=>'sometimes|in:priest,secretary,ministry_coordinator,parishioner', 'status'=>'sometimes|in:active,inactive']));
        return $user;
    }
}
