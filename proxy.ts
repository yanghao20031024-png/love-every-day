import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { updateSession } from '@/lib/supabase/middleware'

const publicRoutes = ['/auth/login', '/auth/register', '/auth/bind']

export default async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request)
  const path = request.nextUrl.pathname

  // 用相同的 cookie 重建 client 来获取 user
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

  // 未登录 + 非公开路由 → 登录页
  if (!user && !publicRoutes.some((r) => path.startsWith(r))) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // 已登录 + 没绑定情侣 + 不在绑定页 → 绑定页
  if (user && !path.startsWith('/auth/bind') && path !== '/auth/bind') {
    const { data: member } = await supabase
      .from('couple_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/bind'
      return NextResponse.redirect(url)
    }
  }

  // 已绑定 + 访问绑定页 → 首页
  if (user && path.startsWith('/auth/bind')) {
    const { data: member } = await supabase
      .from('couple_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (member) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
