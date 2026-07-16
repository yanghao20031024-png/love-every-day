"use client";

import { useLoveData } from "@/hooks/useLoveData";
import { useState } from "react";

export default function WishlistPage() {
  const { data, saveData } = useLoveData();
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", description: "", emoji: "⭐" });
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const emojis = ["⭐", "🎯", "✈️", "🏖️", "🎬", "🍰", "📚", "🎮", "🎪", "🏠", "💍", "🎵"];

  const filteredItems = data.wishlist.filter((item) => {
    if (filter === "pending") return !item.completed;
    if (filter === "completed") return item.completed;
    return true;
  });

  const handleAdd = async () => {
    if (!newItem.title.trim()) return;
    const item = {
      id: Date.now().toString(),
      ...newItem,
      completed: false,
      createdBy: "person1" as const,
    };
    await saveData({ ...data, wishlist: [...data.wishlist, item] });
    setNewItem({ title: "", description: "", emoji: "⭐" });
    setShowAdd(false);
  };

  const handleToggle = async (id: string) => {
    const updated = data.wishlist.map((item) =>
      item.id === id
        ? { ...item, completed: !item.completed, completedDate: !item.completed ? new Date().toISOString().split("T")[0] : undefined }
        : item
    );
    await saveData({ ...data, wishlist: updated });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个愿望吗？")) return;
    const updated = data.wishlist.filter((item) => item.id !== id);
    await saveData({ ...data, wishlist: updated });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-pink-love flex items-center gap-2">
          <span>🌟</span> 愿望清单
        </h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2">
          + 添加
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "全部" },
          { key: "pending", label: "待实现" },
          { key: "completed", label: "已完成" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-pink-love text-white"
                : "bg-white text-gray-600 hover:bg-pink-love/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 添加表单 */}
      {showAdd && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">新增愿望</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择图标</label>
              <div className="flex flex-wrap gap-2">
                {emojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewItem({ ...newItem, emoji: e })}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                      newItem.emoji === e
                        ? "bg-pink-love/20 ring-2 ring-pink-love"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="input-love"
              placeholder="愿望标题（如：一起去旅行）"
            />
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="textarea-love"
              placeholder="详细描述（可选）"
              rows={3}
            />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn-primary flex-1">
                添加愿望
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-full text-gray-500 hover:bg-gray-100"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 愿望列表 */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`card p-4 flex items-center gap-4 transition-all ${
              item.completed ? "opacity-60" : ""
            }`}
          >
            <span className="text-3xl">{item.emoji}</span>
            <div className="flex-1">
              <h3 className={`font-bold text-gray-800 ${item.completed ? "line-through" : ""}`}>
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              )}
              {item.completed && item.completedDate && (
                <p className="text-xs text-green-500 mt-1">✅ {item.completedDate} 已实现</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggle(item.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  item.completed
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400 hover:bg-pink-love/10 hover:text-pink-love"
                }`}
              >
                {item.completed ? "✓" : "○"}
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">🌟</div>
            <p>还没有愿望，点击右上角添加吧~</p>
          </div>
        )}
      </div>

      {/* 统计 */}
      {data.wishlist.length > 0 && (
        <div className="card p-4 mt-6 text-center">
          <p className="text-sm text-gray-500">
            共 <span className="font-bold text-pink-love">{data.wishlist.length}</span> 个愿望，
            已实现 <span className="font-bold text-green-500">{data.wishlist.filter((i) => i.completed).length}</span> 个
          </p>
        </div>
      )}
    </div>
  );
}
