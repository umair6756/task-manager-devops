import { useMemo, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Button from "../components/Button"
import TextInput from "../components/TextInput"
import { loginUser, registerUser } from "../services/api"

const initialForm = {
  name: "",
  email: "",
  password: "",
}

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login")
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const isLogin = mode === "login"

  const headline = useMemo(
    () =>
      isLogin
        ? {
            title: "Welcome back",
            subtitle: "Pick up where you left off and keep your tasks moving.",
          }
        : {
            title: "Create your account",
            subtitle: "Organize tasks, share context, and move faster together.",
          },
    [isLogin]
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!isLogin && !form.name.trim()) {
      return "Please enter your full name."
    }
    if (!form.email.trim()) {
      return "Please enter your email address."
    }
    if (!form.password.trim()) {
      return "Please create a password."
    }
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationError = validate()
    if (validationError) {
      toast.warning(validationError)
      return
    }

    setLoading(true)

    try {
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }

      const data = isLogin ? await loginUser(payload) : await registerUser(payload)

      toast.success(
        isLogin
          ? "Login successful. Your workspace is ready."
          : "Account created. You can now log in."
      )

      if (onAuth) {
        onAuth({ token: data.token, user: { id: data._id, name: data.name, email: data.email } })
      }

      if (!isLogin) {
        setMode("login")
        setForm((prev) => ({ ...prev, password: "" }))
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen text-[var(--ink)]">
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop />

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10">
        <div className="auth-shell fade-up w-full p-8 sm:p-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--muted)]">
              Task Manager
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h1>
            <p className="mt-3 text-sm text-[var(--muted)] sm:text-base">
              {headline.subtitle}
            </p>
          </div>

          <form className="form-card mt-8 flex flex-col gap-6" onSubmit={handleSubmit}>
            {!isLogin ? (
              <TextInput
                label="Full name"
                id="name"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            ) : null}

            <TextInput
              label="Email address"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />

            <TextInput
              label="Password"
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Please wait..." : isLogin ? "Login" : "Sign up"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => {
                  setMode(isLogin ? "register" : "login")
                  setForm(initialForm)
                }}
              >
                {isLogin ? "Need an account?" : "Have an account?"}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--muted)]">
            By continuing you agree to our terms and confirm you read our privacy policy.
          </p>
        </div>
      </div>
    </div>
  )
}
