import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 默认数据
const defaultData = {
  couple: {
    person1: { name: "他", avatar: "" },
    person2: { name: "她", avatar: "" },
    startDate: "2024-01-01",
  },
  timeline: [],
  photos: [],
  diary: [],
  countdowns: [
    {
      id: "1",
      title: "一周年纪念日",
      date: "2025-01-01",
      emoji: "🎂",
    },
  ],
  letters: [],
};

// 获取数据
export async function getData() {
  try {
    const { data, error } = await supabase
      .from('love_data')
      .select('data')
      .eq('id', 'main')
      .single();

    if (error || !data) {
      // 如果没有数据，初始化默认数据
      await initData();
      return defaultData;
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return defaultData;
  }
}

// 保存数据
export async function saveData(newData: unknown) {
  try {
    const { error } = await supabase
      .from('love_data')
      .upsert({ id: 'main', data: newData, updated_at: new Date().toISOString() });

    if (error) {
      console.error('Error saving data:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

// 初始化数据
async function initData() {
  try {
    await supabase
      .from('love_data')
      .upsert({ id: 'main', data: defaultData, updated_at: new Date().toISOString() });
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}
