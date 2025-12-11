const API_BASE_URL = 'http://localhost:8080';

export const proyectosService = {
    async obtenerProyectosDirector(cedula) {
        const response = await fetch(`${API_BASE_URL}/proyectos/director/${cedula}`);
        if (!response.ok) {
            throw new Error('Error al obtener proyectos');
        }
        return response.json();
    },

    async obtenerProyectoEstudiante(cedula) {
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

    async obtenerTodos() {
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
    }
};

export const adminService = {
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
        const response = await fetch(`${API_BASE_URL}/modalidades`);
        if (!response.ok) {
            throw new Error('Error al obtener modalidades');
        }
        return response.json();
    },

    async obtenerLineasInvestigacion() {
        const response = await fetch(`${API_BASE_URL}/lineas-investigacion`);
        if (!response.ok) {
            throw new Error('Error al obtener líneas de investigación');
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

export const notificacionesService = {
    async obtenerNotificaciones(cedula) {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/usuario/${cedula}`);
        if (!response.ok) {
            throw new Error('Error al obtener notificaciones');
        }
        return response.json();
    },

    async obtenerNotificacionesPendientes(cedula) {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/usuario/${cedula}/pendientes`);
        if (!response.ok) {
            throw new Error('Error al obtener notificaciones pendientes');
        }
        return response.json();
    },

    async contarNotificacionesNoLeidas(cedula) {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/usuario/${cedula}/contador`);
        if (!response.ok) {
            throw new Error('Error al contar notificaciones');
        }
        return response.json();
    },

    async enviarInvitacion(invitacionData) {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/invitar-companero`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invitacionData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al enviar invitación');
        }
        return response.json();
    },

    async responderInvitacion(notificacionId, respuesta) {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/${notificacionId}/responder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ respuesta }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al responder invitación');
        }
        return response.json();
    },

    async marcarComoLeida(notificacionId) {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/${notificacionId}/marcar-leida`, {
            method: 'PATCH',
        });
        if (!response.ok) {
            throw new Error('Error al marcar notificación como leída');
        }
        return response.json();
    },

    async buscarEstudiante(cedula) {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/buscar-estudiante/${cedula}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al buscar estudiante');
        }
        return response.json();
    },

    async buscarEstudiantePorCodigo(codigo) {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/buscar-estudiante-codigo/${codigo}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al buscar estudiante');
        }
        return response.json();
    },

    async buscarDirectores(busqueda = '') {
        const url = busqueda 
            ? `${API_BASE_URL}/api/notificaciones/buscar-directores?busqueda=${encodeURIComponent(busqueda)}`
            : `${API_BASE_URL}/api/notificaciones/listar-directores`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al buscar directores');
        }
        return response.json();
    },

    async listarTodosLosDirectores() {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/listar-directores`);
        if (!response.ok) {
            throw new Error('Error al listar directores');
        }
        return response.json();
    },

    async enviarInvitacionDirector(invitacionData) {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/invitar-director`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invitacionData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al enviar invitación al director');
        }
        return response.json();
    },

    async responderInvitacionDirector(notificacionId, respuesta) {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/${notificacionId}/responder-direccion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ respuesta }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al responder invitación de dirección');
        }
        return response.json();
    },

    async cancelarInvitacionDirector(notificacionId) {
        const response = await fetch(`${API_BASE_URL}/api/notificaciones/${notificacionId}/cancelar-invitacion-director`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al cancelar invitación');
        }
        return response.json();
    },

    async obtenerInvitacionPendienteProyecto(proyectoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/notificaciones/proyecto/${proyectoId}/invitacion-pendiente`);
            if (!response.ok) {
                console.error('Error al obtener invitación pendiente:', response.status);
                return null;
            }
            const data = await response.json();
            
            if (data.invitacion) {
                console.log('Invitación pendiente encontrada:', data.invitacion.metadata?.directorNombre);
            } else {
                console.log('ℹ️ No hay invitación pendiente para el proyecto', proyectoId);
            }
            return data.invitacion;
        } catch (error) {
            console.error('Error en obtenerInvitacionPendienteProyecto:', error);
            return null;
        }
    }
};

// Exports directos para facilitar el uso
export const obtenerProyectosDirector = (cedula) => proyectosService.obtenerProyectosDirector(cedula);
export const obtenerProyectoEstudiante = (cedula) => proyectosService.obtenerProyectoEstudiante(cedula);
export const obtenerProyectosPorAdmin = (cedula) => proyectosService.obtenerProyectosPorAdmin(cedula);
export const obtenerInfoAdmin = (cedula) => adminService.obtenerInfoAdmin(cedula);
export const obtenerHistorialProyecto = (proyectoId) => historialService.obtenerHistorialProyecto(proyectoId);
export const crearProyecto = (cedula, data) => proyectosService.crearProyecto(cedula, data);
