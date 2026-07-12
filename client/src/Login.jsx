import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from './api'

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: 'admin@assetflow.local', password: 'change_this_password' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const response = await api.post(endpoint, mode === 'signup' ? form : { email: form.email, password: form.password });
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot() {
    try {
      await api.post('/api/auth/forgot-password', { email: form.email })
      setError('If that email exists, a reset link has been sent.')
    } catch {
      setError('Unable to send reset instructions right now.')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">AssetFlow</h1>
        <p className="text-xs text-zinc-500 mt-1">Sign in or create an employee account to continue</p>
      </div>

      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
        <div className="flex gap-2 mb-4">
          <button type="button" onClick={() => setMode('login')} className={`flex-1 py-2 rounded text-xs font-semibold ${mode === 'login' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>Login</button>
          <button type="button" onClick={() => setMode('signup')} className={`flex-1 py-2 rounded text-xs font-semibold ${mode === 'signup' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>Signup</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <input required placeholder="Full name" className="w-full p-2 border border-zinc-200 rounded text-xs" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          )}
          <input required type="email" placeholder="Email" className="w-full p-2 border border-zinc-200 rounded text-xs" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input required type="password" placeholder="Password" className="w-full p-2 border border-zinc-200 rounded text-xs" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          {error && <div className="text-xs text-red-600">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50">{loading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>
        </form>

        <button type="button" onClick={handleForgot} className="mt-3 text-xs text-blue-600 hover:underline">Forgot password?</button>
      </div>
    </div>
  )
}

export default Login
