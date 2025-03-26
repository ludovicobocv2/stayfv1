import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Verificar se o usuário está autenticado
  const { data: { session } } = await supabase.auth.getSession()

  // Lista de rotas públicas
  const publicRoutes = [
    '/auth/login', 
    '/auth/cadastro', 
    '/auth/callback',
    '/test',
    '/test/supabase',
    '/test/auth'
  ]

  // Verificar se a rota atual é pública
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Se não estiver autenticado e tentar acessar uma rota protegida
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Se estiver autenticado e tentar acessar uma rota pública de autenticação
  if (session && isPublicRoute && request.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
} 