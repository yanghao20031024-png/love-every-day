"use client";

import { useLoveData, TimelineEvent } from "@/hooks/useLoveData";
import { useState, useRef } from "react";

export default function TimelinePage() {
  const { data, saveData, uploadImage } = useLoveData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    description: "",
    emoji: "💕",
    images: [] as string[],
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!form.title) return;

    const newEvent: TimelineEvent = {
      id: editingId || Date.now().toString(),
      ...form,
    };

    let newTimeline;
    if (editingId) {
      newTimeline = data.timeline.map((t) => (t.id === editingId ? newEvent : t));
    } else {
      newTimeline = [...data.timeline, newEvent];
    }

    newTimeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    await saveData({ ...data, timeline: newTimeline });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个时刻吗？")) return;
    const newTimeline = data.timeline.filter((t) => t.id !== id);
    await saveData({ ...data, timeline: newTimeline });
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingId(event.id);
    setForm({
      date: event.date,
      title: event.title,
      description: event.description,
      emoji: event.emoji,
      images: event.images,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) {
        setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
      }
    }
  };

  const resetForm = () => {
    setForm({ date: new Date().toISOString().split("T")[0], title: "", description: "", emoji: "💕", images: [] });
    setShowForm(false);
    setEditingId(null);
  };

  const emojis = ["💕", "❤️", "💖", "💗", "💝", "🌸", "✨", "🎉", "🎂", "🌹", "💍", "🏠", "✈️", "🎓", "👫"];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-pink-love flex items-center gap-2">
          <span>📅</span> 恋爱时间轴
        </h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> 添加时刻
        </button>
      </div>

      {/* 添加/编辑表单 */}
      {showForm && (
        <div className="card p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-pink-love mb-4">{editingId ? "编辑时刻" : "添加新时刻"}</h2>
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
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">图标</label>
                <select
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="input-love text-center text-xl"
                >
                  {emojis.map((e) => (
                    <option key={e} value={e}>{e}</option>
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
                placeholder="例如：第一次约会"
                className="input-love"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="记录这个美好的时刻..."
                className="textarea-love"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">照片</label>
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
                  className="w-20 h-20 border-2 border-dashed border-pink-love/30 rounded-lg flex items-center justify-center text-pink-love hover:bg-pink-love/5 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} className="btn-primary">{editingId ? "保存修改" : "添加时刻"}</button>
              <button onClick={resetForm} className="px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 时间轴展示 */}
      <div className="relative">
        {/* 中间线条 */}
        <div className="hidden md:block timeline-line" />

        <div className="space-y-8">
          {data.timeline.map((event, index) => (
            <div
              key={event.id}
              className={`relative flex flex-col md:flex-row items-start gap-4 animate-fade-in ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 时间轴节点 */}
              <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-pink-love to-purple-love items-center justify-center text-white text-xl z-10 shadow-lg">
                {event.emoji}
              </div>

              {/* 内容卡片 */}
              <div className={`w-full md:w-[calc(50%-3rem)] ${index % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl md:hidden">{event.emoji}</span>
                      <span className="text-sm text-pink-love font-medium">{event.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(event)} className="text-gray-400 hover:text-pink-love transition-colors text-sm">
                        编辑
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                        删除
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                  {event.description && <p className="text-gray-600 mb-3">{event.description}</p>}
                  {event.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {event.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 占位 */}
              <div className="hidden md:block w-[calc(50%-3rem)]" />
            </div>
          ))}

          {data.timeline.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💕</div>
              <p className="text-gray-500">还没有记录，点击上方按钮添加第一个美好时刻吧~</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
