<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController, DashboardController, ParishionerController, AppointmentController, ReservationController, MinistryController, AnnouncementController, UserController
}
;
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::put('/appointments/{appointment}', [AppointmentController::class, 'update']);
    Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy']);
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::put('/reservations/{reservation}', [ReservationController::class, 'update']);
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy']);
    Route::get('/ministries', [MinistryController::class, 'index']);
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::middleware('role:priest,secretary,ministry_coordinator')->group(function () {
        Route::apiResource('parishioners', ParishionerController::class)->only(['index', 'show', 'update', 'destroy']);
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
        Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);
    }
    );
    Route::middleware('role:priest,ministry_coordinator')->group(function () {
        Route::post('/ministries', [MinistryController::class, 'store']);
        Route::put('/ministries/{ministry}', [MinistryController::class, 'update']);
        Route::delete('/ministries/{ministry}', [MinistryController::class, 'destroy']);
        Route::post('/ministries/{ministry}/members', [MinistryController::class, 'addMember']);
        Route::delete('/ministries/{ministry}/members/{user}', [MinistryController::class, 'removeMember']);
    }
    );
    Route::middleware('role:priest')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::put('/users/{user}', [UserController::class, 'update']);
    }
    );
}
);
