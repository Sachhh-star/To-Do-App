<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    public function index()
    {
        return Todo::latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'due_date' => 'nullable|date',
        ]);

        return Todo::create($data);
    }

    public function update(Request $request, Todo $todo)
    {
        $data = $request->validate([
            'is_done' => 'required|boolean',
        ]);

        $todo->update($data);

        return $todo;
    }

    public function destroy(Todo $todo)
    {
        $todo->delete();

        return response()->json(['message' => 'task deleted']);
    }
}
