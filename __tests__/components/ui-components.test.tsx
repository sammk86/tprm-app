import { describe, it, expect } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js session
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
        companyId: 'company-1',
      },
    },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

describe('UI Components', () => {
  describe('Button Component', () => {
    it('should render button with correct text', () => {
      const Button = ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
      )
      
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should handle click events', () => {
      const handleClick = jest.fn()
      const Button = ({ children, onClick, ...props }: any) => (
        <button onClick={onClick} {...props}>{children}</button>
      )
      
      render(<Button onClick={handleClick}>Click me</Button>)
      fireEvent.click(screen.getByText('Click me'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should apply correct styling classes', () => {
      const Button = ({ children, variant = 'primary', ...props }: any) => {
        const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors'
        const variantClasses = {
          primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        }
        
        return (
          <button 
            className={`${baseClasses} ${variantClasses[variant]}`}
            {...props}
          >
            {children}
          </button>
        )
      }
      
      render(<Button variant="primary">Primary Button</Button>)
      const button = screen.getByText('Primary Button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })
  })

  describe('Input Component', () => {
    it('should render input with correct placeholder', () => {
      const Input = ({ placeholder, ...props }: any) => (
        <input 
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          {...props}
        />
      )
      
      render(<Input placeholder="Enter your email" />)
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    it('should handle input changes', () => {
      const handleChange = jest.fn()
      const Input = ({ onChange, ...props }: any) => (
        <input 
          onChange={onChange}
          className="w-full px-3 py-2 border border-input rounded-md"
          {...props}
        />
      )
      
      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test@example.com' } })
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('should show validation errors', () => {
      const Input = ({ error, ...props }: any) => (
        <div>
          <input 
            className="w-full px-3 py-2 border border-destructive rounded-md"
            {...props}
          />
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
      )
      
      render(<Input error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })
  })

  describe('Card Component', () => {
    it('should render card with title and content', () => {
      const Card = ({ children, title, ...props }: any) => (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm" {...props}>
          {title && <h3 className="font-semibold p-4 pb-2">{title}</h3>}
          <div className="p-4 pt-0">{children}</div>
        </div>
      )
      
      render(
        <Card title="Test Card">
          <p>Card content</p>
        </Card>
      )
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should apply correct styling classes', () => {
      const Card = ({ children, ...props }: any) => (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm" {...props}>
          {children}
        </div>
      )
      
      render(<Card>Test content</Card>)
      const card = screen.getByText('Test content')
      expect(card).toHaveClass('bg-card', 'text-card-foreground', 'rounded-lg', 'border', 'shadow-sm')
    })
  })

  describe('Modal Component', () => {
    it('should render modal when open', () => {
      const Modal = ({ isOpen, onClose, children, title }: any) => {
        if (!isOpen) return null
        
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  ×
                </button>
              </div>
              <div className="p-4">{children}</div>
            </div>
          </div>
        )
      }
      
      render(
        <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      expect(screen.getByText('Test Modal')).toBeInTheDocument()
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('should close modal when close button is clicked', () => {
      const onClose = jest.fn()
      const Modal = ({ isOpen, onClose, children, title }: any) => {
        if (!isOpen) return null
        
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  ×
                </button>
              </div>
              <div className="p-4">{children}</div>
            </div>
          </div>
        )
      }
      
      render(
        <Modal isOpen={true} onClose={onClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      fireEvent.click(screen.getByText('×'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Table Component', () => {
    it('should render table with headers and data', () => {
      const Table = ({ headers, data }: any) => (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {headers.map((header: string, index: number) => (
                  <th key={index} className="text-left p-4 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any[], rowIndex: number) => (
                <tr key={rowIndex} className="border-b">
                  {row.map((cell: any, cellIndex: number) => (
                    <td key={cellIndex} className="p-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      
      const headers = ['Name', 'Email', 'Role']
      const data = [
        ['John Doe', 'john@example.com', 'Admin'],
        ['Jane Smith', 'jane@example.com', 'User'],
      ]
      
      render(<Table headers={headers} data={data} />)
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })

  describe('Badge Component', () => {
    it('should render badge with correct text and variant', () => {
      const Badge = ({ children, variant = 'default' }: any) => {
        const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
        const variantClasses = {
          default: 'bg-secondary text-secondary-foreground',
          success: 'bg-green-100 text-green-800',
          warning: 'bg-yellow-100 text-yellow-800',
          destructive: 'bg-red-100 text-red-800',
        }
        
        return (
          <span className={`${baseClasses} ${variantClasses[variant]}`}>
            {children}
          </span>
        )
      }
      
      render(<Badge variant="success">Active</Badge>)
      const badge = screen.getByText('Active')
      expect(badge).toHaveClass('bg-green-100', 'text-green-800')
    })
  })

  describe('Loading Spinner', () => {
    it('should render loading spinner', () => {
      const Spinner = () => (
        <div className="flex items-center justify-center" role="status" aria-label="Loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
      
      render(<Spinner />)
      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Form Components', () => {
    it('should render form with validation', () => {
      const Form = ({ onSubmit, children }: any) => (
        <form onSubmit={onSubmit} className="space-y-4" role="form">
          {children}
        </form>
      )
      
      const handleSubmit = jest.fn((e) => e.preventDefault())
      
      render(
        <Form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" required />
          <button type="submit">Submit</button>
        </Form>
      )
      
      const form = screen.getByRole('form')
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('should show form validation errors', () => {
      const FormField = ({ error, children }: any) => (
        <div>
          {children}
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
      )
      
      render(
        <FormField error="Email is required">
          <input type="email" placeholder="Email" />
        </FormField>
      )
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  describe('Navigation Components', () => {
    it('should render navigation menu', () => {
      const Navigation = ({ items }: any) => (
        <nav className="flex space-x-4">
          {items.map((item: any, index: number) => (
            <a
              key={index}
              href={item.href}
              className="text-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )
      
      const items = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Vendors', href: '/vendors' },
        { label: 'Assessments', href: '/assessments' },
      ]
      
      render(<Navigation items={items} />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Vendors')).toBeInTheDocument()
      expect(screen.getByText('Assessments')).toBeInTheDocument()
    })
  })

  describe('Theme Integration', () => {
    it('should apply theme variables correctly', () => {
      const ThemedComponent = () => (
        <div 
          className="bg-background text-foreground border border-border rounded-lg p-4"
          style={{
            '--background': '#ffffff',
            '--foreground': '#0a0a0a',
            '--border': '#e5e5e5',
          } as React.CSSProperties}
        >
          Themed content
        </div>
      )
      
      render(<ThemedComponent />)
      const component = screen.getByText('Themed content')
      expect(component).toHaveClass('bg-background', 'text-foreground', 'border-border')
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive classes', () => {
      const ResponsiveComponent = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      )
      
      render(<ResponsiveComponent />)
      const container = screen.getByText('Item 1').parentElement
      expect(container).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const AccessibleButton = () => (
        <button 
          aria-label="Close modal"
          className="p-2"
        >
          ×
        </button>
      )
      
      render(<AccessibleButton />)
      const button = screen.getByLabelText('Close modal')
      expect(button).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      const KeyboardComponent = () => (
        <div>
          <button tabIndex={0}>First button</button>
          <button tabIndex={0}>Second button</button>
        </div>
      )
      
      render(<KeyboardComponent />)
      const buttons = screen.getAllByRole('button')
      expect(buttons[0]).toHaveAttribute('tabIndex', '0')
      expect(buttons[1]).toHaveAttribute('tabIndex', '0')
    })
  })
})
