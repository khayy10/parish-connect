<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Reservation extends Model {
    use HasFactory;
    protected $fillable= ['user_id', 'facility', 'event_name', 'reservation_date', 'start_time', 'end_time', 'purpose', 'status', 'admin_notes'];
    protected function casts(): array {
        return ['reservation_date'=>'date'];
    }
    public function user() {
        return $this->belongsTo(User::class);
    }
}
