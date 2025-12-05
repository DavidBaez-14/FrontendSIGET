import './ProyectoCard.css';

function ProyectoCard({ 
    proyecto, 
    onClick,
    onVerDetalle,
    onVerHistorial,
    onAgendarReunion,
    esEstudiante = false,
    esDirector = false
}) {
    const getEstadoConfig = (estado) => {
        const configs = {
            'REGISTRADO': { label: 'Registrado', color: 'gray' },
            'EN_REVISION_FORMATO': { label: 'Revisión Formato', color: 'blue' },
            'EN_REVISION_CONTENIDO': { label: 'Revisión', color: 'orange' },
            'EN_DESARROLLO': { label: 'En Desarrollo', color: 'blue' },
            'APROBADO_INICIO': { label: 'Aprobado', color: 'green' },
            'FINALIZADO': { label: 'Finalizado', color: 'green' },
            'RECHAZADO': { label: 'Rechazado', color: 'red' },
            'CANCELADO': { label: 'Cancelado', color: 'red' },
            'CON_CORRECCIONES_FORMATO': { label: 'Correcciones', color: 'orange' },
            'CON_CORRECCIONES_CONTENIDO': { label: 'Correcciones', color: 'orange' },
            'SUSTENTACION_PROGRAMADA': { label: 'Sustentación', color: 'purple' },
        };
        return configs[estado] || { label: estado?.replace(/_/g, ' ') || 'Sin estado', color: 'gray' };
    };

    const estadoConfig = getEstadoConfig(proyecto.estado);
    
    // Obtener nombre del primer estudiante
    const estudiantePrincipal = proyecto.estudiantes?.[0];
    const nombreEstudiante = estudiantePrincipal 
        ? `${estudiantePrincipal.nombres || estudiantePrincipal.nombre || ''} ${estudiantePrincipal.apellidos || ''}`.trim()
        : 'Sin asignar';

    // Formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return null;
        const date = new Date(fecha);
        return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Obtener área/línea de investigación
    const areaInvestigacion = proyecto.lineaInvestigacionNombre?.split(' ').slice(0, 3).join(' ') || 'Sin área';

    // Obtener director
    const directorNombre = proyecto.director?.nombre || proyecto.directorNombre || 'Sin asignar';

    const handleCardClick = () => {
        if (onClick) onClick(proyecto);
    };

    const handleButtonClick = (e, callback) => {
        e.stopPropagation();
        if (callback) callback(proyecto);
    };

    return (
        <article className={`proyecto-card ${esEstudiante ? 'proyecto-card--grande' : ''} ${esDirector ? 'proyecto-card--director' : ''}`} onClick={handleCardClick}>
            <div className="proyecto-card__header">
                <h3 className="proyecto-card__titulo">
                    {proyecto.titulo}
                </h3>
                <span className={`proyecto-card__estado proyecto-card__estado--${estadoConfig.color}`}>
                    {estadoConfig.label}
                </span>
            </div>

            {!esEstudiante && (
                <div className="proyecto-card__estudiante">
                    <span className="estudiante-icon">👤</span>
                    <span className="estudiante-nombre">{nombreEstudiante}</span>
                    {proyecto.estudiantes?.length > 1 && (
                        <span className="estudiantes-extra">+{proyecto.estudiantes.length - 1}</span>
                    )}
                </div>
            )}

            {esEstudiante && (
                <div className="proyecto-card__info-detallada">
                    <div className="info-item">
                        <span className="info-label">👨‍🏫 Director:</span>
                        <span className="info-value">{directorNombre}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">📚 Línea de Investigación:</span>
                        <span className="info-value">{proyecto.lineaInvestigacionNombre || 'No asignada'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">📅 Fecha Inicio:</span>
                        <span className="info-value">{formatearFecha(proyecto.fechaInicioDesarrollo || proyecto.fechaPresentacion) || 'No registrada'}</span>
                    </div>
                    {proyecto.fechaSustentacion && (
                        <div className="info-item">
                            <span className="info-label">🎓 Fecha Sustentación:</span>
                            <span className="info-value">{formatearFecha(proyecto.fechaSustentacion)}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="proyecto-card__progreso">
                <div className="progreso-header">
                    <span>Progreso General</span>
                    <span className="progreso-valor">{proyecto.porcentajeAvance || 0}%</span>
                </div>
                <div className="progreso-bar">
                    <div 
                        className="progreso-fill" 
                        style={{ width: `${proyecto.porcentajeAvance || 0}%` }}
                    />
                </div>
            </div>

            {!esEstudiante && (
                <div className="proyecto-card__tags">
                    <span className="proyecto-tag">{areaInvestigacion}</span>
                </div>
            )}

            {!esEstudiante && (
                <div className="proyecto-card__footer">
                    <span className="proyecto-fecha">
                        📅 {proyecto.fechaPresentacion 
                            ? `Presentado: ${formatearFecha(proyecto.fechaPresentacion)}`
                            : 'Sin fecha de presentación'}
                    </span>
                </div>
            )}

            {/* Acciones para estudiante */}
            {esEstudiante && (
                <div className="proyecto-card__acciones">
                    <button 
                        className="btn-card btn-reunion"
                        onClick={(e) => handleButtonClick(e, onAgendarReunion)}
                    >
                        <span>📅</span> Agendar Reunión
                    </button>
                    <button 
                        className="btn-card btn-historial"
                        onClick={(e) => handleButtonClick(e, onVerHistorial)}
                    >
                        <span>📋</span> Ver Historial
                    </button>
                    <button 
                        className="btn-card btn-detalle"
                        onClick={(e) => handleButtonClick(e, onVerDetalle)}
                    >
                        <span>👁️</span> Ver Detalle
                    </button>
                </div>
            )}

            {/* Acciones para Director */}
            {esDirector && (
                <div className="proyecto-card__acciones">
                    <button 
                        className="btn-card btn-reunion"
                        onClick={(e) => handleButtonClick(e, onAgendarReunion)}
                    >
                        <span>📅</span> Agendar
                    </button>
                    <button 
                        className="btn-card btn-historial"
                        onClick={(e) => handleButtonClick(e, onVerHistorial)}
                    >
                        <span>📋</span> Historial
                    </button>
                </div>
            )}

            {proyecto.estado === 'CON_CORRECCIONES_CONTENIDO' && (
                <div className="proyecto-card__alerta">
                    ⚠️ Requiere atención
                </div>
            )}
        </article>
    );
}

export default ProyectoCard;
