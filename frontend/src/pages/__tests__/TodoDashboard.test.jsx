import { describe, expect, it, vi } from "vitest"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TodoDashboard from "../TodoDashboard"

import { createTask, deleteTask, getTasks, updateTask } from "../../services/api"

vi.mock("../../services/api", () => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}))

const session = {
  token: "token-123",
  user: { name: "Ada" },
}

const baseTask = {
  _id: "task-1",
  title: "Write tests",
  description: "Add coverage for the dashboard",
  completed: false,
  createdAt: "2026-03-18T10:00:00.000Z",
  updatedAt: "2026-03-18T10:00:00.000Z",
}

describe("TodoDashboard", () => {
  it("loads and renders tasks", async () => {
    getTasks.mockResolvedValueOnce([baseTask])

    render(<TodoDashboard session={session} onLogout={vi.fn()} />)

    expect(await screen.findByText("Write tests")).toBeInTheDocument()
    expect(getTasks).toHaveBeenCalledWith(session.token)
  })

  it("creates, updates, edits, and deletes a task", async () => {
    const user = userEvent.setup()

    getTasks.mockResolvedValueOnce([baseTask])

    const createdTask = {
      _id: "task-2",
      title: "New task",
      description: "Notes",
      completed: false,
      createdAt: "2026-03-18T11:00:00.000Z",
      updatedAt: "2026-03-18T11:00:00.000Z",
    }

    createTask.mockResolvedValueOnce(createdTask)

    const completedTask = {
      ...baseTask,
      completed: true,
      updatedAt: "2026-03-18T12:00:00.000Z",
    }

    updateTask.mockResolvedValueOnce(completedTask)

    const editedTask = {
      ...createdTask,
      title: "Renamed task",
      updatedAt: "2026-03-18T12:30:00.000Z",
    }

    updateTask.mockResolvedValueOnce(editedTask)

    deleteTask.mockResolvedValueOnce()

    render(<TodoDashboard session={session} onLogout={vi.fn()} />)

    await screen.findByText("Write tests")

    await user.type(screen.getByPlaceholderText("Task title"), createdTask.title)
    await user.type(screen.getByPlaceholderText("Notes (optional)"), createdTask.description)
    await user.click(screen.getByRole("button", { name: "Add" }))

    expect(createTask).toHaveBeenCalledWith(
      {
        title: createdTask.title,
        description: createdTask.description,
        completed: false,
      },
      session.token
    )

    expect(await screen.findByText("New task")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: 'Mark "Write tests" as done' }))
    expect(updateTask).toHaveBeenNthCalledWith(1, baseTask._id, { completed: true }, session.token)
    expect(await screen.findByText("Done")).toBeInTheDocument()

    const newTaskCard = screen.getByText("New task").closest("div.group")
    expect(newTaskCard).not.toBeNull()

    await user.click(within(newTaskCard).getByRole("button", { name: "Edit" }))
    const titleInput = within(newTaskCard).getByDisplayValue("New task")
    await user.clear(titleInput)
    await user.type(titleInput, "Renamed task")
    await user.click(within(newTaskCard).getByRole("button", { name: "Save" }))

    expect(updateTask).toHaveBeenNthCalledWith(
      2,
      createdTask._id,
      { title: "Renamed task", description: createdTask.description },
      session.token
    )

    expect(await screen.findByText("Renamed task")).toBeInTheDocument()

    const editedCard = screen.getByText("Renamed task").closest("div.group")
    expect(editedCard).not.toBeNull()

    await user.click(within(editedCard).getByRole("button", { name: "Remove" }))
    expect(deleteTask).toHaveBeenCalledWith(createdTask._id, session.token)
    await waitFor(() => {
      expect(screen.queryByText("Renamed task")).not.toBeInTheDocument()
    })
  })

  it("calls onLogout when token is invalid", async () => {
    const onLogout = vi.fn()
    getTasks.mockRejectedValueOnce(new Error("Invalid token"))

    render(<TodoDashboard session={session} onLogout={onLogout} />)

    await waitFor(() => {
      expect(onLogout).toHaveBeenCalled()
    })
  })

  it("toggles list/grid view", async () => {
    const user = userEvent.setup()
    getTasks.mockResolvedValueOnce([baseTask])

    const { getByTestId } = render(<TodoDashboard session={session} onLogout={vi.fn()} />)

    await screen.findByText("Write tests")

    await user.click(screen.getByRole("button", { name: "List" }))
    expect(getByTestId("task-list").className).not.toContain("sm:grid-cols-2")

    await user.click(screen.getByRole("button", { name: "Grid" }))
    expect(getByTestId("task-list").className).toContain("sm:grid-cols-2")
  })
})
