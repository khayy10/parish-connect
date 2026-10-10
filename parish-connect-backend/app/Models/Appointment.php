<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Appointment extends Model {
    use HasFactory;
    protected $fillable= ['user_id', 'service_type', 'preferred_date', 'preferred_time', 'purpose', 'status', 'admin_notes'];
    protected function casts(): array {
        return ['preferred_date'=>'date'];
    }
    public function user() {
        return $this->belongsTo(User::class);
    }
}
