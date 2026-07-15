"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LoveData } from "@/hooks/useLoveData";

const defaultData: LoveData = {
  couple: { person1: { name: "他", avatar: "" }, person2: { name: "她", avatar: "" }, startDate: "2024-01-01" },
  timeline: [], photos: [], diary: [], countdowns: [], letters: [],
};

export default function ClientHomeContent({ initialData }: { initialData: LoveData | null }) {
  // 使用服务端传来的初始数据，但允许客户端刷新
  const [data, setData] = useState(initialData || defaultData);
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // 初始化计时器
  useEffect(() => {
    const update = () => {
      const start = new Date(data.couple.startDate).getTime();
      const now = Date.now();
      const diff = now - start;
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [data.couple.startDate]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 情侣信息卡片 */}
      <div className="card p-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-love to-purple-love flex items-center justify-center text-3xl">
            {data.couple.person1.avatar ? (
              <img src={data.couple.person1.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              "👦"
            )}
          </div>
          <div className="text-4xl animate-heartbeat">💕</div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-love to-pink-love flex items-center justify-center text-3xl">
            {data.couple.person2.avatar ? (
              <img src={data.couple.person2.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              "👧"
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-pink-love mb-2">
          {data.couple.person1.name} & {data.couple.person2.name}
        </h1>
        <p className="text-gray-500">在一起的每一天都值得纪念</p>
      </div>

      {/* 在一起天数计时器 */}
      <div className="card p-8 text-center bg-gradient-to-br from-pink-love/10 to-purple-love/10">
        <p className="text-gray-600 mb-4">我们已经在一起</p>
        <div className="flex items-center justify-center gap-4">
          <TimeBlock value={time.days} label="天" large />
          <span className="text-2xl text-pink-love animate-heartbeat">:</span>
          <TimeBlock value={time.hours} label="时" />
          <span className="text-2xl text-pink-love animate-heartbeat">:</span>
          <TimeBlock value={time.minutes} label="分" />
          <span className="text-2xl text-pink-love animate-heartbeat">:</span>
          <TimeBlock value={time.seconds} label="秒" />
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/timeline", emoji: "📅", label: "时间轴", desc: "记录重要时刻" },
          { href: "/album", emoji: "📸", label: "相册", desc: "珍藏美好瞬间" },
          { href: "/diary", emoji: "📝", label: "日记", desc: "写下心情故事" },
          { href: "/letters", emoji: "💌", label: "情书", desc: "传递甜蜜爱意" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card p-6 text-center group">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.emoji}</div>
            <h3 className="font-bold text-gray-800 mb-1">{item.label}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* 最新动态 */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-pink-love mb-4 flex items-center gap-2">
          <span>✨</span> 最新动态
        </h2>
        <div className="space-y-4">
          {data.timeline.slice(-3).reverse().map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-pink-love/5 transition-colors">
              <span className="text-2xl">{event.emoji || "💕"}</span>
              <div>
                <h3 className="font-medium text-gray-800">{event.title}</h3>
                <p className="text-sm text-gray-500">{event.date}</p>
              </div>
            </div>
          ))}
          {data.timeline.length === 0 && (
            <p className="text-gray-400 text-center py-4">还没有记录，去时间轴添加第一个时刻吧~</p>
          )}
        </div>
      </div>

      {/* 纪念日提醒 */}
      {data.countdowns.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-purple-love mb-4 flex items-center gap-2">
            <span>🎂</span> 即将到来的纪念日
          </h2>
          <div className="space-y-3">
            {data.countdowns.slice(0, 3).map((cd) => (
              <CountdownItem key={cd.id} title={cd.title} date={cd.date} emoji={cd.emoji} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimeBlock({ value, label, large }: { value: number; label: string; large?: boolean }) {
  return (
    <div className="text-center">
      <div
        className={`${
          large ? "text-5xl" : "text-3xl"
        } font-bold text-pink-love bg-white rounded-xl px-4 py-2 shadow-sm min-w-[60px]`}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-sm text-gray-500 mt-1 block">{label}</span>
    </div>
  );
}

function CountdownItem({ title, date, emoji }: { title: string; date: string; emoji: string }) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const target = new Date(date).getTime();
    const now = Date.now();
    const diff = target - now;
    setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [date]);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-love/5">
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div>
          <h3 className="font-medium text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-purple-love">{daysLeft}</div>
        <div className="text-xs text-gray-500">天后</div>
      </div>
    </div>
  );
}
