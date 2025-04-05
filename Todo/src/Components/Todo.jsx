import React, { useState, useEffect, useRef } from "react";
import "./Todo.css";

const Todo = () => {
    const [tasks, setTasks] = useState("");
    const [dueDate, setDueDate] = useState("");
    const inputRef = useRef(null);
    const alertAudio = useRef(new Audio("/alert.mp3")); // make sure the file is in public folder

    const [todos, setTodos] = useState(() => {
        const savedTodos = localStorage.getItem("todos");
        return savedTodos ? JSON.parse(savedTodos) : [];
    });

    const [dateTime, setDateTime] = useState("");

    useEffect(() => {
        Notification.requestPermission(); // ask permission on load
    }, []);

    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]);

    const handleTask = (value) => setTasks(value);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedTask = tasks.trim();
        if (!trimmedTask) return;

        if (todos.some((todo) => todo.text === trimmedTask)) {
            alert("Task already exists");
            setTasks("");
            return;
        }

        setTodos((prevTasks) => [
            ...prevTasks,
            { text: trimmedTask, completed: false, due: dueDate, notified: false }
        ]);
        setTasks("");
        setDueDate("");
        inputRef.current.focus();
    };

    const toggleComplete = (index) => {
        setTodos((prevTodos) =>
            prevTodos.map((todo, i) =>
                i === index ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const handleDelete = (index) => {
        setTodos((prevTodos) => prevTodos.filter((_, i) => i !== index));
    };

    const handleClear = () => {
        setTodos([]);
        setTasks("");
        localStorage.removeItem("todos");
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            todos.forEach((todo, index) => {
                if (todo.due && !todo.completed && !todo.notified) {
                    const taskTime = new Date(todo.due);
                    const diff = taskTime.getTime() - now.getTime();

                    if (diff <= 0 && diff > -60000) {
                        // Notification
                        if (Notification.permission === "granted") {
                            new Notification("Task Due!", {
                                body: `⏳ Hey! Your task '${todo.text}' needs attention!`,
                                icon: "/favicon.ico" // optional icon
                            });
                        }

                        // Sound
                        alertAudio.current.play();

                        // Update state to mark as notified
                        setTodos((prevTodos) =>
                            prevTodos.map((t, i) =>
                                i === index ? { ...t, notified: true } : t
                            )
                        );
                    }
                }
            });
        }, 15000); // check every 15 seconds

        return () => clearInterval(interval);
    }, [todos]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const date = now.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            const time = now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata",
            });
            setDateTime(`${date} - ${time}`);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="todo-container">
            <header className="todo-header">
                <h1>Todo List</h1>
                <h2>{dateTime}</h2>
            </header>

            <form onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    autoComplete="off"
                    value={tasks}
                    onChange={(e) => handleTask(e.target.value)}
                    className="todo-input"
                    placeholder="Enter a task..."
                />
                <input
                    type="datetime-local"
                    className="todo-due"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
                <button type="submit" className="add-btn">Add</button>
            </form>

            {todos.length === 0 ? (
                <p>No tasks added yet.</p>
            ) : (
                <ul className="todo-list">
                    {todos.map((todo, index) => (
                        <li key={index} className={`todo-item ${todo.completed ? "completed" : ""}`}>
                            <div style={{ flex: 1 }}>
                                <span>{todo.text}</span>
                                {todo.due && (
                                    <div style={{ fontSize: "12px", color: "#888" }}>
                                        Due: {new Date(todo.due).toLocaleString()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <button onClick={() => toggleComplete(index)} className="icon-btn">
                                    {todo.completed ? "✔" : "○"}
                                </button>
                                <button onClick={() => handleDelete(index)} className="icon-btn delete-btn">
                                    ❌
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {todos.length > 0 && (
                <button className="clear-btn" onClick={handleClear}>
                    Clear All
                </button>
            )}
        </div>
    );
};

export default Todo;
    