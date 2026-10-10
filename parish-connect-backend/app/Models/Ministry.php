<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Ministry extends Model {
    use HasFactory;
    protected $fillable= ['name', 'description', 'coordinator_id'];
    public function coordinator() {
        return $this->belongsTo(User::class, 'coordinator_id');
    }
    public function members() {
        return $this->belongsToMany(User::class, 'ministry_members')->withPivot('position')->withTimestamps();
    }
}
