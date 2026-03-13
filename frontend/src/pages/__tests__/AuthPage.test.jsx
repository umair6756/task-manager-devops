import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthPage from '../AuthPage'

vi.mock('../../services/api', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}))

describe('AuthPage', () => {
  it('renders login mode by default and can toggle to register', async () => {
    const user = userEvent.setup()

    render(<AuthPage />)

    expect(
      screen.getByRole('heading', { name: 'Sign in to your account' })
    ).toBeInTheDocument()

    const toggle = screen.getByRole('button', { name: 'Need an account?' })
    await user.click(toggle)

    expect(
      screen.getByRole('heading', { name: 'Create your account' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
  })
})
