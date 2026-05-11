import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

interface LoginResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message ?? null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await axiosInstance.post<LoginResponse>('/api/v1/auth/login', {
        email,
        password,
      });
      login(data.token, data.userId, data.username);
      navigate('/');
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'status' in err.response
      ) {
        const status = (err.response as { status: number }).status;
        if (status === 401) {
          setError('Credenciales incorrectas. Verificá tu email y contraseña.');
        } else if (status === 404) {
          setError('No existe una cuenta con ese email.');
        } else {
          setError('Error al iniciar sesión. Intentá de nuevo.');
        }
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo" aria-hidden="true">&#9698;</div>
        <h1 className="auth-card__title">Mini Jira</h1>
        <p className="auth-card__subtitle">Iniciá sesión en tu cuenta</p>

        {successMessage && (
          <div className="auth-success" role="status">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label htmlFor="email" className="auth-form__label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="auth-form__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="password" className="auth-form__label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="auth-form__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-form__submit btn btn--primary"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="auth-card__link">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
