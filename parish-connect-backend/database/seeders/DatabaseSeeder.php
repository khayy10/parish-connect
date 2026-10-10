<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\{
    User, Parishioner, Ministry, Announcement
}
;
class DatabaseSeeder extends Seeder {
    public function run():void {
        $priest= User::create(['name'=>'Parish Priest', 'email'=>'priest@parishconnect.test', 'password'=>'password123', 'role'=>'priest']);
        $sec= User::create(['name'=>'Parish Secretary', 'email'=>'secretary@parishconnect.test', 'password'=>'password123', 'role'=>'secretary']);
        $coord= User::create(['name'=>'Ministry Coordinator', 'email'=>'coordinator@parishconnect.test', 'password'=>'password123', 'role'=>'ministry_coordinator']);
        $p= User::create(['name'=>'Juan Dela Cruz', 'email'=>'parishioner@parishconnect.test', 'password'=>'password123', 'role'=>'parishioner']);
        Parishioner::create(['user_id'=>$p->id, 'first_name'=>'Juan', 'last_name'=>'Dela Cruz', 'address'=>'Batac City, Ilocos Norte']);
        Ministry::create(['name'=>'Choir Ministry', 'description'=>'Parish choir and music ministry', 'coordinator_id'=>$coord->id]);
        Announcement::create(['user_id'=>$sec->id, 'title'=>'Welcome to ParishConnect', 'content'=>'ParishConnect is now available for parish announcements and service requests.', 'is_published'=>true]);
    }
}
