"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/", label: "首页", emoji: "🏠" },
  { href: "/timeline", label: "时间轴", emoji: "📅" },
  { href: "/album", label: "相册", emoji: "📸" },
  { href: "/diary", label: "日记", emoji: "📝" },
  { href: "/countdown", label: "纪念日", emoji: "🎂" },
  { href: "/letters", label: "情书", emoji: "💌" },
  { href: "/settings", label: "设置", emoji: "⚙️" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  // 在登录/注册/绑定页不显示导航栏
  if (pathname.startsWith("/auth/")) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-pink-love/20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-pink-love">
            <span className="animate-heartbeat">💕</span>
            <span>恋爱每一天</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === item.href
                    ? "bg-pink-love/10 text-pink-love"
                    : "text-gray-600 hover:bg-pink-love/5 hover:text-pink-love"
                }`}
              >
                <span className="mr-1">{item.emoji}</span>
                {item.label}
              </Link>
            ))}
            {user && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                <span className="text-sm text-gray-500 max-w-[100px] truncate">
                  {user.email?.split("@")[0]}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-400 hover:text-pink-love transition-colors px-2 py-1 rounded-lg hover:bg-pink-love/5"
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
            <svg className="w-6 h-6 text-pink-love" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  pathname === item.href
                    ? "bg-pink-love/10 text-pink-love"
                    : "text-gray-600 hover:bg-pink-love/5"
                }`}
              >
                <span className="mr-2">{item.emoji}</span>
                {item.label}
              </Link>
            ))}
            {user && (
              <div className="border-t border-gray-100 mt-2 pt-2 px-4">
                <div className="text-sm text-gray-500 mb-2">{user.email}</div>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-50 transition-colors"
                >
                  🚪 退出登录
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
