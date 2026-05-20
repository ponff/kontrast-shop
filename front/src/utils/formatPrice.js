// утилита для форматиорвания цены
export const formatRub = price => {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
}

export const parseRub = priceString => {
  if (!priceString) return 0
  const digits = priceString.replace(/[^\d]/g, '')
  const n = parseInt(digits, 10)
  return Number.isFinite(n) ? n : 0
}
