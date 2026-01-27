import {
  cn,
  formatPrice,
  formatDate,
  formatTime,
  slugify,
  generateOrderNumber,
  generateQRCodeData,
  getStandStatusColor,
  getStandStatusLabel,
  truncate,
  isValidEmail,
  isValidSiret,
} from '@/lib/utils'

describe('cn (class names utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional')
    expect(cn('base', false && 'conditional')).toBe('base')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2')
  })

  it('should handle undefined and null values', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
  })
})

describe('formatPrice', () => {
  it('should format price in EUR by default', () => {
    const formatted = formatPrice(15)
    expect(formatted).toMatch(/15/)
    expect(formatted).toMatch(/€/)
  })

  it('should format price with decimals', () => {
    const formatted = formatPrice(25.50)
    expect(formatted).toMatch(/25/)
  })

  it('should format zero price', () => {
    const formatted = formatPrice(0)
    expect(formatted).toMatch(/0/)
  })

  it('should format large prices', () => {
    const formatted = formatPrice(1500)
    expect(formatted).toMatch(/1/)
    expect(formatted).toMatch(/500/)
  })

  it('should handle custom currency', () => {
    const formatted = formatPrice(100, 'USD')
    expect(formatted).toMatch(/100/)
  })
})

describe('formatDate', () => {
  it('should format Date object', () => {
    const date = new Date('2026-03-28')
    const formatted = formatDate(date)
    expect(formatted).toMatch(/28/)
    expect(formatted).toMatch(/mars/i)
    expect(formatted).toMatch(/2026/)
  })

  it('should format string date', () => {
    const formatted = formatDate('2026-03-28')
    expect(formatted).toMatch(/28/)
    expect(formatted).toMatch(/2026/)
  })

  it('should handle custom options', () => {
    const formatted = formatDate('2026-03-28', { weekday: 'long' })
    expect(formatted).toMatch(/samedi/i)
  })
})

describe('formatTime', () => {
  it('should format time from Date object', () => {
    const date = new Date('2026-03-28T14:30:00')
    const formatted = formatTime(date)
    expect(formatted).toMatch(/14/)
    expect(formatted).toMatch(/30/)
  })

  it('should format time from string', () => {
    const formatted = formatTime('2026-03-28T09:15:00')
    expect(formatted).toMatch(/09/)
    expect(formatted).toMatch(/15/)
  })
})

describe('slugify', () => {
  it('should convert text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('should handle accents', () => {
    expect(slugify('Café Résumé')).toBe('cafe-resume')
  })

  it('should handle special characters', () => {
    expect(slugify('Test & Demo!')).toBe('test-demo')
  })

  it('should handle multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world')
  })

  it('should handle leading and trailing dashes', () => {
    expect(slugify('--Hello World--')).toBe('hello-world')
  })

  it('should handle French accented characters', () => {
    expect(slugify('Événement à Nantes')).toBe('evenement-a-nantes')
  })

  it('should handle empty string', () => {
    expect(slugify('')).toBe('')
  })
})

describe('generateOrderNumber', () => {
  it('should generate order number with CAE prefix', () => {
    const orderNumber = generateOrderNumber()
    expect(orderNumber).toMatch(/^CAE-/)
  })

  it('should generate unique order numbers', () => {
    const order1 = generateOrderNumber()
    const order2 = generateOrderNumber()
    expect(order1).not.toBe(order2)
  })

  it('should generate order number with correct format', () => {
    const orderNumber = generateOrderNumber()
    const parts = orderNumber.split('-')
    expect(parts.length).toBe(3)
    expect(parts[0]).toBe('CAE')
  })
})

describe('generateQRCodeData', () => {
  it('should generate QR code data with CANNAGRI prefix', () => {
    const data = generateQRCodeData('order123', 'ticket456')
    expect(data).toMatch(/^CANNAGRI-/)
  })

  it('should include orderId and ticketId', () => {
    const data = generateQRCodeData('order123', 'ticket456')
    expect(data).toContain('order123')
    expect(data).toContain('ticket456')
  })

  it('should include timestamp', () => {
    const data = generateQRCodeData('order123', 'ticket456')
    const parts = data.split('-')
    expect(parts.length).toBe(4)
    const timestamp = parseInt(parts[3])
    expect(timestamp).toBeGreaterThan(0)
  })
})

describe('getStandStatusColor', () => {
  it('should return green for FREE status', () => {
    expect(getStandStatusColor('FREE')).toBe('bg-green-500')
  })

  it('should return orange for RESERVED status', () => {
    expect(getStandStatusColor('RESERVED')).toBe('bg-orange-500')
  })

  it('should return red for SOLD status', () => {
    expect(getStandStatusColor('SOLD')).toBe('bg-red-500')
  })

  it('should return gray for unknown status', () => {
    expect(getStandStatusColor('UNKNOWN')).toBe('bg-gray-500')
  })
})

describe('getStandStatusLabel', () => {
  it('should return French label for FREE', () => {
    expect(getStandStatusLabel('FREE')).toBe('Libre')
  })

  it('should return French label for RESERVED', () => {
    expect(getStandStatusLabel('RESERVED')).toBe('Réservé')
  })

  it('should return French label for SOLD', () => {
    expect(getStandStatusLabel('SOLD')).toBe('Vendu')
  })

  it('should return original status for unknown', () => {
    expect(getStandStatusLabel('CUSTOM')).toBe('CUSTOM')
  })
})

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...')
  })

  it('should not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })

  it('should handle exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello')
  })

  it('should handle empty string', () => {
    expect(truncate('', 5)).toBe('')
  })
})

describe('isValidEmail', () => {
  it('should validate correct email', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })

  it('should validate email with subdomain', () => {
    expect(isValidEmail('test@mail.example.com')).toBe(true)
  })

  it('should invalidate email without @', () => {
    expect(isValidEmail('testexample.com')).toBe(false)
  })

  it('should invalidate email without domain', () => {
    expect(isValidEmail('test@')).toBe(false)
  })

  it('should invalidate email without username', () => {
    expect(isValidEmail('@example.com')).toBe(false)
  })

  it('should invalidate email with spaces', () => {
    expect(isValidEmail('test @example.com')).toBe(false)
  })

  it('should invalidate empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('should validate email with plus sign', () => {
    expect(isValidEmail('test+tag@example.com')).toBe(true)
  })

  it('should validate email with dots in username', () => {
    expect(isValidEmail('test.user@example.com')).toBe(true)
  })
})

describe('isValidSiret', () => {
  it('should validate correct SIRET (14 digits)', () => {
    expect(isValidSiret('12345678901234')).toBe(true)
  })

  it('should validate SIRET with spaces', () => {
    expect(isValidSiret('123 456 789 01234')).toBe(true)
  })

  it('should invalidate SIRET with less than 14 digits', () => {
    expect(isValidSiret('1234567890123')).toBe(false)
  })

  it('should invalidate SIRET with more than 14 digits', () => {
    expect(isValidSiret('123456789012345')).toBe(false)
  })

  it('should invalidate SIRET with letters', () => {
    expect(isValidSiret('1234567890123A')).toBe(false)
  })

  it('should invalidate empty string', () => {
    expect(isValidSiret('')).toBe(false)
  })
})
