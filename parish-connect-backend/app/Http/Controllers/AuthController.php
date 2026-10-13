<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Parishioner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // PARISHIONER SIGN UP ONLY

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:30',
            'password' => 'required|string|min:8|confirmed'
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'role' => 'parishioner',
                'status' => 'active'
            ]);

            Parishioner::create([
                'user_id' => $user->id,
                'first_name' => $user->name,
                'phone' => $user->phone
            ]);

            return $user;
        });

        return response()->json([
            'message' => 'Account created successfully. Please sign in.',
            'user' => $user
        ], 201);
    }

    // LOGIN FOR STAFF AND PARISHIONERS

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $user = User::where(
            'email',
            $data['email']
        )->first();

        if (
            !$user ||
            !Hash::check($data['password'], $user->password) ||
            $user->status !== 'active'
        ) {
            return response()->json([
                'message' => 'Invalid email or password.'
            ], 422);
        }

        $token = $user
            ->createToken('web')
            ->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    // GET CURRENT USER

    public function me(Request $request)
    {
        return response()->json(
            $request->user()->load('parishioner')
        );
    }

    // LOGOUT

    public function logout(Request $request)
    {
        $request->user()
            ->currentAccessToken()
            ?->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
