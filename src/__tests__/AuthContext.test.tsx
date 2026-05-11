import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext'

// Componente de test que expone el contexto
function TestConsumer() {
  const { user, token, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="username">{user?.username ?? 'null'}</span>
      <span data-testid="userId">{user?.userId ?? 'null'}</span>
      <button onClick={() => login('new-token', 99, 'testuser')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ---- Estado inicial ----

  it('debería tener token null cuando localStorage está vacío', () => {
    renderWithRouter()
    expect(screen.getByTestId('token')).toHaveTextContent('null')
  })

  it('debería tener user null cuando localStorage está vacío', () => {
    renderWithRouter()
    expect(screen.getByTestId('username')).toHaveTextContent('null')
  })

  it('debería leer el token desde localStorage al montar', () => {
    localStorage.setItem('token', 'stored-token')
    localStorage.setItem('userId', '5')
    localStorage.setItem('username', 'maria')

    renderWithRouter()

    expect(screen.getByTestId('token')).toHaveTextContent('stored-token')
    expect(screen.getByTestId('username')).toHaveTextContent('maria')
    expect(screen.getByTestId('userId')).toHaveTextContent('5')
  })

  it('debería retornar token/user null si solo algunos valores están en localStorage', () => {
    // Solo token sin userId ni username — estado inválido
    localStorage.setItem('token', 'solo-token')

    renderWithRouter()

    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(screen.getByTestId('username')).toHaveTextContent('null')
  })

  // ---- Función login ----

  it('debería actualizar token y user al llamar login', async () => {
    renderWithRouter()

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(screen.getByTestId('token')).toHaveTextContent('new-token')
    expect(screen.getByTestId('username')).toHaveTextContent('testuser')
    expect(screen.getByTestId('userId')).toHaveTextContent('99')
  })

  it('debería guardar token en localStorage al llamar login', async () => {
    renderWithRouter()

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(localStorage.getItem('token')).toBe('new-token')
    expect(localStorage.getItem('userId')).toBe('99')
    expect(localStorage.getItem('username')).toBe('testuser')
  })

  // ---- Función logout ----

  it('debería limpiar token y user al llamar logout', async () => {
    localStorage.setItem('token', 'active-token')
    localStorage.setItem('userId', '5')
    localStorage.setItem('username', 'maria')

    renderWithRouter()

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(screen.getByTestId('username')).toHaveTextContent('null')
  })

  it('debería eliminar items de localStorage al llamar logout', async () => {
    localStorage.setItem('token', 'active-token')
    localStorage.setItem('userId', '5')
    localStorage.setItem('username', 'maria')

    renderWithRouter()

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('userId')).toBeNull()
    expect(localStorage.getItem('username')).toBeNull()
  })

  // ---- useAuth fuera de Provider ----

  it('debería lanzar error cuando useAuth se usa fuera de AuthProvider', () => {
    // Silenciamos el error de consola esperado
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(
        <MemoryRouter>
          <TestConsumer />
        </MemoryRouter>
      )
    }).toThrow('useAuth debe usarse dentro de <AuthProvider>')

    consoleError.mockRestore()
  })
})
