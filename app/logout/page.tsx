'use client'
import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { logoutAction } from '../actions/logout'


export default function LogoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Call the server action
    logoutAction().then(() => {
      const role = searchParams.get('role')
      if (role === 'admin') {
        router.replace('/admin')
      } else if (role === 'seller') {
        router.replace('/seller')
      } else if (role === 'customer') {
        router.replace('/customer')
      } else {
        router.replace('/')
      }
    })
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="text-lg text-muted-foreground">Logging out...</span>
    </div>
  )
}
