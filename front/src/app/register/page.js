'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Label, Button } from '@/components/ui'
import { useUserStore } from '@/store/userStore'
import { toast } from 'sonner'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const user = useUserStore(state => state.user)
  const register = useUserStore(state => state.register)
  const loading = useUserStore(state => state.loading)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [patronymic, setPatronymic] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (user) {
      router.push('/profile')
    }
  }, [user, router])

  const validateForm = () => {
    const errors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\+?[\d\s()\-]{7,20}$/

    if (!firstName.trim()) {
      errors.firstName = 'Введите имя'
    }
    if (!lastName.trim()) {
      errors.lastName = 'Введите фамилию'
    }
    if (!email.trim()) {
      errors.email = 'Введите email'
    } else if (!emailRegex.test(email)) {
      errors.email = 'Введите корректный email'
    }
    if (!password) {
      errors.password = 'Введите пароль'
    } else if (password.length < 8) {
      errors.password = 'Пароль должен содержать минимум 8 символов'
    }
    if (phone && !phoneRegex.test(phone)) {
      errors.phone = 'Введите корректный телефон'
    }
    if (postalCode && postalCode.length > 20) {
      errors.postalCode = 'Почтовый индекс слишком длинный'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (!validateForm()) {
      toast.error('Проверьте поля формы')
      return
    }

    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        patronymic,
        email,
        password,
        phone,
        address,
        city,
        postal_code: postalCode,
      })
      toast.success('Аккаунт создан, вы вошли в систему')
      router.push('/profile')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <main className='container mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-8'>
      <div className='max-w-3xl mx-auto bg-white border border-[#C6A884] rounded-xl p-6 xs:p-7 sm:p-8'>
        <h1 className='text-2xl xs:text-3xl font-molot text-black mb-4'>Регистрация пользователя</h1>
        <p className='text-sm xs:text-base text-[#4A382B] mb-6'>Создайте аккаунт, чтобы сохранить корзину и просматривать историю заказов.</p>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='lastName'>Фамилия</Label>
              <Input
                id='lastName'
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder='Иванов'
                required
              />
              {formErrors.lastName && (
                <p className='text-sm text-red-600 mt-1'>{formErrors.lastName}</p>
              )}
            </div>
            <div>
              <Label htmlFor='firstName'>Имя</Label>
              <Input
                id='firstName'
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder='Иван'
                required
              />
              {formErrors.firstName && (
                <p className='text-sm text-red-600 mt-1'>{formErrors.firstName}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='patronymic'>Отчество</Label>
              <Input
                id='patronymic'
                value={patronymic}
                onChange={e => setPatronymic(e.target.value)}
                placeholder='Иванович'
              />
            </div>
            <div>
              <Label htmlFor='phone'>Телефон</Label>
              <Input
                id='phone'
                type='tel'
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder='+7 (999) 123-45-67'
              />
              {formErrors.phone && (
                <p className='text-sm text-red-600 mt-1'>{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='name@example.com'
                required
              />
              {formErrors.email && (
                <p className='text-sm text-red-600 mt-1'>{formErrors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor='password'>Пароль</Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='••••••••'
                required
              />
              {formErrors.password && (
                <p className='text-sm text-red-600 mt-1'>{formErrors.password}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='city'>Город</Label>
              <Input
                id='city'
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder='Москва'
              />
            </div>
            <div>
              <Label htmlFor='postalCode'>Почтовый индекс</Label>
              <Input
                id='postalCode'
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                placeholder='123456'
              />
              {formErrors.postalCode && (
                <p className='text-sm text-red-600 mt-1'>{formErrors.postalCode}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor='address'>Адрес</Label>
            <Input
              id='address'
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder='г. Москва, ул. Примерная, д. 1'
            />
          </div>

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <Button type='submit' disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
            <Link href='/login' className='text-sm xs:text-base text-[#4A382B] underline'>
              Уже есть аккаунт? Войти
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
