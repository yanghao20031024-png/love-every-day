import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  // 检查用户是否已有情侣
  const { data: existing } = await supabase
    .from('couple_members')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: '已加入情侣空间' }, { status: 400 })
  }

  const { invite_code } = await request.json()

  if (!invite_code || typeof invite_code !== 'string' || invite_code.length !== 6) {
    return NextResponse.json({ error: '无效的邀请码' }, { status: 400 })
  }

  // 查找邀请码
  const { data: couple, error: findErr } = await supabase
    .from('couples')
    .select('id, invite_code')
    .eq('invite_code', invite_code)
    .single()

  if (findErr || !couple) {
    return NextResponse.json({ error: '邀请码无效' }, { status: 404 })
  }

  // 检查情侣是否已满员（最多2人）
  const { count } = await supabase
    .from('couple_members')
    .select('id', { count: 'exact', head: true })
    .eq('couple_id', couple.id)

  if (count && count >= 2) {
    return NextResponse.json({ error: '情侣空间已满员（最多2人）' }, { status: 400 })
  }

  // 加入情侣
  const { error: memberErr } = await supabase.from('couple_members').insert({
    couple_id: couple.id,
    user_id: user.id,
    role: 'member',
  })

  if (memberErr) {
    console.error('Join error:', memberErr)
    return NextResponse.json({ error: '加入失败' }, { status: 500 })
  }

  return NextResponse.json({ couple_id: couple.id })
}
