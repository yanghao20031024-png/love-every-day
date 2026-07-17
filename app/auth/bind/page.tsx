'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type PageState = 'select' | 'creating' | 'created' | 'joining'

export default function BindPage() {
  const [pageState, setPageState] = useState<PageState>('select')
  const [inviteCode, setInviteCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // 检查是否已有情侣
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      const { data: member } = await supabase
        .from('couple_members')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
      if (member && member.length > 0) {
        router.push('/')
      }
    }
    check()
  }, [])

  const handleCreate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/couple/create', { method: 'POST' })
      const text = await res.text()
      let data: Record<string, string> = {}
      try { data = JSON.parse(text) } catch {}

      if (!res.ok) {
        setError(data.error || `创建失败 (${res.status})`)
        setLoading(false)
        return
      }
      setInviteCode(data.invite_code)
      setPageState('created')
    } catch {
      setError('网络错误，请检查网络后重试')
    }
    setLoading(false)
  }

  const handleJoin = async () => {
    if (inputCode.length !== 6) {
      setError('请输入6位邀请码')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/couple/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inputCode }),
      })
      const text = await res.text()
      let data: Record<string, string> = {}
      try { data = JSON.parse(text) } catch {}

      if (!res.ok) {
        setError(data.error || `加入失败 (${res.status})`)
        setLoading(false)
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('网络错误，请检查网络后重试')
    }
    setLoading(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = inviteCode
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 创建成功 → 显示邀请码
  if (pageState === 'created') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card p-8 w-full max-w-md animate-fade-in text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-pink-love mb-2">情侣空间已创建！</h1>
          <p className="text-gray-500 mb-6">
            让对方输入下面的邀请码加入吧
          </p>

          <div className="bg-gradient-to-br from-pink-love/10 to-purple-love/10 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">你的邀请码</p>
            <div className="text-5xl font-bold text-pink-love tracking-[0.2em] mb-4 select-all">
              {inviteCode}
            </div>
            <button onClick={handleCopy} className="btn-primary text-sm px-6">
              {copied ? '✅ 已复制' : '📋 复制邀请码'}
            </button>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            把这个码发给 TA，TA注册后输入即可加入
          </p>

          <button onClick={() => router.push('/')} className="text-pink-love font-medium hover:underline">
            进入首页 →
          </button>
        </div>
      </div>
    )
  }

  // 选择页面
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💕</div>
          <h1 className="text-2xl font-bold text-pink-love">绑定情侣空间</h1>
          <p className="text-gray-500 mt-2">和 TA 一起记录恋爱点滴</p>
        </div>

        {pageState === 'select' && (
          <div className="space-y-4">
            <button
              onClick={() => setPageState('creating')}
              className="w-full p-6 rounded-2xl border-2 border-dashed border-pink-love/30 hover:border-pink-love/60 hover:bg-pink-love/5 transition-all text-center"
            >
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-bold text-gray-800 mb-1">创建一个情侣空间</h3>
              <p className="text-sm text-gray-500">生成邀请码，让对方加入</p>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">或者</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={() => setPageState('joining')}
              className="w-full p-6 rounded-2xl border-2 border-dashed border-purple-love/30 hover:border-purple-love/60 hover:bg-purple-love/5 transition-all text-center"
            >
              <div className="text-3xl mb-2">🔗</div>
              <h3 className="font-bold text-gray-800 mb-1">加入情侣空间</h3>
              <p className="text-sm text-gray-500">输入对方的邀请码</p>
            </button>
          </div>
        )}

        {pageState === 'creating' && (
          <div className="text-center space-y-4">
            <p className="text-gray-600">点击下方按钮，系统将为你生成一个6位邀请码</p>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
            )}
            <button
              onClick={handleCreate}
              className="btn-primary w-full disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '生成中...' : '✨ 创建情侣空间'}
            </button>
            <button
              onClick={() => setPageState('select')}
              className="text-sm text-gray-400 hover:text-pink-love"
            >
              返回
            </button>
          </div>
        )}

        {pageState === 'joining' && (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">请输入 TA 的6位邀请码</p>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                setError('')
              }}
              className="input-love text-center text-2xl tracking-[0.3em] font-bold"
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
            )}
            <button
              onClick={handleJoin}
              className="btn-primary w-full disabled:opacity-50"
              disabled={loading || inputCode.length !== 6}
            >
              {loading ? '验证中...' : '🔗 加入'}
            </button>
            <button
              onClick={() => setPageState('select')}
              className="text-sm text-gray-400 hover:text-pink-love w-full text-center"
            >
              返回
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
