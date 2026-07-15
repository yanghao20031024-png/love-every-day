"use client";

import { useLoveData, DiaryEntry } from "@/hooks/useLoveData";
import { useState, useRef } from "react";

const moods = [
  { emoji: "😊", label: "开心" },
  { emoji: "🥰", label: "幸福" },
  { emoji: "😢", label: "思念" },
  { emoji: "😤", label: "生气" },
  { emoji: "🥺", label: "委屈" },
  { emoji: "😴", label: "疲惫" },
  { emoji: "🎉", label: "兴奋" },
  { emoji: "😌", label: "平静" },
];

export default function DiaryPage() {
  const { data, saveData, uploadImage } = useLoveData();
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    mood: "😊",
    images: [] as string[],
    date: new Date().toISOString().split("T")[0],
  });
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;

    const newEntry: DiaryEntry = {
      id: editingId || Date.now().toString(),
      ...form,
    };

    let newDiary;
    if (editingId) {
      newDiary = data.diary.map((d) => (d.id === editingId ? newEntry : d));
    } else {
      newDiary = [...data.diary, newEntry];
    }

    newDiary.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await saveData({ ...data, diary: newDiary });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇日记吗？")) return;
    await saveData({ ...data, diary: data.diary.filter((d) => d.id !== id) });
    setSelectedDiary(null);
  };

  const handleEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setForm({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      images: entry.images,
      date: entry.date,
    });
    setShowEditor(true);
    setSelectedDiary(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const resetForm = () => {
    setForm({ title: "", content: "", mood: "😊", images: [], date: new Date().toISOString().split("T")[0] });
    setShowEditor(false);
    setEditingId(null);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-pink-love flex items-center gap-2">
          <span>📝</span> 恋爱日记
        </h1>
        <button onClick={() => setShowEditor(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> 写日记
        </button>
      </div>

      {/* 日记编辑器 */}
      {showEditor && (
        <div className="card p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-pink-love mb-4">{editingId ? "编辑日记" : "写新日记"}</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input-love"
                />
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">今天的心情</label>
                <select
                  value={form.mood}
                  onChange={(e) => setForm({ ...form, mood: e.target.value })}
                  className="input-love"
                >
                  {moods.map((m) => (
                    <option key={m.emoji} value={m.emoji}>{m.emoji} {m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="今天的故事..."
                className="input-love"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="写下你想说的话..."
                className="textarea-love"
                style={{ minHeight: "200px" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">配图</label>
              <input type="file" ref={fileRef} onChange={handleImageUpload} multiple accept="image/*" className="hidden" />
              <div className="flex gap-2 flex-wrap">
                {form.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button
                      onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-pink-love/30 rounded-lg flex items-center justify-center text-pink-love hover:bg-pink-love/5"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} className="btn-primary">{editingId ? "保存修改" : "发布日记"}</button>
              <button onClick={resetForm} className="px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-50">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 日记列表 */}
      <div className="space-y-6">
        {data.diary.map((entry, index) => (
          <div
            key={entry.id}
            className="card p-6 cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => setSelectedDiary(entry)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{entry.mood}</span>
                <div>
                  <h3 className="font-bold text-gray-800">{entry.title}</h3>
                  <p className="text-sm text-gray-500">{entry.date}</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 line-clamp-3">{entry.content}</p>
            {entry.images.length > 0 && (
              <div className="flex gap-2 mt-3">
                {entry.images.slice(0, 3).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                ))}
                {entry.images.length > 3 && (
                  <div className="w-16 h-16 rounded-lg bg-pink-love/10 flex items-center justify-center text-pink-love font-bold">
                    +{entry.images.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {data.diary.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-gray-500">还没有日记，写下你们的第一篇日记吧~</p>
        </div>
      )}

      {/* 日记详情弹窗 */}
      {selectedDiary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDiary(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedDiary.mood}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedDiary.title}</h2>
                  <p className="text-gray-500">{selectedDiary.date}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(selectedDiary)} className="px-4 py-2 text-pink-love hover:bg-pink-love/10 rounded-lg transition-colors">
                  编辑
                </button>
                <button onClick={() => handleDelete(selectedDiary.id)} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  删除
                </button>
                <button onClick={() => setSelectedDiary(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  关闭
                </button>
              </div>
            </div>
            <div className="prose prose-pink max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{selectedDiary.content}</p>
            </div>
            {selectedDiary.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                {selectedDiary.images.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-full rounded-lg" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
