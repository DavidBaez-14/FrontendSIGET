import AccionesProyecto from './AccionesProyecto';
import './TablaProyectos.css';

// Mapeo de códigos de programa a nombres (según programas.sql de la UFPS)
const PROGRAMAS = {
    // Facultad de Ingenierías (1)
    '111': 'Ing. Civil',
    '112': 'Ing. Mecánica',
    '114': 'Ing. Mecánica',        // Alias por si viene con este código
    '115': 'Ing. Sistemas',
    '116': 'Ing. Electrónica',
    '118': 'Ing. Minas',
    '119': 'Ing. Electromecánica',
    '120': 'Ing. Industrial',
    
    // Facultad de Ciencias Empresariales (2)
    '210': 'Administración',
    '211': 'Contaduría',
    '212': 'Comercio Internacional',
    
    // Facultad de Ciencias Agrarias y del Ambiente (3)
    '610': 'Ing. Ambiental',
    '611': 'Ing. Agroindustrial',
    '612': 'Ing. Agronómica',
    '613': 'Zootecnia',
    '614': 'Ing. Biotecnológica',
    
    // Facultad de Ciencias de la Salud (4)
    '510': 'Enfermería',
    '511': 'Medicina',
    
    // Facultad de Educación, Artes y Humanidades (5)
    '310': 'Derecho',
    '311': 'Comunicación Social',
    '410': 'Lic. Matemáticas',
    '411': 'Lic. Informática',
    '412': 'Lic. Educación Comunitaria',
    '420': 'Lic. Educación Infantil',
    '421': 'Lic. Educación Física',
    '422': 'Lic. Lengua Castellana',
    '423': 'Lic. Ciencias Naturales',
    '424': 'Lic. Educación Artística',
    '425': 'Lic. Básica Primaria',
    '430': 'Lic. Filosofía',
    '431': 'Lic. Inglés',
    '432': 'Lic. Ciencias Sociales',
    '433': 'Lic. Educación Religiosa',
    '434': 'Lic. Educación Especial'
};

/**
 * Tabla reutilizable para mostrar proyectos según el rol
 * 
 * @param {Array} proyectos - Lista de proyectos a mostrar
 * @param {string} rol - El rol del usuario: ADMINISTRADOR, DIRECTOR, ESTUDIANTE
 * @param {Object} acciones - Callbacks para las acciones de cada proyecto
 * @param {boolean} loading - Si está cargando datos
 * @param {boolean} mostrarPrograma - Si debe mostrar la columna de programa (útil para admin)
 */
function TablaProyectos({ 
    proyectos = [], 
    rol, 
    acciones = {},
    loading = false,
    mostrarPrograma = false 
}) {
    
    const getEstadoBadgeClass = (estado) => {
        const estadoNormalizado = estado?.toLowerCase().replace(/_/g, '-') || 'desconocido';
        return `estado-badge estado-${estadoNormalizado}`;
    };

    const getFaseBadgeClass = (fase) => {
        const clases = {
            'FORMULACION': 'fase-formulacion',
            'EVALUACION': 'fase-evaluacion',
            'APROBACION': 'fase-aprobacion',
            'EJECUCION': 'fase-ejecucion',
            'CIERRE': 'fase-cierre',
            'FINALIZACION': 'fase-finalizacion'
        };
        return `fase-badge ${clases[fase] || 'fase-default'}`;
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Sin fecha';
        return new Date(fecha).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const obtenerEstudiantes = (proyecto) => {
        if (proyecto.estudiantes && proyecto.estudiantes.length > 0) {
            return proyecto.estudiantes.map(est => {
                // El backend devuelve 'nombres' y 'apellidos', no 'nombre'
                const nombre = est.nombre || `${est.nombres || ''} ${est.apellidos || ''}`.trim();
                return nombre || 'Sin nombre';
            }).join(', ');
        }
        return 'Sin asignar';
    };

    const obtenerProgramaEstudiantes = (proyecto) => {
        if (proyecto.estudiantes && proyecto.estudiantes.length > 0) {
            const programas = [...new Set(proyecto.estudiantes.map(est => {
                // El backend devuelve 'programaCodigo', no 'programaNombre'
                const codigo = est.programaCodigo;
                return PROGRAMAS[codigo] || codigo || 'Sin programa';
            }))];
            return programas.join(', ');
        }
        return 'N/A';
    };

    if (loading) {
        return (
            <div className="tabla-loading">
                <div className="spinner"></div>
                <p>Cargando proyectos...</p>
            </div>
        );
    }

    if (proyectos.length === 0) {
        return (
            <div className="tabla-vacia">
                <span className="tabla-vacia-icon">📋</span>
                <p>No hay proyectos disponibles</p>
            </div>
        );
    }

    return (
        <div className="tabla-proyectos-container">
            <table className="tabla-proyectos">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Estudiantes</th>
                        {mostrarPrograma && <th>Programa</th>}
                        <th>Director</th>
                        <th>Fase</th>
                        <th>Estado</th>
                        <th>Fecha Inicio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {proyectos.map((proyecto) => (
                        <tr key={proyecto.id}>
                            <td className="td-titulo">
                                <span className="proyecto-titulo" title={proyecto.titulo}>
                                    {proyecto.titulo}
                                </span>
                            </td>
                            <td className="td-estudiantes">
                                {obtenerEstudiantes(proyecto)}
                            </td>
                            {mostrarPrograma && (
                                <td className="td-programa">
                                    <span className="programa-badge">
                                        {obtenerProgramaEstudiantes(proyecto)}
                                    </span>
                                </td>
                            )}
                            <td className="td-director">
                                {proyecto.directorNombre || proyecto.director?.nombre || 'Sin asignar'}
                            </td>
                            <td className="td-fase">
                                <span className={getFaseBadgeClass(proyecto.fase)}>
                                    {proyecto.fase || 'Sin fase'}
                                </span>
                            </td>
                            <td className="td-estado">
                                <span className={getEstadoBadgeClass(proyecto.estado)}>
                                    {proyecto.estado?.replace(/_/g, ' ') || 'Desconocido'}
                                </span>
                            </td>
                            <td className="td-fecha">
                                {formatearFecha(proyecto.fechaInicioDesarrollo || proyecto.fechaPresentacion || proyecto.fechaInicio)}
                            </td>
                            <td className="td-acciones">
                                <AccionesProyecto 
                                    proyecto={proyecto}
                                    rol={rol}
                                    callbacks={acciones}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TablaProyectos;
