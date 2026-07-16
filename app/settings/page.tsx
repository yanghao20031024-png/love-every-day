"use client";

import { useLoveData } from "@/hooks/useLoveData";
import { useState, useRef, useEffect } from "react";

export default function SettingsPage() {
  const { data, saveData, uploadImage } = useLoveData();
  const [couple, setCouple] = useState(data.couple);
  const [saved, setSaved] = useState(false);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);

  // 修复：当 data 加载完成后同步 couple 状态
  useEffect(() => {
    setCouple(data.couple);
  }, [data.couple]);

  const handleSave = async () => {
    await saveData({ ...data, couple });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, person: "person1" | "person2") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      const newCouple = {
        ...couple,
        [person]: { ...couple[person], avatar: url },
      };
      setCouple(newCouple);
      // 修复：上传头像后自动保存
      await saveData({ ...data, couple: newCouple });
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `love-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (confirm("导入将覆盖当前数据，确定要继续吗？")) {
          await saveData(imported);
          setCouple(imported.couple);
          alert("导入成功！");
        }
      } catch {
        alert("文件格式错误，请选择有效的 JSON 文件");
      }
    };
    reader.readAsText(file);
  };

  const themes = [
    { name: "粉色浪漫", colors: ["#FF6B95", "#C084FC"] },
    { name: "紫色梦幻", colors: ["#8B5CF6", "#EC4899"] },
    { name: "蓝色清新", colors: ["#3B82F6", "#06B6D4"] },
    { name: "绿色自然", colors: ["#10B981", "#34D399"] },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-pink-love flex items-center gap-2 mb-8">
        <span>⚙️</span> 设置
      </h1>

      {/* 情侣信息 */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">💕 情侣信息</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Person 1 */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-love to-purple-love flex items-center justify-center text-4xl overflow-hidden">
                {couple.person1.avatar ? (
                  <img src={couple.person1.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  "👦"
                )}
              </div>
              <button
                onClick={() => fileRef1.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-pink-love hover:bg-pink-love/10 transition-colors"
              >
                📷
              </button>
              <input type="file" ref={fileRef1} onChange={(e) => handleAvatarUpload(e, "person1")} accept="image/*" className="hidden" />
            </div>
            <input
              type="text"
              value={couple.person1.name}
              onChange={(e) => setCouple({ ...couple, person1: { ...couple.person1, name: e.target.value } })}
              className="input-love text-center font-bold"
              placeholder="他的名字"
            />
          </div>

          {/* Person 2 */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-love to-pink-love flex items-center justify-center text-4xl overflow-hidden">
                {couple.person2.avatar ? (
                  <img src={couple.person2.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  "👧"
                )}
              </div>
              <button
                onClick={() => fileRef2.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-pink-love hover:bg-pink-love/10 transition-colors"
              >
                📷
              </button>
              <input type="file" ref={fileRef2} onChange={(e) => handleAvatarUpload(e, "person2")} accept="image/*" className="hidden" />
            </div>
            <input
              type="text"
              value={couple.person2.name}
              onChange={(e) => setCouple({ ...couple, person2: { ...couple.person2, name: e.target.value } })}
              className="input-love text-center font-bold"
              placeholder="她的名字"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">在一起的起始日期</label>
          <input
            type="date"
            value={couple.startDate}
            onChange={(e) => setCouple({ ...couple, startDate: e.target.value })}
            className="input-love"
          />
        </div>

        <button onClick={handleSave} className="btn-primary mt-4 w-full">
          {saved ? "✅ 保存成功！" : "💾 保存设置"}
        </button>
      </div>

      {/* 主题设置 */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🎨 主题颜色</h2>
        <div className="grid grid-cols-2 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.name}
              className="p-4 rounded-xl border-2 border-transparent hover:border-pink-love/30 transition-all"
              style={{ background: `linear-gradient(135deg, ${theme.colors[0]}10, ${theme.colors[1]}10)` }}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded-full" style={{ background: theme.colors[0] }} />
                  <div className="w-6 h-6 rounded-full" style={{ background: theme.colors[1] }} />
                </div>
                <span className="font-medium text-gray-700">{theme.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 数据管理 */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📦 数据管理</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-medium text-gray-800">导出数据</h3>
              <p className="text-sm text-gray-500">将所有数据导出为 JSON 文件</p>
            </div>
            <button onClick={handleExport} className="btn-primary text-sm px-4 py-2">
              📥 导出
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-medium text-gray-800">导入数据</h3>
              <p className="text-sm text-gray-500">从 JSON 文件导入数据（会覆盖当前数据）</p>
            </div>
            <label className="btn-primary text-sm px-4 py-2 cursor-pointer">
              📤 导入
              <input type="file" onChange={handleImport} accept=".json" className="hidden" />
            </label>
          </div>
          <div className="p-4 bg-pink-love/5 rounded-xl">
            <h3 className="font-medium text-gray-800 mb-2">📊 数据统计</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>时间轴事件：<span className="font-bold text-pink-love">{data.timeline.length}</span></div>
              <div>照片数量：<span className="font-bold text-pink-love">{data.photos.length}</span></div>
              <div>日记篇数：<span className="font-bold text-pink-love">{data.diary.length}</span></div>
              <div>情书数量：<span className="font-bold text-pink-love">{data.letters.length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
