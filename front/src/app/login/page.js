'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Label, Button } from '@/components/ui'
import { useUserStore } from '@/store/userStore'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const user = useUserStore(state => state.user)
  const login = useUserStore(state => state.login)
  const loading = useUserStore(state => state.loading)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user) {
      router.push('/profile')
    }
  }, [user, router])

  const handleSubmit = async event => {
    event.preventDefault()
    try {
      await login({ email, password })
      toast.success('Вы успешно вошли в аккаунт')
      router.push('/profile')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <main className='container mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-8'>
      <div className='max-w-2xl mx-auto bg-white border border-[#C6A884] rounded-xl p-6 xs:p-7 sm:p-8'>
        <h1 className='text-2xl xs:text-3xl font-molot text-black mb-4'>Вход в личный кабинет</h1>
        <p className='text-sm xs:text-base text-[#4A382B] mb-6'>Введите email и пароль, чтобы получить доступ к вашему профилю и корзине.</p>

        <form className='space-y-4' onSubmit={handleSubmit}>
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
          </div>

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <Button type='submit' disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
            <Link href='/register' className='text-sm xs:text-base text-[#4A382B] underline'>
              Нет аккаунта? Зарегистрироваться
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
