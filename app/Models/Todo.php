<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'is_done', 'due_date', 'owner_id'])]
class Todo extends Model
{
    protected $casts = [
        'is_done' => 'boolean',
    ];
}
