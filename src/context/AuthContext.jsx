import { createContext, useContext, useState } from 'react';

/**
 * AuthContext - Contexto de autenticación para la aplicación
 * 
 * Este componente proporciona un sistema de autenticación simulado para el MVP.
 * Permite cambiar entre diferentes tipos de usuarios (Admin, Director, Estudiante)
 * para probar las diferentes vistas y funcionalidades de la aplicación.
 * 
 * En producción, este contexto se conectaría con un backend real de autenticación.
 * 
 * Uso:
 * - Envolver la app con <AuthProvider>
 * - Usar useAuth() en cualquier componente para acceder al usuario actual
 * - Usar cambiarUsuario('TIPO') para simular login con diferentes roles
 */

// Usuarios de prueba - DEBEN COINCIDIR con datos reales de la BD
const USUARIOS_PRUEBA = {
    ADMIN_GENERAL: {
        cedula: '4000000001',
        nombre: 'Carlos René Angarita',
        rol: 'ADMINISTRADOR',
        esAdminGeneral: true,
        comiteNombre: null,
        programaCodigo: null
    },
    ADMIN_SISTEMAS: {
        cedula: '4000000002',
        nombre: 'Judith del Pilar Rodriguez Tenjo',
        rol: 'ADMINISTRADOR',
        esAdminGeneral: false,
        comiteNombre: 'COM-SIST',
        programaCodigo: '115'
    },
    DIRECTOR: {
        cedula: '2000000760',
        nombre: 'Marco Adarme',
        rol: 'DIRECTOR',
        esAdminGeneral: false,
        comiteNombre: null,
        programaCodigo: null
    },
    ESTUDIANTE: {
        cedula: '1000033333',  // Estudiante con proyecto del director 2000000760
        nombre: 'David Báez',
        rol: 'ESTUDIANTE',
        esAdminGeneral: false,
        comiteNombre: null,
        programaCodigo: '115'
    }
};

// Crear el contexto
const AuthContext = createContext(null);

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} Objeto con usuario, funciones y helpers de autenticación
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
 * Provider de autenticación que envuelve la aplicación
 */
export function AuthProvider({ children }) {
    // Usuario inicial: Admin de Sistemas (para pruebas)
    const [usuario, setUsuario] = useState(USUARIOS_PRUEBA.ADMIN_SISTEMAS);

    /**
     * Cambia el usuario activo (simula login)
     * @param {string} tipoUsuario - ADMIN_GENERAL | ADMIN_SISTEMAS | DIRECTOR | ESTUDIANTE
     */
    const cambiarUsuario = (tipoUsuario) => {
        if (USUARIOS_PRUEBA[tipoUsuario]) {
            setUsuario(USUARIOS_PRUEBA[tipoUsuario]);
        }
    };

    /**
     * Verifica si el usuario actual tiene un permiso específico
     * @param {string} permiso - Nombre del permiso a verificar
     * @returns {boolean}
     */
    const tienePermiso = (permiso) => {
        const permisos = {
            ADMINISTRADOR: ['ver_todos_proyectos', 'cambiar_estado', 'ver_historial', 'ver_comites'],
            DIRECTOR: ['ver_mis_proyectos', 'agendar_reunion', 'ver_historial', 'ver_detalle'],
            ESTUDIANTE: ['ver_mi_proyecto', 'crear_proyecto', 'agendar_reunion', 'ver_historial', 'ver_detalle']
        };
        return permisos[usuario.rol]?.includes(permiso) || false;
    };

    // Valor del contexto con toda la información necesaria
    const value = {
        usuario,                    // Usuario actual
        cambiarUsuario,             // Función para cambiar usuario
        tienePermiso,               // Función para verificar permisos
        esAdmin: usuario.rol === 'ADMINISTRADOR',
        esDirector: usuario.rol === 'DIRECTOR',
        esEstudiante: usuario.rol === 'ESTUDIANTE',
        usuariosPrueba: USUARIOS_PRUEBA  // Para el selector de usuarios de prueba
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
