import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'
import { AuthProvider } from '../context/AuthContext'

vi.mock('../pages/AuthPage.css', () => ({}))

vi.mock('../api/axiosInstance', () => {
  const instance = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: {
      baseURL: 'http://localhost:8080',
      headers: { 'Content-Type': 'application/json' },
    },
  }
  return { default: instance }
})

import axiosInstance from '../api/axiosInstance'

const mockAxios = axiosInstance as unknown as {
  post: ReturnType<typeof vi.fn>
  defaults: { baseURL: string; headers: Record<string, string> }
}

const renderLoginPage = (initialState?: { message?: string }) => {
  localStorage.clear()
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state: initialState }]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Tablero principal</div>} />
          <Route path="/register" element={<div>Registro</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // ---- Renderizado inicial ----

  it('debería renderizar el formulario de login', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })

  it('debería renderizar el botón "Ingresar"', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  it('debería mostrar mensaje de éxito pasado por estado de navegación', () => {
    renderLoginPage({ message: 'Cuenta creada exitosamente. Podés iniciar sesión.' })
    expect(
      screen.getByText('Cuenta creada exitosamente. Podés iniciar sesión.')
    ).toBeInTheDocument()
  })

  it('debería renderizar el link a /register', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: /registrate/i })).toBeInTheDocument()
  })

  // ---- Flujo de login exitoso ----

  it('debería navegar a "/" después de login exitoso', async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: { token: 'jwt-token', type: 'Bearer', userId: 1, username: 'ana' },
    })

    renderLoginPage()

    await userEvent.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText('Tablero principal')).toBeInTheDocument()
    })
  })

  it('debería llamar POST /api/v1/auth/login con email y password', async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: { token: 'jwt-token', type: 'Bearer', userId: 1, username: 'ana' },
    })

    renderLoginPage()

    await userEvent.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'mipassword')
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'ana@test.com',
        password: 'mipassword',
      })
    })
  })

  // ---- Errores de autenticación ----

  it('debería mostrar error de credenciales incorrectas con 401', async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: { status: 401 },
    })

    renderLoginPage()

    await userEvent.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Credenciales incorrectas. Verificá tu email y contraseña.'
      )
    })
  })

  it('debería mostrar error "cuenta no existe" con 404', async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: { status: 404 },
    })

    renderLoginPage()

    await userEvent.type(screen.getByLabelText(/email/i), 'noexiste@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No existe una cuenta con ese email.'
      )
    })
  })

  it('debería mostrar error genérico con 500', async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: { status: 500 },
    })

    renderLoginPage()

    await userEvent.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Error al iniciar sesión. Intentá de nuevo.'
      )
    })
  })

  it('debería mostrar error de conexión cuando no hay respuesta del servidor', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('Network Error'))

    renderLoginPage()

    await userEvent.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudo conectar con el servidor.'
      )
    })
  })

  // ---- Estado de carga ----

  it('debería deshabilitar campos e inputs durante el loading', async () => {
    let resolve: (val: unknown) => void
    mockAxios.post.mockReturnValueOnce(new Promise((r) => { resolve = r }))

    renderLoginPage()

    await userEvent.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ingresando/i })).toBeDisabled()
    })

    resolve!({ data: { token: 't', type: 'Bearer', userId: 1, username: 'u' } })
  })
})
