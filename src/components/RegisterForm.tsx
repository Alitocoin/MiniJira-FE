import React, { useState } from 'react';
import { register } from '../api';
import type { AuthSession } from '../types';

interface RegisterFormProps {
  onAuthenticated: (session: AuthSession) => void;
  onGoToLogin: () => void;
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

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  border: '1px solid #ff5630',
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

const errorBannerStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#de350b',
  backgroundColor: '#ffebe6',
  border: '1px solid #ff5630',
  borderRadius: '4px',
  padding: '10px 12px',
  marginBottom: '16px',
};

const fieldErrorStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#de350b',
  marginTop: '4px',
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

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onAuthenticated, onGoToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!username.trim()) {
      errors.username = 'El nombre de usuario es requerido.';
    } else if (username.trim().length < 3) {
      errors.username = 'Minimo 3 caracteres.';
    }
    if (!email.trim()) {
      errors.email = 'El email es requerido.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Ingresa un email valido.';
    }
    if (!password) {
      errors.password = 'La contrasena es requerida.';
    } else if (password.length < 6) {
      errors.password = 'Minimo 6 caracteres.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await register(username.trim(), email.trim(), password);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_username', response.username);
      localStorage.setItem('auth_email', response.email);
      onAuthenticated({
        token: response.token,
        username: response.username,
        email: response.email,
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr?.response?.status === 409) {
        setError('Ya existe un usuario con ese email o nombre de usuario.');
      } else if (axiosErr?.response?.data?.message) {
        setError(axiosErr.response.data.message);
      } else {
        setError('No se pudo crear la cuenta. Intenta de nuevo.');
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
          <div style={subtitleStyle}>Crea tu cuenta</div>
        </div>

        {error && <div style={errorBannerStyle}>{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="reg-username">
              Nombre de usuario
            </label>
            <input
              id="reg-username"
              style={fieldErrors.username ? inputErrorStyle : inputStyle}
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: undefined }));
              }}
              placeholder="miusuario"
              autoComplete="username"
              autoFocus
            />
            {fieldErrors.username && (
              <div style={fieldErrorStyle}>{fieldErrors.username}</div>
            )}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              style={fieldErrors.email ? inputErrorStyle : inputStyle}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="tu@email.com"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <div style={fieldErrorStyle}>{fieldErrors.email}</div>
            )}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="reg-password">
              Contrasena
            </label>
            <input
              id="reg-password"
              style={fieldErrors.password ? inputErrorStyle : inputStyle}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              placeholder="Minimo 6 caracteres"
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <div style={fieldErrorStyle}>{fieldErrors.password}</div>
            )}
          </div>

          <button
            type="submit"
            style={submitting ? submitBtnDisabledStyle : submitBtnStyle}
            disabled={submitting}
          >
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div style={footerStyle}>
          Ya tienes cuenta?{' '}
          <button style={linkStyle} onClick={onGoToLogin} type="button">
            Inicia sesion
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
