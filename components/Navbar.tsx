"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const mainNavItems = [
  { href: "/", label: "首页", emoji: "🏠" },
  { href: "/timeline", label: "时间轴", emoji: "📅" },
  { href: "/album", label: "相册", emoji: "📸" },
  { href: "/diary", label: "日记", emoji: "📝" },
];

const moreNavItems = [
  { href: "/wishlist", label: "愿望清单", emoji: "🌟" },
  { href: "/coupons", label: "爱情券", emoji: "🎫" },
  { href: "/daily", label: "每日情话", emoji: "💬" },
  { href: "/letters", label: "情书", emoji: "💌" },
  { href: "/countdown", label: "纪念日", emoji: "🎂" },
  { href: "/settings", label: "设置", emoji: "⚙️" },
];

const allNavItems = [...mainNavItems, ...moreNavItems];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const { user, signOut } = useAuth();
  const moreRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭更多菜单
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (pathname.startsWith("/auth/")) {
    return null;
  }

  const isMoreActive = moreNavItems.some((item) => pathname === item.href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-pink-love/20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 font-bold text-lg text-pink-love shrink-0">
            <span className="animate-heartbeat text-xl">💕</span>
            <span className="hidden sm:inline">恋爱每一天</span>
          </Link>

          {/* Desktop Navigation - 紧凑图标+文字 */}
          <div className="hidden md:flex items-center gap-0.5">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  pathname === item.href
                    ? "bg-pink-love/10 text-pink-love"
                    : "text-gray-500 hover:bg-pink-love/5 hover:text-pink-love"
                }`}
              >
                <span className="mr-0.5">{item.emoji}</span>
                {item.label}
              </Link>
            ))}

            {/* 更多下拉 */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setShowMore(!showMore)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isMoreActive || showMore
                    ? "bg-pink-love/10 text-pink-love"
                    : "text-gray-500 hover:bg-pink-love/5 hover:text-pink-love"
                }`}
              >
                更多 ▾
              </button>
              {showMore && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-pink-love/10 py-2 animate-fade-in">
                  {moreNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={`block px-4 py-2 text-sm transition-all ${
                        pathname === item.href
                          ? "bg-pink-love/10 text-pink-love font-medium"
                          : "text-gray-600 hover:bg-pink-love/5"
                      }`}
                    >
                      <span className="mr-2">{item.emoji}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 用户信息 */}
            {user && (
              <div className="flex items-center gap-1.5 ml-1.5 pl-1.5 border-l border-gray-200">
                <span className="text-xs text-gray-400 max-w-[80px] truncate">
                  {user.email?.split("@")[0]}
                </span>
                <button
                  onClick={signOut}
                  className="text-xs text-gray-400 hover:text-pink-love transition-colors px-1.5 py-1 rounded hover:bg-pink-love/5"
                >
                  退出
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-pink-love/10 transition-colors"
          >
            <svg className="w-5 h-5 text-pink-love" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation - 网格布局更紧凑 */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {allNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
                    pathname === item.href
                      ? "bg-pink-love/10 text-pink-love"
                      : "text-gray-500 hover:bg-pink-love/5"
                  }`}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
            {user && (
              <div className="border-t border-gray-100 pt-3 px-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{user.email}</span>
                  <button
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="text-xs text-red-400 hover:text-red-500 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
