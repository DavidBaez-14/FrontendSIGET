import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainLayout from './compartidos/componentes/MainLayout'
import DashboardUnificado from './vistas/DashboardUnificado'
import LoginPage from './auth/LoginPage'
import './App.css'

/**
 * Componente principal de la aplicación
 * Maneja la autenticación y el renderizado de vistas según el usuario
 */
function AppContent() {
  const { usuario, isAuthenticated, loading } = useAuth();
  const [menuActivo, setMenuActivo] = useState('Dashboard');

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no está autenticado, mostrar página de login
  if (!isAuthenticated || !usuario) {
    return <LoginPage />;
  }

  const handleMenuClick = (menu) => {
    setMenuActivo(menu);
  };

  // Render de contenido según menú activo
  const renderContenido = () => {
    switch (menuActivo) {
      case 'Dashboard':
        return <DashboardUnificado vistaActiva="dashboard" />;
      case 'Proyectos':
        return <DashboardUnificado vistaActiva="proyectos" />;
      case 'Documentos':
        return (
          <div className="vista-placeholder">
            <span className="placeholder-icon">📄</span>
            <h2>Mis Documentos</h2>
            <p>Próximamente podrás visualizar y gestionar los documentos de tu proyecto de grado.</p>
          </div>
        );
      case 'Reuniones':
        return <DashboardUnificado vistaActiva="reuniones" />;
      case 'Comités':
        return (
          <div className="vista-placeholder">
            <span className="placeholder-icon">👥</span>
            <h2>Gestión de Comités</h2>
            <p>Esta funcionalidad estará disponible próximamente</p>
          </div>
        );
      default:
        return <DashboardUnificado vistaActiva="dashboard" />;
    }
  };

  return (
    <MainLayout 
      menuActivo={menuActivo} 
      onMenuClick={handleMenuClick}
    >
      {renderContenido()}
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
