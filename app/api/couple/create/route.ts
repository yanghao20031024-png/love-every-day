import { NextResponse } from 'next/server'
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
}

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 检查用户是否已有情侣
    const { data: existing, error: checkErr } = await supabase
      .from('couple_members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (checkErr && checkErr.code !== 'PGRST116') {
      console.error('Check member error:', checkErr)
      return NextResponse.json({ error: '数据库错误，请确认已执行 SQL 迁移脚本' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ error: '已加入情侣空间' }, { status: 400 })
    }

    // 生成唯一的6位邀请码
    let inviteCode = ''
    let retries = 0
    while (retries < 10) {
      inviteCode = Math.floor(100000 + Math.random() * 900000).toString()
      const { data: dup } = await supabase
        .from('couples')
        .select('id')
        .eq('invite_code', inviteCode)
        .maybeSingle()
      if (!dup) break
      retries++
    }

    if (retries >= 10) {
      return NextResponse.json({ error: '生成邀请码失败，请重试' }, { status: 500 })
    }

    // 创建情侣
    const { data: couple, error: coupleErr } = await supabase
      .from('couples')
      .insert({ invite_code: inviteCode })
      .select()
      .single()

    if (coupleErr) {
      console.error('Create couple error:', coupleErr)
      return NextResponse.json({ error: '创建情侣空间失败: ' + coupleErr.message }, { status: 500 })
    }

    // 添加创建者为 admin
    const { error: memberErr } = await supabase.from('couple_members').insert({
      couple_id: couple.id,
      user_id: user.id,
      role: 'admin',
    })

    if (memberErr) {
      console.error('Create member error:', memberErr)
      return NextResponse.json({ error: '添加成员失败: ' + memberErr.message }, { status: 500 })
    }

    // 初始化 love_data（如果已有则忽略）
    const { error: dataErr } = await supabase.from('love_data').upsert(
      {
        id: 'main',
        couple_id: couple.id,
        data: defaultData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

    if (dataErr) {
      console.error('Init love_data error:', dataErr)
      // 不阻断流程
    }

    return NextResponse.json({ invite_code: inviteCode, couple_id: couple.id })
  } catch (error) {
    console.error('Unexpected error in couple create:', error)
    return NextResponse.json({ error: '服务器错误: ' + (error as Error).message }, { status: 500 })
  }
}
