export function formatCurrency(value: number, currency: string = 'EUR'): string {
  if (isNaN(value)) value = 0
  
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }

  if (currency.length > 3) {
    options.style = 'decimal'
    try {
      return new Intl.NumberFormat('fr-FR', options).format(value) + ` ${currency}`
    } catch (e) {
      return value.toFixed(2) + ` ${currency}`
    }
  }

  try {
    return new Intl.NumberFormat('fr-FR', options).format(value)
  } catch (e) {
    options.style = 'decimal'
    return new Intl.NumberFormat('fr-FR', options).format(value) + ` ${currency}`
  }
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}