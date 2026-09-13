<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mission extends Model
{
    protected $fillable = ['title', 'description', 'icon', 'color', 'sort_order'];
}
