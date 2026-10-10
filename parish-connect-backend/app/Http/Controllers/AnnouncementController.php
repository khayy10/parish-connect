<?php
namespace App\Http\Controllers;
use App\Models\Announcement;
use Illuminate\Http\Request;
class AnnouncementController extends Controller {
    public function index(Request $r) {
        $q= Announcement::with('author')->latest();
        if (!$r->user()||$r->user()->role==='parishioner')$q->where('is_published', true);
        return $q->get();
    }
    public function store(Request $r) {
        $d= $r->validate(['title'=>'required|string|max:255', 'content'=>'required|string', 'event_date'=>'nullable|date', 'is_published'=>'boolean']);
        return Announcement::create([...$d, 'user_id'=>$r->user()->id]);
    }
    public function update(Request $r, Announcement $announcement) {
        $announcement->update($r->validate(['title'=>'sometimes|required', 'content'=>'sometimes|required', 'event_date'=>'nullable|date', 'is_published'=>'boolean']));
        return $announcement;
    }
    public function destroy(Announcement $announcement) {
        $announcement->delete();
        return response()->noContent();
    }
}
