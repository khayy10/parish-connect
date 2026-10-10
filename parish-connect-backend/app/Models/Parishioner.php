<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Parishioner extends Model {
    use HasFactory;
    protected $fillable= ['user_id', 'first_name', 'middle_name', 'last_name', 'birth_date', 'gender', 'address', 'phone'];
    protected function casts(): array {
        return ['birth_date'=>'date'];
    }
    public function user() {
        return $this->belongsTo(User::class);
    }
}
