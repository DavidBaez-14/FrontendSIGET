import { createContext, useContext, useState } from 'react';
import axios from 'axios';

/**
 * AuthContext - Contexto de autenticación con backend real
 * 
 * Maneja:
 * - Login con cédula y contraseña
 * - Logout
 * - Persistencia de sesión en localStorage
 * - Estado de autenticación
 * 
 * Uso:
 * - Envolver la app con <AuthProvider>
 * - Usar useAuth() en cualquier componente
 */

// Crear el contexto
const AuthContext = createContext(null);

/**
 * Hook personalizado para acceder al contexto de autenticación
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

/**
 * Provider de autenticación
 */
export function AuthProvider({ children }) {
    // Lazy initialization - cargar usuario desde localStorage una vez
    const [usuario, setUsuario] = useState(() => {
        try {
            const usuarioGuardado = localStorage.getItem('usuario');
            if (usuarioGuardado) {
                return JSON.parse(usuarioGuardado);
            }
        } catch (error) {
            console.error('Error al cargar usuario:', error);
            localStorage.removeItem('usuario');
        }
        return null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            const usuarioGuardado = localStorage.getItem('usuario');
            return usuarioGuardado !== null;
        } catch {
            return false;
        }
    });

    // Loading siempre es false porque usamos lazy initialization (sin useEffect asíncrono)
    const loading = false;

    /**
     * Login - Autentica usuario con el backend
     */
    const login = async (cedula, password) => {
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                cedula,
                password
            });

            const userData = {
                cedula: response.data.cedula,
                nombre: response.data.nombre,
                email: response.data.email,
                rol: response.data.rol,
                esAdminGeneral: response.data.esAdminGeneral,
                comiteNombre: response.data.comiteNombre,
                programaCodigo: response.data.programaCodigo
            };

            setUsuario(userData);
            setIsAuthenticated(true);
            localStorage.setItem('usuario', JSON.stringify(userData));

            return userData;
        } catch (error) {
            console.error('Error en login:', error);
            const mensaje = error.response?.data?.error || 'Error al iniciar sesión';
            throw new Error(mensaje);
        }
    };

    /**
     * Logout - Cierra sesión del usuario
     */
    const logout = () => {
        setUsuario(null);
        setIsAuthenticated(false);
        localStorage.removeItem('usuario');
    };

    /**
     * Verifica si el usuario actual tiene un permiso específico
     */
    const tienePermiso = (permiso) => {
        if (!usuario) return false;
        
        const permisos = {
            ADMINISTRADOR: ['ver_todos_proyectos', 'cambiar_estado', 'ver_historial', 'ver_comites'],
            DIRECTOR: ['ver_mis_proyectos', 'agendar_reunion', 'ver_historial', 'ver_detalle'],
            ESTUDIANTE: ['ver_mi_proyecto', 'crear_proyecto', 'agendar_reunion', 'ver_historial', 'ver_detalle']
        };
        return permisos[usuario.rol]?.includes(permiso) || false;
    };

    // Valor del contexto
    const value = {
        usuario,
        isAuthenticated,
        loading,
        login,
        logout,
        tienePermiso,
        esAdmin: usuario?.rol === 'ADMINISTRADOR',
        esDirector: usuario?.rol === 'DIRECTOR',
        esEstudiante: usuario?.rol === 'ESTUDIANTE'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
