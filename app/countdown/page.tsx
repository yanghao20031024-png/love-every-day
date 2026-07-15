"use client";

import { useLoveData, Countdown } from "@/hooks/useLoveData";
import { useState, useEffect } from "react";

export default function CountdownPage() {
  const { data, saveData } = useLoveData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    emoji: "🎂",
  });

  const handleSubmit = async () => {
    if (!form.title || !form.date) return;

    const newCountdown: Countdown = {
      id: editingId || Date.now().toString(),
      ...form,
    };

    let newCountdowns;
    if (editingId) {
      newCountdowns = data.countdowns.map((c) => (c.id === editingId ? newCountdown : c));
    } else {
      newCountdowns = [...data.countdowns, newCountdown];
    }

    newCountdowns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    await saveData({ ...data, countdowns: newCountdowns });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个纪念日吗？")) return;
    await saveData({ ...data, countdowns: data.countdowns.filter((c) => c.id !== id) });
  };

  const handleEdit = (countdown: Countdown) => {
    setEditingId(countdown.id);
    setForm({ title: countdown.title, date: countdown.date, emoji: countdown.emoji });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ title: "", date: "", emoji: "🎂" });
    setShowForm(false);
    setEditingId(null);
  };

  const emojis = ["🎂", "🎄", "💝", "🌹", "🎉", "💍", "🏠", "✈️", "🎓", "🎃", "🧧", "🌙", "⭐", "🦋", "🌸"];

  // 计算在一起的天数
  const [togetherDays, setTogetherDays] = useState(0);
  useEffect(() => {
    const start = new Date(data.couple.startDate).getTime();
    const update = () => setTogetherDays(Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
    update();
    const timer = setInterval(update, 1000 * 60);
    return () => clearInterval(timer);
  }, [data.couple.startDate]);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-purple-love flex items-center gap-2">
          <span>🎂</span> 纪念日 & 倒计时
        </h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> 添加纪念日
        </button>
      </div>

      {/* 在一起天数 */}
      <div className="card p-8 text-center mb-8 bg-gradient-to-br from-pink-love/10 to-purple-love/10">
        <p className="text-gray-600 mb-2">我们已经在一起</p>
        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-love to-purple-love">
          {togetherDays}
        </div>
        <p className="text-gray-500 mt-2">天 💕</p>
        <p className="text-sm text-gray-400 mt-4">起始日期：{data.couple.startDate}</p>
      </div>

      {/* 添加/编辑表单 */}
      {showForm && (
        <div className="card p-6 mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-purple-love mb-4">{editingId ? "编辑纪念日" : "添加纪念日"}</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="例如：一周年纪念日"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-love"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} className="btn-primary">{editingId ? "保存修改" : "添加纪念日"}</button>
              <button onClick={resetForm} className="px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-50">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 纪念日列表 */}
      <div className="space-y-4">
        {data.countdowns.map((countdown, index) => (
          <CountdownCard
            key={countdown.id}
            countdown={countdown}
            index={index}
            onEdit={() => handleEdit(countdown)}
            onDelete={() => handleDelete(countdown.id)}
          />
        ))}
      </div>

      {data.countdowns.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-500">还没有纪念日，添加你们的第一个纪念日吧~</p>
        </div>
      )}
    </div>
  );
}

function CountdownCard({
  countdown,
  index,
  onEdit,
  onDelete,
}: {
  countdown: Countdown;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [info, setInfo] = useState({ daysLeft: 0, isPast: false, daysAgo: 0 });

  useEffect(() => {
    const target = new Date(countdown.date).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff > 0) {
      setInfo({ daysLeft: Math.ceil(diff / (1000 * 60 * 60 * 24)), isPast: false, daysAgo: 0 });
    } else {
      setInfo({ daysLeft: 0, isPast: true, daysAgo: Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24)) });
    }
  }, [countdown.date]);

  return (
    <div
      className="card p-6 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{countdown.emoji}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{countdown.title}</h3>
            <p className="text-sm text-gray-500">{countdown.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            {info.isPast ? (
              <>
                <div className="text-2xl font-bold text-gray-400">{info.daysAgo}</div>
                <div className="text-xs text-gray-400">天前</div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-love to-purple-love">
                  {info.daysLeft}
                </div>
                <div className="text-xs text-gray-500">天后</div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button onClick={onEdit} className="text-gray-400 hover:text-purple-love transition-colors text-sm">编辑</button>
            <button onClick={onDelete} className="text-gray-400 hover:text-red-500 transition-colors text-sm">删除</button>
          </div>
        </div>
      </div>
    </div>
  );
}
