import { useCallback, useEffect, useMemo, useState } from "react"
import { createTask, deleteTask, getTasks, updateTask } from "../services/api"

const EMPTY_FORM = {
  title: "",
  description: "",
}

const formatDateTime = (value) => {
  if (!value) return "Unknown"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export default function TodoDashboard({ session, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    sort: "created",
  })
  const [viewMode, setViewMode] = useState("grid")
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editDraft, setEditDraft] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")

  const token = session?.token
  const user = session?.user

  const loadTasks = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError("")
    try {
      const data = await getTasks(token)
      setTasks(data)
    } catch (err) {
      if (err.message === "Invalid token" || err.message === "No token") {
        onLogout?.()
      } else {
        setError(err.message || "Unable to load tasks")
      }
    } finally {
      setLoading(false)
    }
  }, [token, onLogout])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filters.status === "active" && task.completed) return false
        if (filters.status === "completed" && !task.completed) return false
        if (!filters.search.trim()) return true
        const keyword = filters.search.toLowerCase()
        return (
          task.title.toLowerCase().includes(keyword) ||
          task.description?.toLowerCase().includes(keyword)
        )
      })
      .sort((a, b) => {
        if (filters.sort === "title") {
          return a.title.localeCompare(b.title)
        }
        if (filters.sort === "updated") {
          return new Date(b.updatedAt) - new Date(a.updatedAt)
        }
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
  }, [tasks, filters])

  const addTask = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || !token) return
    setActionLoading(true)
    setError("")

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        completed: false,
      }
      const created = await createTask(payload, token)
      setTasks((prev) => [created, ...prev])
      setForm(EMPTY_FORM)
    } catch (err) {
      setError(err.message || "Unable to create task")
    } finally {
      setActionLoading(false)
    }
  }

  const toggleStatus = async (task) => {
    if (!token) return
    setActionLoading(true)
    try {
      const updated = await updateTask(task._id, { completed: !task.completed }, token)
      setTasks((prev) => prev.map((item) => (item._id === task._id ? updated : item)))
    } catch (err) {
      setError(err.message || "Unable to update task")
    } finally {
      setActionLoading(false)
    }
  }

  const removeTask = async (taskId) => {
    if (!token) return
    setActionLoading(true)
    try {
      await deleteTask(taskId, token)
      setTasks((prev) => prev.filter((task) => task._id !== taskId))
    } catch (err) {
      setError(err.message || "Unable to remove task")
    } finally {
      setActionLoading(false)
    }
  }

  const startEdit = (task) => {
    setEditingTaskId(task._id)
    setEditDraft({ title: task.title, description: task.description || "" })
  }

  const cancelEdit = () => {
    setEditingTaskId(null)
    setEditDraft(EMPTY_FORM)
  }

  const saveEdit = async (taskId) => {
    if (!token) return
    setActionLoading(true)
    try {
      const updated = await updateTask(
        taskId,
        {
          title: editDraft.title.trim(),
          description: editDraft.description.trim(),
        },
        token
      )
      setTasks((prev) => prev.map((task) => (task._id === taskId ? updated : task)))
      cancelEdit()
    } catch (err) {
      setError(err.message || "Unable to save changes")
    } finally {
      setActionLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({ search: "", status: "all", sort: "created" })
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-900 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20">
              OT
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight text-slate-900">Orbit Tasks</p>
              <p className="text-sm text-slate-600">
                Private board for {user?.name || "your"} work.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
              <span className="text-slate-500">Today</span>
              <span>
                {new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" })}
              </span>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0"
              type="button"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="mt-6">
          <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Your tasks
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  A simple todo list with a clean grid view.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={loadTasks}
                  disabled={loading || actionLoading}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0"
                  type="button"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>
            </div>

            <form className="mt-5 grid gap-4" onSubmit={addTask}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
                <input
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
                  placeholder="Task title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  disabled={actionLoading}
                />
                <input
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-4"
                  placeholder="Notes (optional)"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  disabled={actionLoading}
                />
                <button
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  type="submit"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Saving..." : "Add"}
                </button>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <input
                    className="h-11 w-full min-w-[220px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, search: event.target.value }))
                    }
                  />
                  <select
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
                    value={filters.status}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, status: event.target.value }))
                    }
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
                    value={filters.sort}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, sort: event.target.value }))
                    }
                  >
                    <option value="created">Newest</option>
                    <option value="updated">Recently updated</option>
                    <option value="title">Title</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={`inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 active:translate-y-0 ${
                      viewMode === "list"
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-600/20"
                        : "border border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                    }`}
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-pressed={viewMode === "list"}
                  >
                    List
                  </button>
                  <button
                    className={`inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 active:translate-y-0 ${
                      viewMode === "grid"
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-600/20"
                        : "border border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                    }`}
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-pressed={viewMode === "grid"}
                  >
                    Grid
                  </button>
                </div>
              </div>
            </form>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-5">
              {loading ? <p className="text-sm text-slate-600">Loading tasks...</p> : null}
              {!loading && filteredTasks.length === 0 ? (
                <p className="text-sm text-slate-600">No tasks yet. Add your first one above.</p>
              ) : null}

              <TaskList
                tasks={filteredTasks}
                viewMode={viewMode}
                actionLoading={actionLoading}
                onToggle={toggleStatus}
                onDelete={removeTask}
                onEdit={startEdit}
                onCancelEdit={cancelEdit}
                editingTaskId={editingTaskId}
                editDraft={editDraft}
                setEditDraft={setEditDraft}
                onSave={saveEdit}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function TaskList({
  tasks,
  viewMode,
  actionLoading,
  onToggle,
  onDelete,
  onEdit,
  onCancelEdit,
  editingTaskId,
  editDraft,
  setEditDraft,
  onSave,
}) {
  const layoutClass =
    viewMode === "grid"
      ? "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      : "mt-4 grid grid-cols-1 gap-4"

  return (
    <div data-testid="task-list" className={tasks.length ? layoutClass : ""}>
      {tasks.map((task) => {
        const editing = editingTaskId === task._id

        return (
          <div
            key={task._id}
            className={`group rounded-2xl border bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:ring-4 hover:ring-blue-100/60 ${
              task.completed ? "border-slate-200/80 bg-slate-50/60" : "border-slate-200/80"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                aria-label={
                  task.completed
                    ? `Mark "${task.title}" as active`
                    : `Mark "${task.title}" as done`
                }
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-sm font-extrabold shadow-sm transition hover:-translate-y-0.5 hover:ring-4 hover:ring-blue-100/70 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${
                  task.completed
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                }`}
                onClick={() => onToggle(task)}
                disabled={actionLoading}
              >
                {task.completed ? "✓" : ""}
              </button>
              <div className="min-w-0 flex-1">
                {editing ? (
                  <input
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70 disabled:cursor-not-allowed disabled:opacity-60"
                    value={editDraft.title}
                    onChange={(event) =>
                      setEditDraft((prev) => ({ ...prev, title: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        onSave(task._id)
                      }
                      if (event.key === "Escape") {
                        event.preventDefault()
                        onCancelEdit()
                      }
                    }}
                    disabled={actionLoading}
                    autoFocus
                  />
                ) : (
                  <p className="truncate text-sm font-semibold text-slate-900">{task.title}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Created {formatDateTime(task.createdAt)}
                </p>
              </div>
            </div>

            {editing ? (
              <textarea
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70 disabled:cursor-not-allowed disabled:opacity-60"
                rows={2}
                value={editDraft.description}
                onChange={(event) =>
                  setEditDraft((prev) => ({ ...prev, description: event.target.value }))
                }
                disabled={actionLoading}
              />
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                {task.description || "No description yet."}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  task.completed ? "bg-slate-200 text-slate-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {task.completed ? "Done" : "Active"}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Updated {formatDateTime(task.updatedAt || task.createdAt)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {editing ? (
                <>
                  <button
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    type="button"
                    onClick={() => onSave(task._id)}
                    disabled={actionLoading}
                  >
                    Save
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={onCancelEdit}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={() => onEdit(task)}
                  disabled={actionLoading}
                >
                  Edit
                </button>
              )}
              <button
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={() => onDelete(task._id)}
                disabled={actionLoading}
              >
                Remove
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
