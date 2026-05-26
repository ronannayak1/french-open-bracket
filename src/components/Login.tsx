import { useState } from 'react';
import { USER_ACCOUNTS } from '../types';

interface LoginProps {
  onLogin: (userId: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const account = USER_ACCOUNTS.find((a) => a.id === selectedUser);
    if (!account) return;
    if (password !== account.password) {
      setError('Incorrect password');
      return;
    }
    onLogin(account.id);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-ball">🎾</span>
          <h1>Roland-Garros 2026</h1>
          <h2>Bracket Challenge</h2>
        </div>
        <p className="login-subtitle">Pick your champion. Fill your bracket.</p>

        {!selectedUser ? (
          <div className="login-users">
            {USER_ACCOUNTS.map((acct) => (
              <button
                key={acct.id}
                className="login-user-btn"
                onClick={() => {
                  setSelectedUser(acct.id);
                  setError('');
                  setPassword('');
                }}
              >
                {acct.defaultName}
              </button>
            ))}
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <button
              type="button"
              className="login-back"
              onClick={() => {
                setSelectedUser(null);
                setError('');
              }}
            >
              &larr; Back
            </button>
            <div className="login-selected-user">
              Signing in as <strong>{selectedUser}</strong>
            </div>
            <input
              type="password"
              className="login-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoFocus
            />
            {error && <div className="login-error">{error}</div>}
            <button type="submit" className="login-submit-btn">
              Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
