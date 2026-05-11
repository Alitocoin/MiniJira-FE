import React, { useState } from 'react';
import { login } from '../api';
import type { AuthSession } from '../types';

interface LoginFormProps {
  onAuthenticated: (session: AuthSession) => void;
  onGoToRegister: () => void;
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f4f5f7',
  padding: '24px',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '40px 36px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 4px 24px rgba(9,30,66,0.15)',
};

const logoAreaStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '28px',
};

const logoStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#0052cc',
  letterSpacing: '0.02em',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b778c',
  marginTop: '4px',
};

const fieldStyle: React.CSSProperties = {
  marginBottom: '16px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#5e6c84',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #dfe1e6',
  borderRadius: '4px',
  fontSize: '14px',
  color: '#172b4d',
  outline: 'none',
  transition: 'border-color 0.15s',
  backgroundColor: '#fafbfc',
};

const submitBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#0052cc',
  color: '#ffffff',
  border: 'none',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '8px',
  transition: 'background-color 0.15s',
};

const submitBtnDisabledStyle: React.CSSProperties = {
  ...submitBtnStyle,
  backgroundColor: '#a5bde2',
  cursor: 'not-allowed',
};

const errorStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#de350b',
  backgroundColor: '#ffebe6',
  border: '1px solid #ff5630',
  borderRadius: '4px',
  padding: '10px 12px',
  marginBottom: '16px',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '20px',
  fontSize: '13px',
  color: '#6b778c',
};

const linkStyle: React.CSSProperties = {
  color: '#0052cc',
  fontWeight: 600,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  fontSize: '13px',
  textDecoration: 'underline',
  padding: 0,
};

const LoginForm: React.FC<LoginFormProps> = ({ onAuthenticated, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await login(email.trim(), password);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_username', response.username);
      localStorage.setItem('auth_email', response.email);
      onAuthenticated({
        token: response.token,
        username: response.username,
        email: response.email,
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr?.response?.status === 401 || axiosErr?.response?.status === 403) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else {
        setError('No se pudo conectar con el servidor. Intenta de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoAreaStyle}>
          <div style={logoStyle}>Mini Jira</div>
          <div style={subtitleStyle}>Inicia sesion para continuar</div>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="login-password">
              Contrasena
            </label>
            <input
              id="login-password"
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contrasena"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            style={submitting ? submitBtnDisabledStyle : submitBtnStyle}
            disabled={submitting}
          >
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={footerStyle}>
          No tienes cuenta?{' '}
          <button style={linkStyle} onClick={onGoToRegister} type="button">
            Registrate
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
