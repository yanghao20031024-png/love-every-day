import { supabase } from './supabase';
import type { LoveData } from '@/hooks/useLoveData';

const defaultData: LoveData = {
  couple: {
    person1: { name: "他", avatar: "" },
    person2: { name: "她", avatar: "" },
    startDate: "2024-01-01",
  },
  timeline: [],
  photos: [],
  diary: [],
  countdowns: [
    { id: "1", title: "一周年纪念日", date: "2025-01-01", emoji: "🎂" },
  ],
  letters: [],
};

export async function getServerData(): Promise<LoveData> {
  try {
    const { data, error } = await supabase
      .from('love_data')
      .select('data')
      .eq('id', 'main')
      .single();

    if (error || !data?.data) {
      return defaultData;
    }

    return data.data as LoveData;
  } catch {
    return defaultData;
  }
}
