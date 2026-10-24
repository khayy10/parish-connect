<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ParishionerController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\MinistryController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DocumentRequestController;

// PUBLIC ROUTES
// Use /api/health to check both Laravel and its live database connection.
Route::get('/health', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        return response()->json(['status' => 'ok', 'database' => 'connected']);
    } catch (\Throwable $exception) {
        \Illuminate\Support\Facades\Log::error('API database health check failed', [
            'exception' => get_class($exception),
        ]);
        return response()->json(['status' => 'error', 'database' => 'unavailable'], 503);
    }
});

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

// AUTHENTICATED ROUTES

Route::middleware('auth:sanctum')->group(function () {

    Route::get(
        '/me',
        [AuthController::class, 'me']
    );

    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );

    Route::get(
        '/dashboard',
        [DashboardController::class, 'index']
    );

    // CHURCH DOCUMENT REQUESTS
    // Parishioners can request records and see only their own requests.
    // Only Parish Priest / Parish Secretary can review and change status.
    Route::get('/document-requests', [DocumentRequestController::class, 'index'])
        ->middleware('role:parishioner,priest,secretary');
    Route::post('/document-requests', [DocumentRequestController::class, 'store'])
        ->middleware(['role:parishioner', 'throttle:10,1']);
    Route::patch('/document-requests/{documentRequest}', [DocumentRequestController::class, 'update'])
        ->middleware('role:priest,secretary');

    // APPOINTMENTS

    Route::get(
        '/appointments',
        [AppointmentController::class, 'index']
    );

    Route::post(
        '/appointments',
        [AppointmentController::class, 'store']
    );

    Route::put(
        '/appointments/{appointment}',
        [AppointmentController::class, 'update']
    );

    Route::delete(
        '/appointments/{appointment}',
        [AppointmentController::class, 'destroy']
    );

    // RESERVATIONS

    Route::get(
        '/reservations',
        [ReservationController::class, 'index']
    );

    Route::post(
        '/reservations',
        [ReservationController::class, 'store']
    );

    Route::put(
        '/reservations/{reservation}',
        [ReservationController::class, 'update']
    );

    Route::delete(
        '/reservations/{reservation}',
        [ReservationController::class, 'destroy']
    );

    // MINISTRIES

    Route::get(
        '/ministries',
        [MinistryController::class, 'index']
    );

    // ANNOUNCEMENTS

    Route::get(
        '/announcements',
        [AnnouncementController::class, 'index']
    );

    // PARISH STAFF ROUTES

    Route::middleware(
        'role:priest,secretary,ministry_coordinator'
    )->group(function () {

        Route::apiResource(
            'parishioners',
            ParishionerController::class
        )->only([
            'index',
            'show',
            'update',
            'destroy'
        ]);

        Route::post(
            '/announcements',
            [AnnouncementController::class, 'store']
        );

        Route::put(
            '/announcements/{announcement}',
            [AnnouncementController::class, 'update']
        );

        Route::delete(
            '/announcements/{announcement}',
            [AnnouncementController::class, 'destroy']
        );
    });

    // MINISTRY MANAGEMENT

    Route::middleware(
        'role:priest,ministry_coordinator'
    )->group(function () {

        Route::post(
            '/ministries',
            [MinistryController::class, 'store']
        );

        Route::put(
            '/ministries/{ministry}',
            [MinistryController::class, 'update']
        );

        Route::delete(
            '/ministries/{ministry}',
            [MinistryController::class, 'destroy']
        );

        Route::post(
            '/ministries/{ministry}/members',
            [MinistryController::class, 'addMember']
        );

        Route::delete(
            '/ministries/{ministry}/members/{user}',
            [MinistryController::class, 'removeMember']
        );
    });

    // PARISH PRIEST ONLY

    Route::middleware('role:priest')->group(function () {

        Route::post('/staff/register', [AuthController::class, 'registerStaff']);

        Route::get(
            '/users',
            [UserController::class, 'index']
        );

        Route::put(
            '/users/{user}',
            [UserController::class, 'update']
        );
    });
});
