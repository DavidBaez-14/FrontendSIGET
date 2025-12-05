import './ProyectoModal.css';

function ProyectoModal({ proyecto, onClose }) {
    const getEstadoConfig = (estado) => {
        const configs = {
            'REGISTRADO': { label: 'Registrado', color: 'gray' },
            'EN_REVISION_FORMATO': { label: 'En Revisión de Formato', color: 'blue' },
            'EN_REVISION_CONTENIDO': { label: 'En Revisión de Contenido', color: 'orange' },
            'EN_DESARROLLO': { label: 'En Desarrollo', color: 'blue' },
            'APROBADO_INICIO': { label: 'Aprobado para Inicio', color: 'green' },
            'FINALIZADO': { label: 'Finalizado', color: 'green' },
            'RECHAZADO': { label: 'Rechazado', color: 'red' },
            'CANCELADO': { label: 'Cancelado', color: 'red' },
        };
        return configs[estado] || { label: estado?.replace(/_/g, ' '), color: 'gray' };
    };

    const estadoConfig = getEstadoConfig(proyecto.estado);

    const formatearFecha = (fecha) => {
        if (!fecha) return 'No definida';
        return new Date(fecha).toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getResultadoLabel = (resultado) => {
        const labels = {
            'APROBADA': '✅ Aprobada',
            'MERITORIA': '🏅 Meritoria',
            'LAUREADA': '🏆 Laureada',
            'RECHAZADA': '❌ Rechazada',
            'A_CORREGIR': '📝 A Corregir',
        };
        return labels[resultado] || resultado;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                
                <header className="modal-header">
                    <div className="modal-header__info">
                        <span className="modal-codigo">{proyecto.codigoProyecto}</span>
                        <span className={`modal-estado modal-estado--${estadoConfig.color}`}>
                            {estadoConfig.label}
                        </span>
                    </div>
                    <h2 className="modal-titulo">{proyecto.titulo}</h2>
                </header>

                <div className="modal-body">
                    {/* Información General */}
                    <section className="modal-section">
                        <h3 className="section-title">📋 Información General</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Modalidad</span>
                                <span className="info-value">{proyecto.modalidadNombre?.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Línea de Investigación</span>
                                <span className="info-value">{proyecto.lineaInvestigacionNombre}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Fase Actual</span>
                                <span className="info-value">{proyecto.fase?.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Progreso</span>
                                <span className="info-value info-value--highlight">{proyecto.porcentajeAvance}%</span>
                            </div>
                        </div>
                    </section>

                    {/* Descripción */}
                    {proyecto.descripcion && (
                        <section className="modal-section">
                            <h3 className="section-title">📝 Descripción</h3>
                            <p className="descripcion-text">{proyecto.descripcion}</p>
                        </section>
                    )}

                    {/* Objetivo General */}
                    {proyecto.objetivoGeneral && (
                        <section className="modal-section">
                            <h3 className="section-title">🎯 Objetivo General</h3>
                            <p className="descripcion-text">{proyecto.objetivoGeneral}</p>
                        </section>
                    )}

                    {/* Estudiantes */}
                    <section className="modal-section">
                        <h3 className="section-title">👥 Estudiantes ({proyecto.estudiantes?.length || 0})</h3>
                        <div className="estudiantes-list">
                            {proyecto.estudiantes?.map((est, idx) => (
                                <div key={idx} className="estudiante-item">
                                    <span className="estudiante-avatar">👤</span>
                                    <div className="estudiante-info">
                                        <span className="estudiante-nombre">
                                            {est.nombres} {est.apellidos}
                                        </span>
                                        <span className="estudiante-email">{est.email}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Fechas */}
                    <section className="modal-section">
                        <h3 className="section-title">📅 Fechas Importantes</h3>
                        <div className="fechas-grid">
                            <div className="fecha-item">
                                <span className="fecha-label">Presentación</span>
                                <span className="fecha-value">{formatearFecha(proyecto.fechaPresentacion)}</span>
                            </div>
                            <div className="fecha-item">
                                <span className="fecha-label">Inicio Desarrollo</span>
                                <span className="fecha-value">{formatearFecha(proyecto.fechaInicioDesarrollo)}</span>
                            </div>
                            <div className="fecha-item">
                                <span className="fecha-label">Fin Estimado</span>
                                <span className="fecha-value">{formatearFecha(proyecto.fechaFinEstimada)}</span>
                            </div>
                            <div className="fecha-item">
                                <span className="fecha-label">Sustentación</span>
                                <span className="fecha-value">{formatearFecha(proyecto.fechaSustentacion)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Resultados (si aplica) */}
                    {(proyecto.notaFinal || proyecto.resultadoFinal) && (
                        <section className="modal-section">
                            <h3 className="section-title">🏆 Resultados</h3>
                            <div className="resultados-grid">
                                {proyecto.notaFinal && (
                                    <div className="resultado-item">
                                        <span className="resultado-label">Nota Final</span>
                                        <span className="resultado-value resultado-nota">{proyecto.notaFinal}</span>
                                    </div>
                                )}
                                {proyecto.resultadoFinal && (
                                    <div className="resultado-item">
                                        <span className="resultado-label">Calificación</span>
                                        <span className="resultado-value">{getResultadoLabel(proyecto.resultadoFinal)}</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                <footer className="modal-footer">
                    <span className="modal-actualizacion">
                        Última actualización: {formatearFecha(proyecto.fechaUltimaActualizacion)}
                    </span>
                    <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
                </footer>
            </div>
        </div>
    );
}

export default ProyectoModal;
