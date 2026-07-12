import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-card p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink">AssetFlow</h1>
          <p className="text-sm text-ink-muted mt-1">Request System Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full rounded-lg border-border bg-surface px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-lg border-border bg-surface px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full rounded-lg border-border bg-surface px-4 py-2.5 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-ink-muted">
          Already have access?{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
