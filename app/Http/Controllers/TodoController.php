<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class TodoController extends Controller
{
    private function ownerId(Request $request): string
    {
        $id = $request->cookie('todo_owner');
        if (! $id) {
            $id = (string) Str::uuid();
            Cookie::queue('todo_owner', $id, 60 * 24 * 365);
        }

        return $id;
    }

    public function index(Request $request)
    {
        return Todo::where('owner_id', $this->ownerId($request))->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'due_date' => 'nullable|date',
        ]);

        $data['owner_id'] = $this->ownerId($request);

        return Todo::create($data);
    }

    public function update(Request $request, Todo $todo)
    {
        abort_if($todo->owner_id !== $this->ownerId($request), 404);
        $data = $request->validate([
            'is_done' => 'required|boolean',
        ]);

        $todo->update($data);

        return $todo;
    }

    public function destroy(Request $request, Todo $todo)
    {
        abort_if($todo->owner_id !== $this->ownerId($request), 404);
        $todo->delete();

        return response()->json(['message' => 'task deleted']);
    }
}
