import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardAdmin from './DashboardAdmin';
import DashboardDirector from './DashboardDirector';
import DashboardEstudiante from './DashboardEstudiante';
import { proyectosService, historialService, notificacionesService, adminService } from '../services/api';
import './DashboardUnificado.css';

/**
 * CONTENEDOR PRINCIPAL - Dashboard Unificado
 * 
 * Responsabilidades:
 * - Detectar el rol del usuario autenticado
 * - Cargar datos según el rol (useEffect)
 * - Calcular estadísticas comunes
 * - Delegar el renderizado al componente hijo correcto
 * - Manejar modales compartidos (historial, cambio de estado)
 * 
 * Toggle de Vistas (Para Testing):
 * Puedes forzar una vista específica pasando vistaForzada como prop:
 * <DashboardUnificado vistaForzada="admin" />
 * <DashboardUnificado vistaForzada="director" />
 * <DashboardUnificado vistaForzada="estudiante" />
 */
function DashboardUnificado({ vistaForzada = null, vistaActiva = 'dashboard' }) {
    const { usuario, esAdmin, esDirector, esEstudiante } = useAuth();
    
    // Estados compartidos
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminInfo, setAdminInfo] = useState(null);
    const [invitacionDirectorPendiente, setInvitacionDirectorPendiente] = useState(null);
    
    // Estados para modales compartidos (Historial y Cambio de Estado)
    const [modalAbierto, setModalAbierto] = useState(false);
    const [proyectoParaCambio, setProyectoParaCambio] = useState(null);
    const [eventosCambioEstado, setEventosCambioEstado] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState('');
    const [descripcionEvento, setDescripcionEvento] = useState('');
    const [procesandoCambio, setProcesandoCambio] = useState(false);
    
    const [historialAbierto, setHistorialAbierto] = useState(false);
    const [proyectoParaHistorial, setProyectoParaHistorial] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);

    const [modalProximamente, setModalProximamente] = useState({ abierto: false, tipo: '' });

    // Determinar qué vista mostrar (con override para testing)
    const vistaActual = vistaForzada || (
        esAdmin ? 'admin' : 
        esDirector ? 'director' : 
        esEstudiante ? 'estudiante' : 
        null
    );

    useEffect(() => {
        cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario]);

    const cargarDatos = async () => {
        setLoading(true);
        setError(null);
        try {
            if (esAdmin || vistaForzada === 'admin') {
                await cargarDatosAdmin();
            } else if (esDirector || vistaForzada === 'director') {
                await cargarDatosDirector();
            } else if (esEstudiante || vistaForzada === 'estudiante') {
                await cargarDatosEstudiante();
            }
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError(err.message || 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const cargarDatosAdmin = async () => {
        const [proyectosData, infoAdmin, eventosData] = await Promise.all([
            proyectosService.obtenerProyectosPorAdmin(usuario.cedula),
            adminService.obtenerInfoAdmin(usuario.cedula),
            historialService.obtenerEventosCambioEstado()
        ]);
        setProyectos(proyectosData);
        setAdminInfo(infoAdmin);
        setEventosCambioEstado(eventosData);
    };

    const cargarDatosDirector = async () => {
        const proyectosData = await proyectosService.obtenerProyectosDirector(usuario.cedula);
        setProyectos(proyectosData);
    };

    const cargarDatosEstudiante = async () => {
        const proyectoData = await proyectosService.obtenerProyectoEstudiante(usuario.cedula);
        setProyectos(proyectoData ? [proyectoData] : []);
        
        // Cargar invitación pendiente si existe proyecto
        if (proyectoData?.id) {
            try {
                const invitacion = await notificacionesService.obtenerInvitacionPendienteProyecto(proyectoData.id);
                setInvitacionDirectorPendiente(invitacion);
            } catch (err) {
                console.error('Error cargando invitación pendiente:', err);
            }
        }
    };

    // ========================================
    // CALLBACKS COMPARTIDOS
    // ========================================

    const handleCambiarEstado = (proyecto) => {
        abrirModalCambioEstado(proyecto);
    };

    const handleAgendarReunion = () => {
        setModalProximamente({ abierto: true, tipo: 'reunion' });
    };

    const handleVerHistorial = async (proyecto) => {
        await abrirHistorial(proyecto);
    };

    const handleVerDetalle = () => {
        setModalProximamente({ abierto: true, tipo: 'detalle' });
    };

    const handleProyectoCreado = (nuevoProyecto) => {
        setProyectos([nuevoProyecto]);
    };

    const handleDirectorInvitado = async () => {
        await cargarDatosEstudiante();
    };

    const handleCancelarInvitacionDirector = async () => {
        if (!invitacionDirectorPendiente) return;
        
        const confirmar = window.confirm('¿Estás seguro de cancelar la invitación?');
        if (!confirmar) return;

        try {
            await notificacionesService.cancelarInvitacionDirector(invitacionDirectorPendiente.id);
            setInvitacionDirectorPendiente(null);
            alert('✅ Invitación cancelada correctamente');
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    };

    // ========================================
    // MODALES COMPARTIDOS (Historial y Cambio de Estado)
    // ========================================

    const abrirModalCambioEstado = (proyecto) => {
        setProyectoParaCambio(proyecto);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setProyectoParaCambio(null);
        setEventoSeleccionado('');
        setDescripcionEvento('');
    };

    const handleConfirmarCambioEstado = async () => {
        if (!eventoSeleccionado) {
            alert('Por favor selecciona un evento de cambio de estado');
            return;
        }

        setProcesandoCambio(true);
        try {
            await historialService.cambiarEstadoProyecto(
                proyectoParaCambio.id,
                parseInt(eventoSeleccionado),
                descripcionEvento,
                usuario.cedula
            );
            alert('✅ Estado cambiado exitosamente');
            cerrarModal();
            cargarDatos();
        } catch (error) {
            alert(`❌ Error al cambiar estado: ${error.message}`);
        } finally {
            setProcesandoCambio(false);
        }
    };

    const abrirHistorial = async (proyecto) => {
        setProyectoParaHistorial(proyecto);
        setHistorialAbierto(true);
        setCargandoHistorial(true);
        try {
            const historialData = await historialService.obtenerHistorialProyecto(proyecto.id);
            setHistorial(historialData);
        } catch (error) {
            console.error('Error al cargar historial:', error);
        } finally {
            setCargandoHistorial(false);
        }
    };

    const cerrarHistorial = () => {
        setHistorialAbierto(false);
        setProyectoParaHistorial(null);
        setHistorial([]);
    };

    const cerrarModalProximamente = () => {
        setModalProximamente({ abierto: false, tipo: '' });
    };

    // ========================================
    // CALCULAR ESTADÍSTICAS
    // ========================================

    const calcularStats = () => {
        const total = proyectos.length;
        const enDesarrollo = proyectos.filter(p => 
            p.estado === 'EN_DESARROLLO' || p.estado === 'APROBADO_INICIO'
        ).length;
        const enRevision = proyectos.filter(p => 
            p.estado === 'EN_REVISION_FORMATO' || 
            p.estado === 'EN_REVISION_CONTENIDO' ||
            p.estado === 'CON_CORRECCIONES_FORMATO' ||
            p.estado === 'CON_CORRECCIONES_CONTENIDO'
        ).length;
        const completados = proyectos.filter(p => 
            p.estado === 'FINALIZADO'
        ).length;

        return { total, enDesarrollo, enRevision, completados };
    };

    const stats = calcularStats();

    // ========================================
    // RENDERIZADO CON SWITCH DE VISTAS
    // ========================================

    // Props comunes para todos los dashboards
    const commonProps = {
        usuario,
        proyectos,
        loading,
        error,
        stats,
        onCambiarEstado: handleCambiarEstado,
        onVerHistorial: handleVerHistorial,
        onAgendarReunion: handleAgendarReunion,
        onVerDetalle: handleVerDetalle
    };

    // Switch de renderizado según rol o vista forzada
    switch (vistaActual) {
        case 'admin':
            return (
                <>
                    <DashboardAdmin
                        {...commonProps}
                        adminInfo={adminInfo}
                    />
                    {renderModalesCompartidos()}
                </>
            );

        case 'director':
            return (
                <>
                    <DashboardDirector {...commonProps} vistaActiva={vistaActiva} />
                    {renderModalesCompartidos()}
                </>
            );

        case 'estudiante':
            return (
                <>
                    <DashboardEstudiante
                        usuario={usuario}
                        proyecto={proyectos[0] || null}
                        loading={loading}
                        error={error}
                        invitacionDirectorPendiente={invitacionDirectorPendiente}
                        onProyectoCreado={handleProyectoCreado}
                        onDirectorInvitado={handleDirectorInvitado}
                        onCancelarInvitacionDirector={handleCancelarInvitacionDirector}
                        onAgendarReunion={handleAgendarReunion}
                        onVerHistorial={handleVerHistorial}
                        onVerDetalle={handleVerDetalle}
                        onRecargarDatos={cargarDatosEstudiante}
                    />
                    {renderModalesCompartidos()}
                </>
            );

        default:
            return (
                <div className="dashboard-container">
                    <div className="error-container">
                        <p className="error-message">❌ Rol de usuario no reconocido</p>
                    </div>
                </div>
            );
    }

    // ========================================
    // RENDER DE MODALES COMPARTIDOS
    // ========================================

    function renderModalesCompartidos() {
        return (
            <>
                {/* Modal de Cambio de Estado */}
                {modalAbierto && proyectoParaCambio && (
                    <div className="modal-overlay" onClick={cerrarModal}>
                        <div className="modal-content modal-cambio-estado" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Cambiar Estado del Proyecto</h2>
                                <button className="modal-close" onClick={cerrarModal}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="proyecto-info-modal">
                                    <p><strong>Proyecto:</strong> {proyectoParaCambio.titulo}</p>
                                    <p><strong>Código:</strong> {proyectoParaCambio.codigoProyecto}</p>
                                    <p>
                                        <strong>Estado actual:</strong>{' '}
                                        <span className={`estado-badge estado-${proyectoParaCambio.estado?.toLowerCase().replace(/_/g, '-')}`}>
                                            {proyectoParaCambio.estado?.replace(/_/g, ' ')}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Fase actual:</strong>{' '}
                                        <span className="fase-badge">
                                            {proyectoParaCambio.fase}
                                        </span>
                                    </p>
                                </div>
                                
                                <div className="form-group">
                                    <label>Seleccione el evento de cambio de estado:</label>
                                    <select 
                                        value={eventoSeleccionado} 
                                        onChange={(e) => setEventoSeleccionado(e.target.value)}
                                        className="select-evento"
                                        disabled={procesandoCambio}
                                    >
                                        <option value="">-- Seleccione un evento --</option>
                                        {eventosCambioEstado.map(evento => (
                                            <option key={evento.id} value={evento.id}>
                                                {evento.nombre} → {evento.estadoResultante?.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {eventoSeleccionado && (
                                    <div className="evento-detalle">
                                        {(() => {
                                            const evento = eventosCambioEstado.find(e => e.id === parseInt(eventoSeleccionado));
                                            return evento ? (
                                                <>
                                                    <p><strong>Categoría:</strong> {evento.categoria}</p>
                                                    <p><strong>Nuevo estado:</strong> {evento.estadoResultante?.replace(/_/g, ' ')}</p>
                                                    {evento.descripcion && <p><strong>Descripción:</strong> {evento.descripcion}</p>}
                                                </>
                                            ) : null;
                                        })()}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Descripción/Observaciones (opcional):</label>
                                    <textarea
                                        value={descripcionEvento}
                                        onChange={(e) => setDescripcionEvento(e.target.value)}
                                        placeholder="Ingrese una descripción o justificación del cambio..."
                                        rows={3}
                                        disabled={procesandoCambio}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-cancelar" onClick={cerrarModal} disabled={procesandoCambio}>
                                    Cancelar
                                </button>
                                <button 
                                    className="btn-confirmar" 
                                    onClick={handleConfirmarCambioEstado}
                                    disabled={!eventoSeleccionado || procesandoCambio}
                                >
                                    {procesandoCambio ? 'Procesando...' : 'Confirmar Cambio'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Historial */}
                {historialAbierto && proyectoParaHistorial && (
                    <div className="modal-overlay" onClick={cerrarHistorial}>
                        <div className="modal-content modal-historial" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Historial del Proyecto</h2>
                                <button className="modal-close" onClick={cerrarHistorial}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="proyecto-info-modal">
                                    <p><strong>Proyecto:</strong> {proyectoParaHistorial.titulo}</p>
                                    <p><strong>Código:</strong> {proyectoParaHistorial.codigoProyecto}</p>
                                </div>
                                
                                {cargandoHistorial ? (
                                    <div className="loading-historial">Cargando historial...</div>
                                ) : historial.length === 0 ? (
                                    <div className="sin-historial">Este proyecto no tiene eventos registrados en el historial.</div>
                                ) : (
                                    <div className="timeline">
                                        {historial.map((item, index) => (
                                            <div key={item.id || index} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <div className="timeline-header">
                                                        <span className="timeline-evento">{item.eventoNombre}</span>
                                                        <span className="timeline-categoria">{item.categoria}</span>
                                                    </div>
                                                    <p className="timeline-descripcion">{item.descripcion}</p>
                                                    <div className="timeline-footer">
                                                        <span className="timeline-fecha">
                                                            {new Date(item.fechaEvento).toLocaleString('es-CO')}
                                                        </span>
                                                        {item.usuarioResponsableNombre && (
                                                            <span className="timeline-usuario">
                                                                Por: {item.usuarioResponsableNombre}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn-cancelar" onClick={cerrarHistorial}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Próximamente */}
                {modalProximamente.abierto && (
                    <div className="modal-overlay" onClick={cerrarModalProximamente}>
                        <div className="modal-content modal-proximamente" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>🚧 Funcionalidad en Desarrollo</h2>
                                <button className="modal-close" onClick={cerrarModalProximamente}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="proximamente-icon">🔨</div>
                                <p>
                                    {modalProximamente.tipo === 'reunion' && 'La funcionalidad de agendar reuniones estará disponible próximamente.'}
                                    {modalProximamente.tipo === 'detalle' && 'La vista detallada del proyecto estará disponible próximamente.'}
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-entendido" onClick={cerrarModalProximamente}>
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
}

export default DashboardUnificado;
