import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './AuthPage.css';

export function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axiosInstance.post('/api/v1/auth/register', {
        username,
        email,
        password,
      });
      navigate('/login', {
        state: { message: 'Cuenta creada exitosamente. Podés iniciar sesión.' },
      });
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
        if (status === 409) {
          setError('Ya existe una cuenta con ese email.');
        } else if (status === 400) {
          setError('Datos inválidos. Revisá que todos los campos sean correctos.');
        } else {
          setError('Error al crear la cuenta. Intentá de nuevo.');
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
        <p className="auth-card__subtitle">Creá tu cuenta</p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label htmlFor="username" className="auth-form__label">
              Nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              className="auth-form__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu_usuario"
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

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
              placeholder="Mínimo 8 caracteres"
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-form__submit btn btn--primary"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="auth-card__link">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
