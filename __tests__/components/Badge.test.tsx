import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/Badge'

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render badge with children', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('should render as a span element', () => {
      render(<Badge>Test</Badge>)
      const badge = screen.getByText('Test')
      expect(badge.tagName).toBe('SPAN')
    })
  })

  describe('Variants', () => {
    it('should render with default variant', () => {
      render(<Badge>Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800')
    })

    it('should render with success variant', () => {
      render(<Badge variant="success">Success</Badge>)
      const badge = screen.getByText('Success')
      expect(badge).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('should render with warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>)
      const badge = screen.getByText('Warning')
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-800')
    })

    it('should render with error variant', () => {
      render(<Badge variant="error">Error</Badge>)
      const badge = screen.getByText('Error')
      expect(badge).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('should render with info variant', () => {
      render(<Badge variant="info">Info</Badge>)
      const badge = screen.getByText('Info')
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
    })

    it('should render with forest variant', () => {
      render(<Badge variant="forest">Forest</Badge>)
      const badge = screen.getByText('Forest')
      expect(badge).toHaveClass('bg-forest', 'text-white')
    })

    it('should render with sage variant', () => {
      render(<Badge variant="sage">Sage</Badge>)
      const badge = screen.getByText('Sage')
      expect(badge).toHaveClass('bg-sage', 'text-forest')
    })

    it('should render with terracotta variant', () => {
      render(<Badge variant="terracotta">Terracotta</Badge>)
      const badge = screen.getByText('Terracotta')
      expect(badge).toHaveClass('bg-terracotta', 'text-white')
    })
  })

  describe('Sizes', () => {
    it('should render with default medium size', () => {
      render(<Badge>Medium</Badge>)
      const badge = screen.getByText('Medium')
      expect(badge).toHaveClass('px-3', 'py-1', 'text-sm')
    })

    it('should render with small size', () => {
      render(<Badge size="sm">Small</Badge>)
      const badge = screen.getByText('Small')
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs')
    })
  })

  describe('Base Styles', () => {
    it('should have inline-flex display', () => {
      render(<Badge>Test</Badge>)
      const badge = screen.getByText('Test')
      expect(badge).toHaveClass('inline-flex')
    })

    it('should have rounded-full border radius', () => {
      render(<Badge>Test</Badge>)
      const badge = screen.getByText('Test')
      expect(badge).toHaveClass('rounded-full')
    })

    it('should have font-medium weight', () => {
      render(<Badge>Test</Badge>)
      const badge = screen.getByText('Test')
      expect(badge).toHaveClass('font-medium')
    })

    it('should have items-center alignment', () => {
      render(<Badge>Test</Badge>)
      const badge = screen.getByText('Test')
      expect(badge).toHaveClass('items-center')
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge).toHaveClass('custom-class')
    })

    it('should merge custom className with default classes', () => {
      render(<Badge className="custom-class">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge).toHaveClass('inline-flex', 'custom-class')
    })
  })

  describe('HTML Attributes', () => {
    it('should pass through data attributes', () => {
      render(<Badge data-testid="test-badge">Test</Badge>)
      expect(screen.getByTestId('test-badge')).toBeInTheDocument()
    })

    it('should pass through aria attributes', () => {
      render(<Badge aria-label="Status badge">Status</Badge>)
      const badge = screen.getByText('Status')
      expect(badge).toHaveAttribute('aria-label', 'Status badge')
    })

    it('should pass through onClick handler', () => {
      const handleClick = jest.fn()
      render(<Badge onClick={handleClick}>Clickable</Badge>)

      screen.getByText('Clickable').click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Ref forwarding', () => {
    it('should forward ref to span element', () => {
      const ref = { current: null } as React.RefObject<HTMLSpanElement>
      render(<Badge ref={ref}>Ref Badge</Badge>)
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })
  })

  describe('Content Types', () => {
    it('should render with text content', () => {
      render(<Badge>Text Content</Badge>)
      expect(screen.getByText('Text Content')).toBeInTheDocument()
    })

    it('should render with number content', () => {
      render(<Badge>{42}</Badge>)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should render with JSX content', () => {
      render(
        <Badge>
          <span data-testid="inner">Inner</span>
        </Badge>
      )
      expect(screen.getByTestId('inner')).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('should work for ticket status', () => {
      render(
        <Badge variant="success">PAID</Badge>
      )
      const badge = screen.getByText('PAID')
      expect(badge).toHaveClass('bg-green-100')
    })

    it('should work for stand status', () => {
      render(
        <Badge variant="error">SOLD</Badge>
      )
      const badge = screen.getByText('SOLD')
      expect(badge).toHaveClass('bg-red-100')
    })

    it('should work for sponsor type', () => {
      render(
        <Badge variant="forest">PLATINE</Badge>
      )
      const badge = screen.getByText('PLATINE')
      expect(badge).toHaveClass('bg-forest', 'text-white')
    })

    it('should work for pending status', () => {
      render(
        <Badge variant="warning">PENDING</Badge>
      )
      const badge = screen.getByText('PENDING')
      expect(badge).toHaveClass('bg-orange-100')
    })
  })
})
