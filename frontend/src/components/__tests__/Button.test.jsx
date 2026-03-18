import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../Button'

describe('Button', () => {
  it('renders children and applies the default variant classes', () => {
    render(<Button>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('btn-primary')
  })

  it('supports the ghost variant and click handlers', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button variant="ghost" onClick={handleClick}>
        Cancel
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Cancel' })
    expect(button).toHaveClass('btn-ghost')

    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
