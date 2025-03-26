import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Login - StayFocus',
  description: 'Faça login na sua conta StayFocus'
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
} 