<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up():void {
        Schema::create('users', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email')->unique();
            $t->string('password');
            $t->string('phone')->nullable();
            $t->enum('role', ['priest', 'secretary', 'ministry_coordinator', 'parishioner'])->default('parishioner');
            $t->enum('status', ['active', 'inactive'])->default('active');
            $t->timestamp('email_verified_at')->nullable();
            $t->rememberToken();
            $t->timestamps();
        }
        );
        Schema::create('password_reset_tokens', function (Blueprint $t) {
            $t->string('email')->primary();
            $t->string('token');
            $t->timestamp('created_at')->nullable();
        }
        );
        Schema::create('personal_access_tokens', function (Blueprint $t) {
            $t->id();
            $t->morphs('tokenable');
            $t->string('name');
            $t->string('token', 64)->unique();
            $t->text('abilities')->nullable();
            $t->timestamp('last_used_at')->nullable();
            $t->timestamp('expires_at')->nullable();
            $t->timestamps();
        }
        );
        Schema::create('parishioners', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $t->string('first_name');
            $t->string('middle_name')->nullable();
            $t->string('last_name')->nullable();
            $t->date('birth_date')->nullable();
            $t->enum('gender', ['Male', 'Female'])->nullable();
            $t->text('address')->nullable();
            $t->string('phone')->nullable();
            $t->timestamps();
        }
        );
        Schema::create('appointments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->enum('service_type', ['Baptism', 'Wedding', 'Blessing', 'Counseling']);
            $t->date('preferred_date');
            $t->time('preferred_time');
            $t->text('purpose')->nullable();
            $t->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');
            $t->text('admin_notes')->nullable();
            $t->timestamps();
        }
        );
        Schema::create('reservations', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('facility');
            $t->string('event_name');
            $t->date('reservation_date');
            $t->time('start_time');
            $t->time('end_time');
            $t->text('purpose')->nullable();
            $t->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');
            $t->text('admin_notes')->nullable();
            $t->timestamps();
        }
        );
        Schema::create('ministries', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->text('description')->nullable();
            $t->foreignId('coordinator_id')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        }
        );
        Schema::create('ministry_members', function (Blueprint $t) {
            $t->id();
            $t->foreignId('ministry_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('position')->default('Volunteer');
            $t->timestamps();
            $t->unique(['ministry_id', 'user_id']);
        }
        );
        Schema::create('announcements', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('title');
            $t->text('content');
            $t->date('event_date')->nullable();
            $t->boolean('is_published')->default(true);
            $t->timestamps();
        }
        );
    }
    public function down():void {
        foreach (['announcements', 'ministry_members', 'ministries', 'reservations', 'appointments', 'parishioners', 'personal_access_tokens', 'password_reset_tokens', 'users'] as $x)Schema::dropIfExists($x);
    }
}
;
