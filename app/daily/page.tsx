"use client";

import { useLoveData } from "@/hooks/useLoveData";
import { useState, useEffect } from "react";

const questionBank = [
  "如果我们可以去任何地方旅行，你想去哪里？",
  "你最喜欢我身上的哪个特点？",
  "我们在一起最难忘的时刻是什么？",
  "如果可以实现一个共同的愿望，你希望是什么？",
  "你最喜欢我们一起做的什么事情？",
  "如果明天是我们在一起的最后一天，你想做什么？",
  "你第一次见到我时是什么感觉？",
  "你最喜欢我叫你什么？",
  "我们下次约会你想去哪里？",
  "你最喜欢我身上的哪个习惯？",
  "如果可以回到我们在一起的第一天，你想说什么？",
  "你最喜欢我们一起吃的什么东西？",
  "你觉得我们最像哪对电影情侣？",
  "你最想和我一起完成什么事情？",
  "你最喜欢我的哪个表情？",
  "如果我们可以一起学一样新技能，你想学什么？",
  "你最喜欢我们一起度过的哪个节日？",
  "你最感谢我做的事情是什么？",
  "如果可以给我写一封信，你想说什么？",
  "你最喜欢和我在一起的哪个瞬间？",
];

export default function DailyPage() {
  const { data, saveData } = useLoveData();
  const [todayQuestion, setTodayQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "history">("today");

  useEffect(() => {
    // 获取今天的问题
    const today = new Date().toISOString().split("T")[0];
    const todayQ = data.dailyQuestions.find((q) => q.date === today);

    if (todayQ) {
      setTodayQuestion(todayQ.question);
      // 获取当前用户的答案
      const myAnswer = data.dailyQuestions.find((q) => q.date === today)?.answer1 || "";
      setAnswer(myAnswer);
    } else {
      // 生成今天的问题（基于日期的伪随机）
      const dayIndex = new Date().getDate() % questionBank.length;
      const question = questionBank[dayIndex];
      setTodayQuestion(question);
    }
  }, [data.dailyQuestions]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    const today = new Date().toISOString().split("T")[0];
    const existingIndex = data.dailyQuestions.findIndex((q) => q.date === today);

    let updatedQuestions;
    if (existingIndex >= 0) {
      // 更新已有问题的答案
      updatedQuestions = [...data.dailyQuestions];
      updatedQuestions[existingIndex] = {
        ...updatedQuestions[existingIndex],
        answer1: answer,
        answeredBy1: true,
      };
    } else {
      // 创建新的问答记录
      updatedQuestions = [
        ...data.dailyQuestions,
        {
          id: Date.now().toString(),
          date: today,
          question: todayQuestion,
          answer1: answer,
          answeredBy1: true,
          answeredBy2: false,
        },
      ];
    }

    await saveData({ ...data, dailyQuestions: updatedQuestions });
    setShowAnswers(true);
  };

  const today = new Date().toISOString().split("T")[0];
  const todayData = data.dailyQuestions.find((q) => q.date === today);
  const bothAnswered = todayData?.answeredBy1 && todayData?.answeredBy2;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-pink-love flex items-center gap-2 mb-8">
        <span>💬</span> 每日情话
      </h1>

      {/* 标签切换 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("today")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === "today"
              ? "bg-pink-love text-white"
              : "bg-white text-gray-600 hover:bg-pink-love/10"
          }`}
        >
          今日问题
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === "history"
              ? "bg-pink-love text-white"
              : "bg-white text-gray-600 hover:bg-pink-love/10"
          }`}
        >
          历史记录
        </button>
      </div>

      {activeTab === "today" && (
        <div className="card p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">💭</div>
            <p className="text-sm text-gray-500 mb-2">今天的问题</p>
            <h2 className="text-xl font-bold text-gray-800">{todayQuestion}</h2>
          </div>

          {!showAnswers && !todayData?.answeredBy1 && (
            <div className="space-y-4">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="textarea-love"
                placeholder="写下你的答案..."
                rows={4}
              />
              <button onClick={handleSubmitAnswer} className="btn-primary w-full">
                💕 提交答案
              </button>
            </div>
          )}

          {(todayData?.answeredBy1 || showAnswers) && (
            <div className="space-y-4">
              <div className="p-4 bg-pink-love/5 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">我的答案：</p>
                <p className="text-gray-800">{todayData?.answer1 || answer}</p>
              </div>
              {bothAnswered ? (
                <div className="p-4 bg-purple-love/5 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">TA的答案：</p>
                  <p className="text-gray-800">{todayData?.answer2}</p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-gray-400">等待TA回答...</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {data.dailyQuestions
            .filter((q) => q.date !== today)
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((q) => (
              <div key={q.id} className="card p-4">
                <p className="text-xs text-gray-400 mb-2">{q.date}</p>
                <p className="font-medium text-gray-800 mb-3">{q.question}</p>
                <div className="space-y-2">
                  {q.answer1 && (
                    <div className="p-3 bg-pink-love/5 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">我的答案：</p>
                      <p className="text-sm text-gray-700">{q.answer1}</p>
                    </div>
                  )}
                  {q.answer2 && (
                    <div className="p-3 bg-purple-love/5 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">TA的答案：</p>
                      <p className="text-sm text-gray-700">{q.answer2}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          {data.dailyQuestions.filter((q) => q.date !== today).length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-4">💬</div>
              <p>还没有历史记录，快去回答今天的问题吧~</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
