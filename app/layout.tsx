import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "恋爱每一天 💕",
  description: "记录我们在一起的每一天",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="gradient-bg min-h-screen">
        <Navbar />
        <main className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
          {children}
        </main>
        <FloatingHearts />
      </body>
    </html>
  );
}

function FloatingHearts() {
  const hearts = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    size: `${12 + Math.random() * 16}px`,
    emoji: ["💕", "💗", "💖", "✨", "🌸", "💝", "🦋", "🌷"][i],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-float"
          style={{
            left: heart.left,
            bottom: "-20px",
            animationDelay: heart.delay,
            fontSize: heart.size,
          }}
        >
          {heart.emoji}
        </div>
      ))}
    </div>
  );
}
