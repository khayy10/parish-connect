<?php
namespace App\Http\Controllers;
use App\Models\User;
use App\Models\Parishioner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
class AuthController extends Controller {
    public function register(Request $r) {
        $d= $r->validate(['name'=>'required|string|max:255', 'email'=>'required|email|unique:users', 'password'=>'required|min:8|confirmed', 'phone'=>'nullable|string|max:30']);
        $u= User::create([...$d, 'role'=>'parishioner', 'status'=>'active']);
        Parishioner::create(['user_id'=>$u->id, 'first_name'=>$u->name, 'phone'=>$u->phone]);
        return response()->json(['user'=>$u, 'token'=>$u->createToken('web')->plainTextToken], 201);
    }
    public function login(Request $r) {
        $d= $r->validate(['email'=>'required|email', 'password'=>'required']);
        $u= User::where('email', $d['email'])->first();
        if (!$u||!Hash::check($d['password'], $u->password)||$u->status!=='active')return response()->json(['message'=>'Invalid credentials'], 422);
        $u->tokens()->delete();
        return ['user'=>$u, 'token'=>$u->createToken('web')->plainTextToken];
    }
    public function me(Request $r) {
        return $r->user()->load('parishioner');
    }
    public function logout(Request $r) {
        $r->user()->currentAccessToken()?->delete();
        return ['message'=>'Logged out'];
    }
}
