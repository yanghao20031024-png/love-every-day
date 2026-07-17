'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('密码长度至少6位')
      setLoading(false)
      return
    }

    // 注册
    const { error: regError } = await supabase.auth.signUp({ email, password })
    if (regError) {
      setError(
        regError.message === 'User already registered'
          ? '该账号已注册，请直接登录'
          : regError.message
      )
      setLoading(false)
      return
    }

    // 注册成功 → 跳转到绑定页
    router.push('/auth/bind')
    router.refresh()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💕</div>
          <h1 className="text-2xl font-bold text-pink-love">创建账号</h1>
          <p className="text-gray-500 mt-2">开始记录你们的恋爱点滴</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              账号
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-love"
              placeholder="请输入邮箱作为账号"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-love"
              placeholder="至少6位"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-love"
              placeholder="再次输入密码"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '注册中...' : '💕 注册'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          已有账号？
          <Link
            href="/auth/login"
            className="text-pink-love font-medium ml-1 hover:underline"
          >
            登录
          </Link>
        </p>
      </div>
    </div>
  )
}
