// Helper function to get localized field values
export function getLocalizedValue<T>(
  field: { en: T } | T,
  locale: 'en' = 'en'
): T {
  if (typeof field === 'object' && field !== null && 'en' in field) {
    return field[locale] || field.en
  }
  return field as T
}

// Helper function to format dates
export function formatDate(date: string, locale: 'en' = 'en'): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(
    new Date(date)
  )
}