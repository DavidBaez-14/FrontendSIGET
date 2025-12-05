import './AccionesProyecto.css';

/**
 * Componente reutilizable para mostrar acciones según el rol del usuario
 * 
 * @param {Object} proyecto - El proyecto sobre el que se ejecutan las acciones
 * @param {string} rol - El rol del usuario: ADMINISTRADOR, DIRECTOR, ESTUDIANTE
 * @param {Object} callbacks - Funciones callback para cada acción
 *   - onCambiarEstado: (proyecto) => void - Solo admin
 *   - onAgendarReunion: (proyecto) => void - Director y Estudiante
 *   - onVerHistorial: (proyecto) => void - Todos
 *   - onVerDetalle: (proyecto) => void - Director y Estudiante
 */
function AccionesProyecto({ proyecto, rol, callbacks = {} }) {
    const {
        onCambiarEstado,
        onAgendarReunion,
        onVerHistorial
    } = callbacks;

    const renderBotonAdmin = () => (
        <>
            <button
                className="btn-accion btn-estado"
                onClick={() => onCambiarEstado?.(proyecto)}
                title="Cambiar estado"
            >
                <span className="btn-icon">⚡</span>
            </button>
            <button
                className="btn-accion btn-historial"
                onClick={() => onVerHistorial?.(proyecto)}
                title="Ver historial"
            >
                <span className="btn-icon">📋</span>
            </button>
        </>
    );

    const renderBotonDirector = () => (
        <>
            <button
                className="btn-accion btn-reunion"
                onClick={() => onAgendarReunion?.(proyecto)}
                title="Agendar reunión"
            >
                <span className="btn-icon">📅</span>
            </button>
            <button
                className="btn-accion btn-historial"
                onClick={() => onVerHistorial?.(proyecto)}
                title="Ver historial"
            >
                <span className="btn-icon">📋</span>
            </button>
        </>
    );

    const renderBotonEstudiante = () => (
        <>
            <button
                className="btn-accion btn-reunion"
                onClick={() => onAgendarReunion?.(proyecto)}
                title="Agendar reunión"
            >
                <span className="btn-icon">📅</span>
            </button>
            <button
                className="btn-accion btn-historial"
                onClick={() => onVerHistorial?.(proyecto)}
                title="Ver historial"
            >
                <span className="btn-icon">📋</span>
            </button>
        </>
    );

    const renderAcciones = () => {
        switch (rol) {
            case 'ADMINISTRADOR':
                return renderBotonAdmin();
            case 'DIRECTOR':
                return renderBotonDirector();
            case 'ESTUDIANTE':
                return renderBotonEstudiante();
            default:
                return null;
        }
    };

    return (
        <div className="acciones-proyecto">
            {renderAcciones()}
        </div>
    );
}

export default AccionesProyecto;
