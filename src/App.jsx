import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainLayout from './compartidos/componentes/MainLayout'
import DashboardUnificado from './vistas/DashboardUnificado'
import './App.css'

/**
 * Selector de usuarios de prueba - Permite cambiar entre diferentes roles
 * para probar las diferentes vistas de la aplicación
 */
function SelectorUsuarios() {
  const { usuario, cambiarUsuario, usuariosPrueba } = useAuth();

  return (
    <div className="usuario-selector-inline">
      <span className="selector-title">🧪 Cambiar Usuario:</span>
      <div className="selector-opciones">
        <button 
          className={`selector-btn ${usuario.cedula === usuariosPrueba.ADMIN_GENERAL.cedula ? 'active' : ''}`}
          onClick={() => cambiarUsuario('ADMIN_GENERAL')}
          title="Super Administrador General"
        >
          👑
        </button>
        <button 
          className={`selector-btn ${usuario.cedula === usuariosPrueba.ADMIN_SISTEMAS.cedula ? 'active' : ''}`}
          onClick={() => cambiarUsuario('ADMIN_SISTEMAS')}
          title="Coordinador Comité Sistemas"
        >
          📋
        </button>
        <button 
          className={`selector-btn ${usuario.cedula === usuariosPrueba.DIRECTOR.cedula ? 'active' : ''}`}
          onClick={() => cambiarUsuario('DIRECTOR')}
          title="Director de Tesis"
        >
          👨‍🏫
        </button>
        <button 
          className={`selector-btn ${usuario.cedula === usuariosPrueba.ESTUDIANTE.cedula ? 'active' : ''}`}
          onClick={() => cambiarUsuario('ESTUDIANTE')}
          title="Estudiante (con proyecto)"
        >
          👨‍🎓
        </button>
        <button 
          className={`selector-btn ${usuario.cedula === usuariosPrueba.ESTUDIANTE2.cedula ? 'active' : ''}`}
          onClick={() => cambiarUsuario('ESTUDIANTE2')}
          title="Estudiante 2 (sin proyecto)"
        >
          👩‍🎓
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const [menuActivo, setMenuActivo] = useState('Dashboard');

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
        return (
          <div className="vista-placeholder">
            <span className="placeholder-icon">📅</span>
            <h2>Mis Reuniones</h2>
            <p>Próximamente podrás agendar y visualizar las reuniones con tu director.</p>
          </div>
        );
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
      selectorUsuarios={<SelectorUsuarios />}
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
