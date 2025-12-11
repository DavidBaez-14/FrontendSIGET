import { useAuth } from '../../context/AuthContext';
import NavBar from './navBar';
import './MainLayout.css';

/**
 * Layout principal que envuelve todas las vistas
 * Incluye el NavBar con menú según el rol del usuario
 */
function MainLayout({ children, menuActivo = 'Dashboard', onMenuClick }) {
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
        </div>
    );
}

export default MainLayout;
