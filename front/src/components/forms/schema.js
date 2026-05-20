import { z } from 'zod'

const phoneRegex = /^(\+?7|8)?\s?-?\(?\d{3}\)?\s?-?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/

export const orderSchema = z.object({
  fullName: z
    .string()
    .min(2, 'ФИО должно содержать минимум 2 символа')
    .max(100, 'ФИО слишком длинное')
    .regex(/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/, 'ФИО может содержать только буквы и дефисы'),
  
  phone: z
    .string()
    .min(5, 'Телефон должен содержать минимум 5 цифр')
    .regex(phoneRegex, 'Введите корректный номер телефона (например: +79991234567 или 89991234567)'),
  
  email: z
    .string()
    .email('Введите корректный email адрес')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
  
  comment: z
    .string()
    .min(10, 'Описание заказа должно содержать минимум 10 символов')
    .max(1000, 'Описание заказа слишком длинное (максимум 1000 символов)'),
})