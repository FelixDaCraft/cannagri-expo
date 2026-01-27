import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/Input'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input name="test" />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should render with label', () => {
      render(<Input name="email" label="Email" />)
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('should render without label', () => {
      render(<Input name="test" />)
      expect(screen.queryByRole('label')).not.toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<Input name="test" placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })
  })

  describe('Label', () => {
    it('should associate label with input via htmlFor', () => {
      render(<Input name="email" label="Email" />)
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Email')

      expect(label).toHaveAttribute('for', 'email')
      expect(input).toHaveAttribute('id', 'email')
    })

    it('should show required asterisk when required', () => {
      render(<Input name="email" label="Email" required />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('should not show asterisk when not required', () => {
      render(<Input name="email" label="Email" />)
      expect(screen.queryByText('*')).not.toBeInTheDocument()
    })

    it('should use id prop if provided', () => {
      render(<Input name="email" id="custom-id" label="Email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'custom-id')
    })
  })

  describe('Error State', () => {
    it('should display error message', () => {
      render(<Input name="email" error="Invalid email" />)
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })

    it('should have error styling when error prop is provided', () => {
      render(<Input name="email" error="Error" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-500')
    })

    it('should not show error styling without error', () => {
      render(<Input name="email" />)
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveClass('border-red-500')
    })

    it('should have error text color', () => {
      render(<Input name="email" error="Error message" />)
      const errorText = screen.getByText('Error message')
      expect(errorText).toHaveClass('text-red-500')
    })
  })

  describe('Helper Text', () => {
    it('should display helper text', () => {
      render(<Input name="email" helperText="We will never share your email" />)
      expect(screen.getByText('We will never share your email')).toBeInTheDocument()
    })

    it('should not show helper text when error is present', () => {
      render(<Input name="email" helperText="Helper" error="Error" />)
      expect(screen.queryByText('Helper')).not.toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should have helper text styling', () => {
      render(<Input name="email" helperText="Helper text" />)
      const helperText = screen.getByText('Helper text')
      expect(helperText).toHaveClass('text-gray-500')
    })
  })

  describe('Input Types', () => {
    it('should default to text type', () => {
      render(<Input name="test" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render email type', () => {
      render(<Input name="email" type="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render password type', () => {
      render(<Input name="password" type="password" />)
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it('should render number type', () => {
      render(<Input name="age" type="number" />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should render tel type', () => {
      render(<Input name="phone" type="tel" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'tel')
    })
  })

  describe('User Interaction', () => {
    it('should handle onChange event', async () => {
      const handleChange = jest.fn()
      render(<Input name="test" onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'hello')

      expect(handleChange).toHaveBeenCalled()
    })

    it('should update value when typing', async () => {
      render(<Input name="test" />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'test value')

      expect(input).toHaveValue('test value')
    })

    it('should handle onBlur event', () => {
      const handleBlur = jest.fn()
      render(<Input name="test" onBlur={handleBlur} />)

      const input = screen.getByRole('textbox')
      fireEvent.blur(input)

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('should handle onFocus event', () => {
      const handleFocus = jest.fn()
      render(<Input name="test" onFocus={handleFocus} />)

      const input = screen.getByRole('textbox')
      fireEvent.focus(input)

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input name="test" disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('should not trigger onChange when disabled', async () => {
      const handleChange = jest.fn()
      render(<Input name="test" disabled onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'test')

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Custom className', () => {
    it('should apply custom className to input', () => {
      render(<Input name="test" className="custom-class" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
    })

    it('should merge with default classes', () => {
      render(<Input name="test" className="custom-class" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('w-full', 'custom-class')
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled input', () => {
      const { rerender } = render(<Input name="test" value="initial" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('initial')

      rerender(<Input name="test" value="updated" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('updated')
    })

    it('should work as uncontrolled input with defaultValue', () => {
      render(<Input name="test" defaultValue="default" />)
      expect(screen.getByRole('textbox')).toHaveValue('default')
    })
  })

  describe('Ref forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = { current: null } as React.RefObject<HTMLInputElement>
      render(<Input name="test" ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('should allow focus via ref', () => {
      const ref = { current: null } as React.RefObject<HTMLInputElement>
      render(<Input name="test" ref={ref} />)

      ref.current?.focus()
      expect(document.activeElement).toBe(ref.current)
    })
  })

  describe('Accessibility', () => {
    it('should have focus ring on focus', () => {
      render(<Input name="test" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus:ring-2')
    })

    it('should be accessible with label', () => {
      render(<Input name="email" label="Email Address" />)
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    })
  })
})
