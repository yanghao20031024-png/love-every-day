import { createClient } from './supabase/server'
import type { LoveData } from '@/hooks/useLoveData'

const defaultData: LoveData = {
  couple: {
    person1: { name: '他', avatar: '' },
    person2: { name: '她', avatar: '' },
    startDate: new Date().toISOString().split('T')[0],
  },
  timeline: [],
  photos: [],
  diary: [],
  countdowns: [
    { id: '1', title: '一周年纪念日', date: '2025-01-01', emoji: '🎂' },
  ],
  letters: [],
}

export async function getServerData(coupleId: string): Promise<LoveData> {
  const supabase = await createClient()

  try {
    const { data } = await supabase
      .from('love_data')
      .select('data')
      .eq('couple_id', coupleId)
      .eq('id', 'main')
      .single()

    if (!data?.data) {
      return defaultData
    }

    return data.data as LoveData
  } catch {
    return defaultData
  }
}
