<?php
use Illuminate\Support\Facades\Route;
Route::get('/', fn()=>response()->json(['app'=>'ParishConnect API', 'status'=>'ok']));
