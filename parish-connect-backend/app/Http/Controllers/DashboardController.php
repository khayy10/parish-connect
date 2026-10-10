<?php
namespace App\Http\Controllers;
use App\Models\{
    User, Parishioner, Appointment, Reservation, Ministry, Announcement
}
;
class DashboardController extends Controller {
    public function index() {
        return ['parishioners'=>Parishioner::count(), 'pending_appointments'=>Appointment::where('status', 'pending')->count(), 'pending_reservations'=>Reservation::where('status', 'pending')->count(), 'ministries'=>Ministry::count(), 'announcements'=>Announcement::where('is_published', true)->count()];
    }
}
