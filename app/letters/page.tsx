"use client";

import { useLoveData, Letter } from "@/hooks/useLoveData";
import { useState } from "react";

export default function LettersPage() {
  const { data, saveData } = useLoveData();
  const [showEditor, setShowEditor] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [form, setForm] = useState({
    from: "person1" as "person1" | "person2",
    to: "person2" as "person1" | "person2",
    title: "",
    content: "",
  });

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;

    const newLetter: Letter = {
      id: Date.now().toString(),
      ...form,
      date: new Date().toISOString().split("T")[0],
      isRead: false,
    };

    await saveData({ ...data, letters: [...data.letters, newLetter] });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这封信吗？")) return;
    await saveData({ ...data, letters: data.letters.filter((l) => l.id !== id) });
    setSelectedLetter(null);
  };

  const markAsRead = async (id: string) => {
    const newLetters = data.letters.map((l) => (l.id === id ? { ...l, isRead: true } : l));
    await saveData({ ...data, letters: newLetters });
  };

  const resetForm = () => {
    setForm({ from: "person1", to: "person2", title: "", content: "" });
    setShowEditor(false);
  };

  const getPersonName = (key: "person1" | "person2") => data.couple[key].name;

  const sentLetters = data.letters.filter((l) => l.from === "person1");
  const receivedLetters = data.letters.filter((l) => l.from === "person2");

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-pink-love flex items-center gap-2">
          <span>💌</span> 情书信箱
        </h1>
        <button onClick={() => setShowEditor(true)} className="btn-primary flex items-center gap-2">
          <span>✉️</span> 写情书
        </button>
      </div>

      {/* 写情书 */}
      {showEditor && (
        <div className="card p-6 mb-8 animate-fade-in bg-gradient-to-br from-pink-love/5 to-purple-love/5">
          <h2 className="text-xl font-bold text-pink-love mb-4">写一封情书 💕</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">从</label>
                <select
                  value={form.from}
                  onChange={(e) => {
                    const from = e.target.value as "person1" | "person2";
                    setForm({ ...form, from, to: from === "person1" ? "person2" : "person1" });
                  }}
                  className="input-love"
                >
                  <option value="person1">{getPersonName("person1")}</option>
                  <option value="person2">{getPersonName("person2")}</option>
                </select>
              </div>
              <div className="flex items-end pb-1">
                <span className="text-2xl">→</span>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">给</label>
                <input
                  type="text"
                  value={getPersonName(form.to)}
                  disabled
                  className="input-love bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="给你的信..."
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
            <div className="flex gap-3">
              <button onClick={handleSubmit} className="btn-primary">💌 发送情书</button>
              <button onClick={resetForm} className="px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-50">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 信件分类展示 */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* 我写的信 */}
        <div>
          <h2 className="text-xl font-bold text-pink-love mb-4 flex items-center gap-2">
            <span>📝</span> 我写的信
          </h2>
          <div className="space-y-4">
            {sentLetters.map((letter, index) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                senderName={getPersonName(letter.from)}
                receiverName={getPersonName(letter.to)}
                index={index}
                onClick={() => {
                  setSelectedLetter(letter);
                  if (!letter.isRead) markAsRead(letter.id);
                }}
              />
            ))}
            {sentLetters.length === 0 && (
              <div className="text-center py-8 text-gray-400">还没有写过信~</div>
            )}
          </div>
        </div>

        {/* 收到的信 */}
        <div>
          <h2 className="text-xl font-bold text-purple-love mb-4 flex items-center gap-2">
            <span>💌</span> 收到的信
          </h2>
          <div className="space-y-4">
            {receivedLetters.map((letter, index) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                senderName={getPersonName(letter.from)}
                receiverName={getPersonName(letter.to)}
                index={index}
                onClick={() => {
                  setSelectedLetter(letter);
                  if (!letter.isRead) markAsRead(letter.id);
                }}
              />
            ))}
            {receivedLetters.length === 0 && (
              <div className="text-center py-8 text-gray-400">还没有收到信~</div>
            )}
          </div>
        </div>
      </div>

      {/* 信件详情弹窗 */}
      {selectedLetter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLetter(null)}>
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-8 animate-fade-in relative"
            style={{ background: "linear-gradient(135deg, #FFF5F7 0%, #FAF5FF 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 信件装饰 */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">💌</div>
              <h2 className="text-2xl font-bold text-pink-love">{selectedLetter.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {getPersonName(selectedLetter.from)} → {getPersonName(selectedLetter.to)}
              </p>
              <p className="text-xs text-gray-400">{selectedLetter.date}</p>
            </div>

            {/* 信件内容 */}
            <div className="bg-white/80 rounded-xl p-6 mb-6 shadow-sm">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedLetter.content}</p>
            </div>

            {/* 爱心装饰 */}
            <div className="text-center text-2xl">💕 ❤️ 💕</div>

            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/50 hover:bg-white rounded-full flex items-center justify-center text-gray-500 transition-colors"
            >
              ✕
            </button>
            <button
              onClick={() => handleDelete(selectedLetter.id)}
              className="absolute top-4 left-4 px-3 py-1 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-sm transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LetterCard({
  letter,
  senderName,
  receiverName,
  index,
  onClick,
}: {
  letter: Letter;
  senderName: string;
  receiverName: string;
  index: number;
  onClick: () => void;
}) {
  return (
    <div
      className="card p-4 cursor-pointer animate-fade-in hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{letter.isRead ? "📨" : "✉️"}</span>
          <div>
            <h3 className="font-medium text-gray-800">{letter.title}</h3>
            <p className="text-sm text-gray-500">
              {senderName} → {receiverName} · {letter.date}
            </p>
          </div>
        </div>
        {!letter.isRead && (
          <span className="w-3 h-3 bg-pink-love rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}
