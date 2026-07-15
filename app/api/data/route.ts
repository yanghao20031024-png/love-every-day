import { NextRequest, NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await getData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: '读取数据失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const success = await saveData(data);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: '保存数据失败' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: '保存数据失败' }, { status: 500 });
  }
}
