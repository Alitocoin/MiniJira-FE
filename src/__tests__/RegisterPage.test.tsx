import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RegisterPage } from '../pages/RegisterPage'
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

const mockAxios = axiosInstance as unknown as { post: ReturnType<typeof vi.fn> }

const renderRegisterPage = () => {
  localStorage.clear()
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<div data-testid="login-page">Pagina de Login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // ---- Renderizado inicial ----

  it('debería renderizar los tres campos del formulario', () => {
    renderRegisterPage()
    expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })

  it('debería renderizar el botón "Crear cuenta"', () => {
    renderRegisterPage()
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
  })

  it('debería renderizar el link hacia /login', () => {
    renderRegisterPage()
    expect(screen.getByRole('link', { name: /iniciá sesión/i })).toBeInTheDocument()
  })

  // ---- Registro exitoso ----

  it('debería navegar a /login después de registro exitoso', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: {} })

    renderRegisterPage()

    await userEvent.type(screen.getByLabelText(/nombre de usuario/i), 'nuevousuario')
    await userEvent.type(screen.getByLabelText(/email/i), 'nuevo@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })
  })

  it('debería llamar POST /api/v1/auth/register con los datos correctos', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: {} })

    renderRegisterPage()

    await userEvent.type(screen.getByLabelText(/nombre de usuario/i), 'newuser')
    await userEvent.type(screen.getByLabelText(/email/i), 'new@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'securepass')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/v1/auth/register', {
        username: 'newuser',
        email: 'new@test.com',
        password: 'securepass',
      })
    })
  })

  // ---- Errores del servidor ----

  it('debería mostrar error "ya existe cuenta" con 409', async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: { status: 409 },
    })

    renderRegisterPage()

    await userEvent.type(screen.getByLabelText(/nombre de usuario/i), 'existente')
    await userEvent.type(screen.getByLabelText(/email/i), 'existente@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Ya existe una cuenta con ese email.'
      )
    })
  })

  it('debería mostrar error de datos inválidos con 400', async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: { status: 400 },
    })

    renderRegisterPage()

    await userEvent.type(screen.getByLabelText(/nombre de usuario/i), 'u')
    await userEvent.type(screen.getByLabelText(/email/i), 'no-es-email')
    await userEvent.type(screen.getByLabelText(/contraseña/i), '123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Datos inválidos. Revisá que todos los campos sean correctos.'
      )
    })
  })

  it('debería mostrar error genérico con 500', async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: { status: 500 },
    })

    renderRegisterPage()

    await userEvent.type(screen.getByLabelText(/nombre de usuario/i), 'user')
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Error al crear la cuenta. Intentá de nuevo.'
      )
    })
  })

  it('debería mostrar error de conexión cuando falla la red', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('Network Error'))

    renderRegisterPage()

    await userEvent.type(screen.getByLabelText(/nombre de usuario/i), 'user')
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No se pudo conectar con el servidor.'
      )
    })
  })

  // ---- Estado de carga ----

  it('debería deshabilitar el botón durante el envío', async () => {
    let resolve: (val: unknown) => void
    mockAxios.post.mockReturnValueOnce(new Promise((r) => { resolve = r }))

    renderRegisterPage()

    await userEvent.type(screen.getByLabelText(/nombre de usuario/i), 'user')
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creando cuenta/i })).toBeDisabled()
    })

    resolve!({ data: {} })
  })
})
