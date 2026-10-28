import { useState } from 'react';
import type { FormEvent } from 'react';
import { login, register, setCurrentUser } from '../lib/api';
import { FolderSearch } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const data = await login(email, password);
        setCurrentUser(data.user);
        // Reload to trigger auth context update
        window.location.reload();
      } else if (mode === 'signup') {
        const data = await register(email, password);
        setCurrentUser(data.user);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (m: AuthMode) => {
    setMode(m);
    setError('');
    setMessage('');
    setPassword('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f5f9',
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        borderTop: '4px solid #4a6fa5',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <FolderSearch style={{ width: 48, height: 48, color: '#4a6fa5', margin: '0 auto 0.75rem' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4a6fa5' }}>Archivex</h1>
          <p style={{ color: '#6c757d' }}>Physical File Tracker</p>
        </div>

        <div style={{ display: 'flex', marginBottom: '1.5rem', borderRadius: '0.4rem', overflow: 'hidden', border: '1px solid #dee2e6' }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => handleModeChange(m)}
              style={{
                flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                background: mode === m ? '#4a6fa5' : 'white',
                color: mode === m ? 'white' : '#495057',
                transition: 'all 0.2s',
              }}>
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #dee2e6', borderRadius: '0.4rem', fontSize: '1rem', boxSizing: 'border-box' }}
              placeholder="name@example.com"
            />
          </div>
          
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', display: 'block' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #dee2e6', borderRadius: '0.4rem', fontSize: '1rem', boxSizing: 'border-box' }}
              placeholder="••••••••"
            />
          </div>

          <div style={{ height: '1.5rem', marginBottom: '1rem' }}>
            {error && <p style={{ color: '#dc3545', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
            {message && <p style={{ color: '#28a745', fontSize: '0.85rem', margin: 0 }}>{message}</p>}
          </div>

          <button type="submit" disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              background: '#4a6fa5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.4rem', 
              fontWeight: 700, 
              fontSize: '1rem', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 2px 4px rgba(74, 111, 165, 0.3)',
              transition: 'all 0.2s'
            }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
