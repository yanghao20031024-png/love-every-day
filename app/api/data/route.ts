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
  countdowns: [],
  letters: [],
  wishlist: [],
  coupons: [],
  dailyQuestions: [],
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 直接用 user_id 查 couple_members
    const { data: member, error: memberErr } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .limit(1)

    console.log('GET member lookup:', { user_id: user.id, member, memberErr })

    if (memberErr || !member || member.length === 0) {
      // 没有 couple，自动创建一个
      const { data: couple, error: coupleErr } = await supabase
        .from('couples')
        .insert({ invite_code: Math.floor(100000 + Math.random() * 900000).toString() })
        .select()
        .single()

      if (coupleErr) {
        console.error('Create couple error:', coupleErr)
        return NextResponse.json(defaultData)
      }

      await supabase.from('couple_members').insert({
        couple_id: couple.id,
        user_id: user.id,
        role: 'admin',
      })

      await supabase.from('love_data').insert({
        id: 'main',
        couple_id: couple.id,
        data: defaultData,
        updated_at: new Date().toISOString(),
      })

      return NextResponse.json(defaultData)
    }

    const coupleId = member[0].couple_id

    const { data: loveData, error: dataErr } = await supabase
      .from('love_data')
      .select('data')
      .eq('couple_id', coupleId)
      .eq('id', 'main')
      .limit(1)

    console.log('GET data lookup:', { coupleId, loveData, dataErr })

    if (dataErr || !loveData || loveData.length === 0) {
      await supabase.from('love_data').insert({
        id: 'main',
        couple_id: coupleId,
        data: defaultData,
        updated_at: new Date().toISOString(),
      })
      return NextResponse.json(defaultData)
    }

    return NextResponse.json(loveData[0].data)
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json(defaultData)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { data: member, error: memberErr } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .limit(1)

    console.log('PUT member lookup:', { user_id: user.id, member, memberErr })

    if (memberErr || !member || member.length === 0) {
      return NextResponse.json({ error: '未加入情侣空间' }, { status: 404 })
    }

    const coupleId = member[0].couple_id
    const newData = await request.json()

    // 直接用 update，不用 upsert
    const { error: updateErr, count } = await supabase
      .from('love_data')
      .update({
        data: newData,
        updated_at: new Date().toISOString(),
      })
      .eq('couple_id', coupleId)
      .eq('id', 'main')

    console.log('PUT update result:', { updateErr, count })

    if (updateErr) {
      console.error('Update error:', updateErr)
      return NextResponse.json({ error: '保存失败: ' + updateErr.message }, { status: 500 })
    }

    // 如果 update 没有匹配到行，尝试 insert
    if (count === 0) {
      const { error: insertErr } = await supabase.from('love_data').insert({
        id: 'main',
        couple_id: coupleId,
        data: newData,
        updated_at: new Date().toISOString(),
      })

      console.log('PUT insert result:', { insertErr })

      if (insertErr) {
        console.error('Insert error:', insertErr)
        return NextResponse.json({ error: '保存失败: ' + insertErr.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
