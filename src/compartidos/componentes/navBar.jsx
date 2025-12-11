import { LayoutDashboard, FolderKanban, Users, Calendar, FileText, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificacionesDropdown from './NotificacionesDropdown';
import './NavBar.css';
import logoUfps from '../../assets/logo_tesis_ufps.png';

// Menús por rol con iconos de lucide-react
const MENUS_POR_ROL = {
    ADMINISTRADOR: [
        { label: 'Dashboard', Icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Proyectos', Icon: FolderKanban, path: '/proyectos' },
        { label: 'Comités', Icon: Users, path: '/comites' },
    ],
    DIRECTOR: [
        { label: 'Dashboard', Icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Proyectos', Icon: FolderKanban, path: '/proyectos' },
        { label: 'Reuniones', Icon: Calendar, path: '/reuniones' },
    ],
    ESTUDIANTE: [
        { label: 'Dashboard', Icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Documentos', Icon: FileText, path: '/documentos' },
        { label: 'Reuniones', Icon: Calendar, path: '/reuniones' },
    ]
};

function NavBar({ nombreUsuario = 'Usuario', rol = 'ESTUDIANTE', menuActivo = 'Dashboard', onMenuClick }) {
    const { logout } = useAuth();
    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const menuItems = MENUS_POR_ROL[rol] || MENUS_POR_ROL.ESTUDIANTE;

    const handleMenuClick = (e, label) => {
        e.preventDefault();
        if (onMenuClick) {
            onMenuClick(label);
        }
    };

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de cerrar sesión?')) {
            logout();
        }
    };

    const toggleDropdown = () => {
        setDropdownAbierto(!dropdownAbierto);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <img src={logoUfps} alt="UFPS Logo" className="navbar-logo" />
                    <div className="navbar-title">
                        <span className="title-main">Sistema de Gestión de Tesis</span>
                        <span className="title-sub">Universidad Francisco de Paula Santander</span>
                    </div>
                </div>

                <ul className="navbar-menu">
                    {menuItems.map((item, index) => {
                        const IconComponent = item.Icon;
                        return (
                            <li key={index} className={`navbar-item ${menuActivo === item.label ? 'active' : ''}`}>
                                <a 
                                    href="#" 
                                    className="navbar-link"
                                    onClick={(e) => handleMenuClick(e, item.label)}
                                >
                                    <IconComponent size={18} strokeWidth={2} />
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>

                <div className="navbar-actions">
                    {/* Notificaciones para estudiantes y directores */}
                    {(rol === 'ESTUDIANTE' || rol === 'DIRECTOR') && <NotificacionesDropdown />}
                    
                    <div className="navbar-user-container">
                        <div 
                            className="navbar-user" 
                            onClick={toggleDropdown}
                            style={{ cursor: 'pointer' }}
                        >
                            <User className="user-icon-svg" size={18} strokeWidth={2} />
                            <span className="user-name">{nombreUsuario.split(' ').slice(0, 2).join(' ')}</span>
                        </div>

                        {/* Dropdown de usuario */}
                        {dropdownAbierto && (
                            <>
                                <div 
                                    className="dropdown-overlay" 
                                    onClick={() => setDropdownAbierto(false)}
                                />
                                <div className="navbar-dropdown">
                                    <div className="dropdown-header">
                                        <User size={24} />
                                        <div>
                                            <p className="dropdown-nombre">{nombreUsuario}</p>
                                            <p className="dropdown-rol">{rol}</p>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <button 
                                        className="dropdown-item logout"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={18} />
                                        <span>Cerrar Sesión</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
