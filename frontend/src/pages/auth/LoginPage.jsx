import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-card p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink">AssetFlow</h1>
          <p className="text-sm text-ink-muted mt-1">Enterprise Resource Control</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium">
              {error}
            </div>
          )}

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
              placeholder="operator@company.com"
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
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-ink-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent font-medium hover:underline">
            Request access
          </Link>
        </div>
      </div>
    </div>
  );
}
