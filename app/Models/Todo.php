<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'is_done', 'due_date'])]
class Todo extends Model
{
    protected $casts = [
        'is_done' => 'boolean',
    ];
}
