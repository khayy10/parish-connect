<?php

namespace App\Http\Controllers;

use App\Models\Parishioner;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->merge(['email' => strtolower(trim((string) $request->input('email', '')))]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => trim($data['name']),
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'role' => 'parishioner',
                'status' => 'active',
            ]);

            Parishioner::create([
                'user_id' => $user->id,
                'first_name' => $user->name,
                'phone' => $user->phone,
            ]);

            return $user;
        });

        return response()->json([
            'message' => 'Account created successfully. Please sign in.',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->merge(['email' => strtolower(trim((string) $request->input('email', '')))]);

        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 422);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'This account is inactive. Contact the parish office.'], 403);
        }

        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Only authenticated priests may create staff accounts.
    public function registerStaff(Request $request)
    {
        $request->merge(['email' => strtolower(trim((string) $request->input('email', '')))]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', Rule::in(['priest', 'secretary', 'ministry_coordinator'])],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => trim($data['name']),
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'role' => $data['role'],
            'password' => Hash::make($data['password']),
            'status' => 'active',
        ]);

        return response()->json(['message' => 'Staff account created.', 'user' => $user], 201);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('parishioner'));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
