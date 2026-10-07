import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";

type Todo = {
    id: number;
    title: string;
    is_done: boolean;
    created_at: string;
    due_date: string | null;
};

const getToken = () => {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") ?? ""
    );
};

export default function Welcome() {
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [todos, setTodos] = useState<Todo[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selectedTodo = todos.find((todo) => todo.id === selectedId);
    const [filter, setFilter] = useState("home");
    const [menuOpen, setMenuOpen] = useState(false);

    const visibleTodos = todos.filter((todo) => {
        if (filter === "finish") {
            return todo.is_done;
        } else if (filter === "agenda") {
            return todo.due_date !== null && !todo.is_done;
        } else {
            return !todo.is_done;
        }
    });

    //  sort tasks on the agenda page by due date, earliest first
    const sortedTodos = [...visibleTodos].sort((a, b) => {
        if (filter === "agenda") {
            return (
                new Date(a.due_date ?? "").getTime() -
                new Date(b.due_date ?? "").getTime()
            );
        } else {
            return 0;
        }
    });

    const today = new Date().toLocaleDateString("en-CA");

    // check if a task is overdue (due date in the past and not done)
    function isOverdue(todo: Todo) {
        return todo.due_date !== null && todo.due_date < today && !todo.is_done;
    }

    // load tasks
    async function loadTodos() {
        try {
            const response = await fetch("/todos", {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                alert("Could not load tasks.");
                return;
            }

            const data: Todo[] = await response.json();
            setTodos(data);
        } catch {
            alert("Could not connect to the server.");
        }
    }

    useEffect(() => {
        loadTodos();
    }, []);

    // add task
    async function addTask() {
        if (title.trim() === "") {
            alert("Please enter a task.");

            return;
        }

        try {
            const response = await fetch("/todos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getToken(),
                },
                body: JSON.stringify({ title, due_date: dueDate }),
            });

            if (!response.ok) {
                alert("Could not save task. Status: " + response.status);
                return;
            }

            setTitle("");
            setDueDate("");
            setFilter("home");
            await loadTodos();
        } catch {
            alert("Could not connect to the server.");
        }
    }

    // switch task between done and not done
    async function toggleTask(todo: Todo) {
        try {
            const response = await fetch(`/todos/${todo.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getToken(),
                },
                body: JSON.stringify({
                    is_done: !todo.is_done,
                }),
            });

            if (!response.ok) {
                alert("Could not update task. Status: " + response.status);
                return;
            }

            await loadTodos();
        } catch {
            alert("Could not connect to the server.");
        }
    }

    // delete task
    async function deleteTask(todo: Todo) {
        if (!confirm(`Delete "${todo.title}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/todos/${todo.id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getToken(),
                },
            });

            if (!response.ok) {
                alert("Could not delete task. Status: " + response.status);
                return;
            }

            await loadTodos();
        } catch {
            alert("Could not connect to the server.");
        }
    }

    return (
        <>
            <Head title="to-do-app" />
            <div className="page">
                <div className="circle circle_1" aria-hidden="true"></div>
                <div className="circle circle_2" aria-hidden="true"></div>
                <div className="circle circle_3" aria-hidden="true"></div>
                <div className="circle circle_4" aria-hidden="true"></div>

                <header className="container_header">
                    <h1 className="title_container">TO DO APP</h1>
                    <button
                        type="button"
                        className="menu_toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        ☰
                    </button>
                    <nav className={ menuOpen ? "menu_open" : ""}>
                        <ul id="menu">
                            <li id="home" className="li">
                                <button
                                    type="button"
                                    onClick={() => setFilter("home")}
                                    className={
                                        filter === "home" ? "active" : ""
                                    }
                                >
                                    Home
                                </button>
                            </li>
                            <li id="finish" className="li">
                                <button
                                    type="button"
                                    onClick={() => setFilter("finish")}
                                    className={
                                        filter === "finish" ? "active" : ""
                                    }
                                >
                                    Finish
                                </button>
                            </li>
                            <li id="agenda" className="li">
                                <button
                                    type="button"
                                    onClick={() => setFilter("agenda")}
                                    className={
                                        filter === "agenda" ? "active" : ""
                                    }
                                >
                                    Agenda
                                </button>
                            </li>
                        </ul>
                    </nav>
                </header>

                <main className="container_main">
                    <section className="info_box">
                        <div className="info_circle">
                            {selectedTodo ? (
                                <>
                                    <h2>{selectedTodo.title}</h2>
                                    <p>
                                        {selectedTodo.is_done
                                            ? "done"
                                            : "not done"}
                                    </p>
                                    <p>
                                        {new Date(
                                            selectedTodo.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                    {selectedTodo.due_date ? (
                                        <p>
                                            Due:{" "}
                                            {new Date(
                                                selectedTodo.due_date,
                                            ).toLocaleDateString()}
                                        </p>
                                    ) : null}
                                </>
                            ) : (
                                <p>Click a task to see the information</p>
                            )}
                        </div>
                    </section>

                    <section className="task_column">
                        {sortedTodos.length === 0 ? <p>No task here</p> : null}
                        <ul className="task_list">
                            {sortedTodos.map((todo) => (
                                <li
                                    key={todo.id}
                                    className={
                                        todo.is_done
                                            ? "task_card done"
                                            : isOverdue(todo)
                                              ? "task_card overdue"
                                              : "task_card"
                                    }
                                >
                                    <button
                                        className="task_title"
                                        type="button"
                                        onClick={() => setSelectedId(todo.id)}
                                    >
                                        {todo.title}
                                        {filter === "agenda" ? (
                                            <span>
                                                {" "}
                                                (Due:{" "}
                                                {new Date(
                                                    todo.due_date ?? "",
                                                ).toLocaleDateString()}
                                                )
                                            </span>
                                        ) : null}
                                    </button>

                                    <div className="task_actions">
                                        <button
                                            type="button"
                                            onClick={() => toggleTask(todo)}
                                        >
                                            {todo.is_done
                                                ? "mark not done"
                                                : "mark done"}
                                        </button>

                                        <button
                                            className="delete_button"
                                            type="button"
                                            onClick={() => deleteTask(todo)}
                                        >
                                            delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="add_task">
                            <label htmlFor="title">task name</label>
                            <input
                                id="title"
                                type="text"
                                placeholder="write a task"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                            />
                            <label htmlFor="due_date">due date</label>
                            <input
                                id="due_date"
                                type="date"
                                onChange={(event) =>
                                    setDueDate(event.target.value)
                                }
                                value={dueDate}
                            />

                            <button type="button" onClick={addTask}>
                                add task
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
