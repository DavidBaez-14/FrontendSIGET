import { useAuth } from '../../context/AuthContext';
import NavBar from './navBar';
import './MainLayout.css';

/**
 * Layout principal que envuelve todas las vistas
 * Incluye el NavBar con menú según el rol del usuario
 * @param {React.ReactNode} selectorUsuarios - Componente selector de usuarios para testing
 */
function MainLayout({ children, menuActivo = 'Dashboard', onMenuClick, selectorUsuarios }) {
    const { usuario } = useAuth();

    return (
        <div className="main-layout">
            <NavBar 
                nombreUsuario={usuario.nombre}
                rol={usuario.rol}
                menuActivo={menuActivo}
                onMenuClick={onMenuClick}
            />
            <main className="main-content">
                {children}
            </main>
            
            {/* Panel de testing para cambiar de usuario */}
            {selectorUsuarios && (
                <div className="testing-panel">
                    {selectorUsuarios}
                </div>
            )}
        </div>
    );
}

export default MainLayout;
