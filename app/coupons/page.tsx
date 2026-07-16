"use client";

import { useLoveData } from "@/hooks/useLoveData";
import { useState } from "react";

export default function CouponsPage() {
  const { data, saveData } = useLoveData();
  const [showAdd, setShowAdd] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ title: "", description: "", emoji: "🎁" });
  const [filter, setFilter] = useState<"all" | "active" | "redeemed">("all");

  const emojis = ["🎁", "💝", "🍽️", "💆", "🎬", "🍳", "🛏️", "🥤", "🎵", "💼", "🧹", "🎂"];

  const templates = [
    { title: "一次按摩", description: "给对方做一次舒服的按摩", emoji: "💆" },
    { title: "做一顿饭", description: "亲手做一顿美味的晚餐", emoji: "🍳" },
    { title: "电影之夜", description: "陪对方看一部TA想看的电影", emoji: "🎬" },
    { title: "一次约会", description: "安排一次浪漫的约会", emoji: "🍽️" },
    { title: "一个拥抱", description: "给对方一个温暖的拥抱", emoji: "🤗" },
    { title: "听你唱歌", description: "认真听对方唱一首歌", emoji: "🎵" },
  ];

  const filteredCoupons = data.coupons.filter((c) => {
    if (filter === "active") return !c.isRedeemed;
    if (filter === "redeemed") return c.isRedeemed;
    return true;
  });

  const handleAdd = async () => {
    if (!newCoupon.title.trim()) return;
    const coupon = {
      id: Date.now().toString(),
      ...newCoupon,
      createdBy: "person1" as const,
      isRedeemed: false,
    };
    await saveData({ ...data, coupons: [...data.coupons, coupon] });
    setNewCoupon({ title: "", description: "", emoji: "🎁" });
    setShowAdd(false);
  };

  const handleRedeem = async (id: string) => {
    const updated = data.coupons.map((c) =>
      c.id === id
        ? { ...c, isRedeemed: true, redeemedBy: "person2" as const, redeemedDate: new Date().toISOString().split("T")[0] }
        : c
    );
    await saveData({ ...data, coupons: updated });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这张爱情券吗？")) return;
    const updated = data.coupons.filter((c) => c.id !== id);
    await saveData({ ...data, coupons: updated });
  };

  const handleUseTemplate = (template: typeof templates[0]) => {
    setNewCoupon({ title: template.title, description: template.description, emoji: template.emoji });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-pink-love flex items-center gap-2">
          <span>🎫</span> 爱情券
        </h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2">
          + 创建
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "全部" },
          { key: "active", label: "可使用" },
          { key: "redeemed", label: "已使用" },
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

      {/* 创建表单 */}
      {showAdd && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">创建爱情券</h2>

          {/* 快捷模板 */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">快速选择模板：</p>
            <div className="flex flex-wrap gap-2">
              {templates.map((t, i) => (
                <button
                  key={i}
                  onClick={() => handleUseTemplate(t)}
                  className="px-3 py-1 rounded-full bg-pink-love/10 text-pink-love text-sm hover:bg-pink-love/20 transition-all"
                >
                  {t.emoji} {t.title}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择图标</label>
              <div className="flex flex-wrap gap-2">
                {emojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewCoupon({ ...newCoupon, emoji: e })}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                      newCoupon.emoji === e
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
              value={newCoupon.title}
              onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
              className="input-love"
              placeholder="券的标题（如：一次按摩）"
            />
            <textarea
              value={newCoupon.description}
              onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
              className="textarea-love"
              placeholder="使用说明（可选）"
              rows={2}
            />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn-primary flex-1">
                创建爱情券
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

      {/* 券列表 */}
      <div className="space-y-3">
        {filteredCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`card p-4 transition-all ${
              coupon.isRedeemed ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{coupon.emoji}</span>
              <div className="flex-1">
                <h3 className={`font-bold text-gray-800 ${coupon.isRedeemed ? "line-through" : ""}`}>
                  {coupon.title}
                </h3>
                {coupon.description && (
                  <p className="text-sm text-gray-500 mt-1">{coupon.description}</p>
                )}
                {coupon.isRedeemed && coupon.redeemedDate && (
                  <p className="text-xs text-green-500 mt-1">✅ {coupon.redeemedDate} 已使用</p>
                )}
              </div>
              <div className="flex gap-2">
                {!coupon.isRedeemed && (
                  <button
                    onClick={() => handleRedeem(coupon.id)}
                    className="px-4 py-2 rounded-full bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-all"
                  >
                    使用
                  </button>
                )}
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredCoupons.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">🎫</div>
            <p>还没有爱情券，点击右上角创建吧~</p>
          </div>
        )}
      </div>

      {/* 统计 */}
      {data.coupons.length > 0 && (
        <div className="card p-4 mt-6 text-center">
          <p className="text-sm text-gray-500">
            共 <span className="font-bold text-pink-love">{data.coupons.length}</span> 张券，
            可使用 <span className="font-bold text-green-500">{data.coupons.filter((c) => !c.isRedeemed).length}</span> 张
          </p>
        </div>
      )}
    </div>
  );
}
