const API_BASE_URL = 'http://localhost:8080';

export const proyectosService = {
    async obtenerProyectosPorDirector(cedula) {
        const response = await fetch(`${API_BASE_URL}/proyectos/director/${cedula}`);
        if (!response.ok) {
            throw new Error('Error al obtener proyectos');
        }
        return response.json();
    },

    async obtenerProyectoPorEstudiante(cedula) {
        const response = await fetch(`${API_BASE_URL}/proyectos/estudiante/${cedula}`);
        if (response.status === 404) {
            return null; // El estudiante no tiene proyecto
        }
        if (!response.ok) {
            throw new Error('Error al obtener proyecto del estudiante');
        }
        return response.json();
    },

    async crearProyecto(cedulaEstudiante, proyectoData) {
        const response = await fetch(`${API_BASE_URL}/proyectos/crear/${cedulaEstudiante}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(proyectoData),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Error al crear proyecto');
        }
        return response.json();
    },

    async obtenerTodosLosProyectos() {
        const response = await fetch(`${API_BASE_URL}/proyectos`);
        if (!response.ok) {
            throw new Error('Error al obtener todos los proyectos');
        }
        return response.json();
    },

    async obtenerProyectoPorId(id) {
        const response = await fetch(`${API_BASE_URL}/proyectos/${id}`);
        if (!response.ok) {
            throw new Error('Error al obtener proyecto');
        }
        return response.json();
    },

    async obtenerProyectosPorAdmin(cedulaAdmin) {
        const response = await fetch(`${API_BASE_URL}/proyectos/admin/${cedulaAdmin}`);
        if (!response.ok) {
            throw new Error('Error al obtener proyectos del administrador');
        }
        return response.json();
    },

    async obtenerInfoAdmin(cedulaAdmin) {
        const response = await fetch(`${API_BASE_URL}/proyectos/admin/${cedulaAdmin}/info`);
        if (!response.ok) {
            throw new Error('Error al obtener información del administrador');
        }
        return response.json();
    }
};

export const catalogosService = {
    async obtenerModalidades() {
        const response = await fetch(`${API_BASE_URL}/catalogos/modalidades`);
        if (!response.ok) {
            throw new Error('Error al obtener modalidades');
        }
        return response.json();
    },

    async obtenerAreas() {
        const response = await fetch(`${API_BASE_URL}/catalogos/areas`);
        if (!response.ok) {
            throw new Error('Error al obtener áreas');
        }
        return response.json();
    },

    async obtenerLineas() {
        const response = await fetch(`${API_BASE_URL}/catalogos/lineas`);
        if (!response.ok) {
            throw new Error('Error al obtener líneas');
        }
        return response.json();
    },

    async obtenerLineasPorArea(areaId) {
        const response = await fetch(`${API_BASE_URL}/catalogos/lineas/area/${areaId}`);
        if (!response.ok) {
            throw new Error('Error al obtener líneas por área');
        }
        return response.json();
    }
};

export const usuariosService = {
    async obtenerProfesores() {
        const response = await fetch(`${API_BASE_URL}/api/usuarios/profesores`);
        if (!response.ok) {
            throw new Error('Error al obtener profesores');
        }
        return response.json();
    },

    async obtenerProfesor(cedula) {
        const response = await fetch(`${API_BASE_URL}/api/usuarios/profesores/${cedula}`);
        if (!response.ok) {
            throw new Error('Error al obtener profesor');
        }
        return response.json();
    },

    async obtenerEstudiantes() {
        const response = await fetch(`${API_BASE_URL}/api/usuarios/estudiantes`);
        if (!response.ok) {
            throw new Error('Error al obtener estudiantes');
        }
        return response.json();
    }
};

export const historialService = {
    async obtenerEventosCambioEstado() {
        const response = await fetch(`${API_BASE_URL}/historial/eventos-cambio-estado`);
        if (!response.ok) {
            throw new Error('Error al obtener eventos de cambio de estado');
        }
        return response.json();
    },

    async obtenerTodosLosEventos() {
        const response = await fetch(`${API_BASE_URL}/historial/eventos`);
        if (!response.ok) {
            throw new Error('Error al obtener eventos');
        }
        return response.json();
    },

    async obtenerEstados() {
        const response = await fetch(`${API_BASE_URL}/historial/estados`);
        if (!response.ok) {
            throw new Error('Error al obtener estados');
        }
        return response.json();
    },

    async obtenerHistorialProyecto(proyectoId) {
        const response = await fetch(`${API_BASE_URL}/historial/proyecto/${proyectoId}`);
        if (!response.ok) {
            throw new Error('Error al obtener historial');
        }
        return response.json();
    },

    async cambiarEstadoProyecto(proyectoId, tipoEventoId, descripcion, usuarioResponsableCedula) {
        const response = await fetch(`${API_BASE_URL}/historial/proyecto/${proyectoId}/cambiar-estado`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tipoEventoId,
                descripcion,
                usuarioResponsableCedula
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Error al cambiar estado');
        }
        return response.json();
    }
};

// Exports directos para facilitar el uso
export const obtenerProyectosPorDirector = (cedula) => proyectosService.obtenerProyectosPorDirector(cedula);
export const obtenerProyectosPorEstudiante = (cedula) => proyectosService.obtenerProyectoPorEstudiante(cedula);
export const obtenerProyectosPorAdmin = (cedula) => proyectosService.obtenerProyectosPorAdmin(cedula);
export const obtenerInfoAdmin = (cedula) => proyectosService.obtenerInfoAdmin(cedula);
export const obtenerHistorialProyecto = (proyectoId) => historialService.obtenerHistorialProyecto(proyectoId);
export const crearProyecto = (cedula, data) => proyectosService.crearProyecto(cedula, data);
