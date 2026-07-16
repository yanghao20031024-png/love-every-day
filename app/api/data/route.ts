import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const defaultData = {
  couple: {
    person1: { name: '他', avatar: '' },
    person2: { name: '她', avatar: '' },
    startDate: new Date().toISOString().split('T')[0],
  },
  timeline: [],
  photos: [],
  diary: [],
  countdowns: [
    {
      id: '1',
      title: '一周年纪念日',
      date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      emoji: '🎂',
    },
  ],
  letters: [],
  wishlist: [],
  coupons: [],
  dailyQuestions: [],
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { data: member } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: '未加入情侣空间' }, { status: 404 })
  }

  const { data } = await supabase
    .from('love_data')
    .select('data')
    .eq('couple_id', member.couple_id)
    .eq('id', 'main')
    .single()

  if (!data) {
    // 懒初始化
    await supabase.from('love_data').insert({
      id: 'main',
      couple_id: member.couple_id,
      data: defaultData,
      updated_at: new Date().toISOString(),
    })
    return NextResponse.json(defaultData)
  }

  return NextResponse.json(data.data)
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { data: member } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: '未加入情侣空间' }, { status: 404 })
  }

  const newData = await request.json()

  // 先检查是否已存在
  const { data: existing } = await supabase
    .from('love_data')
    .select('id')
    .eq('couple_id', member.couple_id)
    .eq('id', 'main')
    .single()

  let error

  if (existing) {
    // 更新已有记录
    const result = await supabase
      .from('love_data')
      .update({
        data: newData,
        updated_at: new Date().toISOString(),
      })
      .eq('couple_id', member.couple_id)
      .eq('id', 'main')
    error = result.error
  } else {
    // 插入新记录
    const result = await supabase.from('love_data').insert({
      id: 'main',
      couple_id: member.couple_id,
      data: newData,
      updated_at: new Date().toISOString(),
    })
    error = result.error
  }

  if (error) {
    console.error('Save data error:', error)
    return NextResponse.json({ error: '保存失败: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
