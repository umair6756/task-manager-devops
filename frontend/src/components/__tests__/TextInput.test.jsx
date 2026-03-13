import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import TextInput from '../TextInput'

describe('TextInput', () => {
  it('renders a label when provided', () => {
    render(<TextInput id="email" label="Email" />)

    const label = screen.getByText('Email')
    const input = screen.getByLabelText('Email')

    expect(label).toBeInTheDocument()
    expect(input).toHaveAttribute('id', 'email')
  })

  it('supports custom types and placeholders', () => {
    render(
      <TextInput
        id="password"
        label="Password"
        type="password"
        placeholder="Enter password"
      />
    )

    const input = screen.getByPlaceholderText('Enter password')
    expect(input).toHaveAttribute('type', 'password')
  })
})
