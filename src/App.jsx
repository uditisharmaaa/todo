import { useEffect, useMemo, useRef, useState } from "react";
import { mockTasks } from "./data/mockTasks";

//filter tasks 
const FILTERS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
];

const STORAGE_KEY = "baraka_todo_tasks_v1";

//date formatting 
function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

//get id for tasks - 1 + current max 
function nextId(tasks) {
  return Math.max(0, ...tasks.map((t) => t.id)) + 1;
}


//checking if its a valid task (not null etc)

function isValidTask(t) {
  return (
    t &&
    typeof t === "object" &&
    typeof t.id === "number" &&
    typeof t.title === "string" &&
    typeof t.completed === "boolean" &&
    typeof t.createdAt === "string"
  );
}

//convert json into string for local storage 

function parseStoredTasks(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    if (!parsed.every(isValidTask)) return null;
    return parsed;
  } catch {
    return null;
  }
}

//save mock tasks into local storage (only the first time)
function seedFromMock() {
  const seeded = Array.isArray(mockTasks?.tasks) ? mockTasks.tasks : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  // Prevent double-init weirdness in dev (React 18 StrictMode)
  const didInit = useRef(false);

  // everytime page loads, we get data from local storage. if its empty, we get data from mock backend 

  // INIT: load from storage if present; otherwise seed once from mock and persist.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const stored = parseStoredTasks(localStorage.getItem(STORAGE_KEY));
    if (stored) {
      setTasks(stored);
      return;
    }

    const seeded = seedFromMock();
    setTasks(seeded);
  }, []);

  // PERSIST: only write after init has happened
  //runs everytime tasks changes 
  useEffect(() => {
    if (!didInit.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);


  //count how many tasks in each category
  const counts = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    return { all: tasks.length, completed, pending: tasks.length - completed };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const filtered =
      filter === "all"
        ? tasks
        : filter === "completed"
        ? tasks.filter((t) => t.completed)
        : tasks.filter((t) => !t.completed);

    return [...filtered].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [tasks, filter]);

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError("Task title can’t be empty.");
      return;
    }

    setError("");
    setTasks((prev) => [
      {
        id: nextId(prev),
        title: trimmed,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setTitle("");
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTask(id) {
    const t = tasks.find((x) => x.id === id);
    const ok = window.confirm(`Delete "${t?.title ?? "this task"}"?`);
    if (!ok) return;
    setTasks((prev) => prev.filter((x) => x.id !== id));
  }

  function resetToMock() {
    const ok = window.confirm("Reset to the original mock tasks?");
    if (!ok) return;

    const seeded = seedFromMock();
    setTasks(seeded);
    setFilter("all");
    setTitle("");
    setError("");
  }

  return (
    <div className="min-h-screen bg-baraka-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-xl2 border border-baraka-border bg-baraka-panel shadow-panel p-5 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-baraka-text">TODO List</h1>
            <p className="text-sm text-baraka-muted">
              The only todo list app you need!  
            </p>
          </div>

          <button
            type="button"
            onClick={resetToMock}
            className="rounded-full border border-baraka-border bg-white/5 px-3 py-2 text-xs font-semibold text-baraka-muted hover:text-baraka-text hover:bg-white/10"
            title="Reset to mock backend data"
          >
            Reset
          </button>
        </div>

        <form onSubmit={handleAdd} className="mt-4 flex gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task title…"
            className="flex-1 rounded-2xl border border-baraka-border bg-baraka-panelHover px-4 py-3 text-sm text-baraka-text placeholder:text-baraka-dim outline-none focus:border-baraka-borderStrong"
            aria-label="Task title"
          />
          <button
            type="submit"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:opacity-90"
          >
            Add
          </button>
        </form>

        {error && (
          <div className="mt-3 rounded-2xl border border-baraka-danger/40 bg-baraka-danger/15 px-4 py-3 text-sm text-[#fecdd3]">
            {error}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Task filters">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={[
                  "rounded-full px-3 py-2 text-xs font-semibold border transition",
                  active
                    ? "border-baraka-borderStrong bg-white/10 text-baraka-text"
                    : "border-baraka-border bg-white/5 text-baraka-muted hover:bg-white/10 hover:text-baraka-text",
                ].join(" ")}
                role="tab"
                aria-selected={active}
              >
                {f.label}
                <span className="ml-1 text-baraka-dim">{counts[f.key]}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-3">
          {visibleTasks.length === 0 ? (
            <div className="rounded-2xl border border-baraka-border bg-white/5 p-6 text-center">
              <div className="text-sm font-semibold text-baraka-text">
                Nothing here.
              </div>
              <div className="mt-1 text-sm text-baraka-muted">
                Try adding a task or switching filters.
              </div>
            </div>
          ) : (
            visibleTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-baraka-border bg-baraka-panelHover px-4 py-3 hover:border-baraka-borderStrong"
              >
                <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(t.id)}
                    className="h-4 w-4 accent-baraka-success"
                    aria-label={`Mark ${t.title} as ${
                      t.completed ? "incomplete" : "complete"
                    }`}
                  />

                  <div className="min-w-0">
                    <div
                      className={[
                        "truncate text-sm font-semibold",
                        t.completed
                          ? "line-through text-baraka-dim"
                          : "text-baraka-text",
                      ].join(" ")}
                    >
                      {t.title}
                    </div>
                    <div className="text-xs text-baraka-dim">
                      {formatDate(t.createdAt)}
                    </div>
                  </div>
                </label>

                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap",
                      t.completed
                        ? "border-baraka-success/40 text-baraka-success bg-baraka-success/10"
                        : "border-baraka-border text-baraka-muted bg-white/5",
                    ].join(" ")}
                  >
                    {t.completed ? "Completed" : "Pending"}
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteTask(t.id)}
                    className="h-9 w-9 rounded-xl border border-baraka-border bg-white/5 text-baraka-muted hover:text-baraka-text hover:bg-white/10"
                    aria-label={`Delete task: ${t.title}`}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-xs text-baraka-dim">
          Initial tasks load from mock backend data; updates persist via localStorage.
        </div>
      </div>
    </div>
  );
}