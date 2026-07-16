import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const publicRoutes = ['/auth/login', '/auth/register']

export default async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request)
  const path = request.nextUrl.pathname

  // 简单逻辑：未登录 → 登录页，已登录 → 正常访问
  // 不再需要绑定页的检查

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
