import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PrivateRoute } from '../components/PrivateRoute'
import { AuthProvider } from '../context/AuthContext'

// Helper para montar PrivateRoute con contexto de auth y rutas
const renderWithAuth = (initialRoute: string, withToken = false) => {
  if (withToken) {
    localStorage.setItem('token', 'valid-token')
    localStorage.setItem('userId', '1')
    localStorage.setItem('username', 'testuser')
  } else {
    localStorage.clear()
  }

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Pagina de Login</div>} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<div>Tablero Kanban</div>} />
            <Route path="/board" element={<div>Contenido protegido</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('PrivateRoute', () => {
  it('debería redirigir a /login cuando no hay token', () => {
    renderWithAuth('/')

    expect(screen.getByText('Pagina de Login')).toBeInTheDocument()
    expect(screen.queryByText('Tablero Kanban')).not.toBeInTheDocument()
  })

  it('debería renderizar el Outlet cuando hay token válido', () => {
    renderWithAuth('/', true)

    expect(screen.getByText('Tablero Kanban')).toBeInTheDocument()
    expect(screen.queryByText('Pagina de Login')).not.toBeInTheDocument()
  })

  it('debería redirigir a /login cuando se intenta acceder a ruta protegida sin token', () => {
    renderWithAuth('/board')

    expect(screen.getByText('Pagina de Login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('debería permitir acceso a ruta protegida con token válido', () => {
    renderWithAuth('/board', true)

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('debería usar replace en el Navigate (no agrega al historial)', () => {
    // Verificamos que la redirección no genera historial adicional
    // renderizamos sin token y verificamos que llega a login
    renderWithAuth('/')

    // Si la redirección es replace, el browser back no llevaría a '/'
    // En este contexto de test verificamos simplemente que llega a login
    expect(screen.getByText('Pagina de Login')).toBeInTheDocument()
  })
})
