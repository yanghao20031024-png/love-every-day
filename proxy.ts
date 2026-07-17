import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'

const publicRoutes = ['/auth/login', '/auth/register', '/auth/bind']

export default async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request)
  const path = request.nextUrl.pathname

  // 公开路由直接放行
  if (publicRoutes.some((r) => path.startsWith(r))) {
    return supabaseResponse
  }

  // API 路由直接放行（自己有认证检查）
  if (path.startsWith('/api/')) {
    return supabaseResponse
  }

  // 检查登录状态
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 未登录 → 登录页
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // 已登录 → 检查是否有情侣
  const { data: member } = await supabase
    .from('couple_members')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  // 没有情侣 → 绑定页
  if (!member || member.length === 0) {
    if (path !== '/auth/bind') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/bind'
      return NextResponse.redirect(url)
    }
  }

  // 已有情侣 → 不让访问绑定页
  if (member && member.length > 0 && path === '/auth/bind') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
