import { useState, useEffect } from 'react';
import ProyectoCard from '../proyectos/componentes/ProyectoCard';
import FormularioProyectoSimple from '../proyectos/componentes/FormularioProyectoSimple';
import ModalSolicitarDirector from '../compartidos/componentes/ModalSolicitarDirector';
import ModalSolicitarReunion from '../reuniones/ModalSolicitarReunion';
import ReunionCard from '../reuniones/ReunionCard';
import { notificacionesService, reunionesService } from '../services/api';
import './DashboardUnificado.css';

/**
 * Dashboard para Estudiantes
 * - Sin Proyecto: Empty State con botón para crear
 * - Con Proyecto: Vista completa con info, equipo, director y acciones
 */
function DashboardEstudiante({ 
    usuario,
    proyecto, 
    loading, 
    error,
    invitacionDirectorPendiente,
    onProyectoCreado,
    onDirectorInvitado,
    onCancelarInvitacionDirector,
    // onAgendarReunion, // Removido - DashboardEstudiante usa handleAbrirModalReunion local
    onVerHistorial,
    onVerDetalle,
    onRecargarDatos,
    vistaActiva = 'dashboard'
}) {
    // Estados para modales internos
    const [modalCrearProyecto, setModalCrearProyecto] = useState(false);
    const [modalSolicitarDirector, setModalSolicitarDirector] = useState(false);
    const [modalAgregarCompanero, setModalAgregarCompanero] = useState(false);
    const [modalSolicitarReunion, setModalSolicitarReunion] = useState(false);
    
    // Estados para reuniones
    const [reuniones, setReuniones] = useState([]);
    const [cargandoReuniones, setCargandoReuniones] = useState(false);
    const [receptorReunion, setReceptorReunion] = useState(null);
    
    // Estados para agregar compañero
    const [busquedaCompanero, setBusquedaCompanero] = useState('');
    const [companeroSeleccionado, setCompaneroSeleccionado] = useState(null);
    const [buscandoCompanero, setBuscandoCompanero] = useState(false);
    const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);
    const [errorBusqueda, setErrorBusqueda] = useState(null);

    // Handlers para agregar compañero
    const handleBuscarCompanero = async () => {
        if (!busquedaCompanero.trim()) {
            setErrorBusqueda('Por favor ingresa una cédula o código estudiantil');
            return;
        }

        setBuscandoCompanero(true);
        setErrorBusqueda(null);
        try {
            const data = await notificacionesService.buscarEstudiantePorCodigo(busquedaCompanero.trim());
            setCompaneroSeleccionado(data);
        } catch (error) {
            setErrorBusqueda(error.message || 'Error al buscar estudiante');
            setCompaneroSeleccionado(null);
        } finally {
            setBuscandoCompanero(false);
        }
    };

    const handleInvitarCompanero = async () => {
        if (!companeroSeleccionado) return;

        setEnviandoInvitacion(true);
        try {
            await notificacionesService.enviarInvitacion({
                proyectoId: proyecto.id,
                estudianteInvitadoCedula: companeroSeleccionado.cedula,
                invitanteCedula: usuario.cedula,
                invitanteNombre: usuario.nombre,
                tituloProyecto: proyecto.titulo
            });
            
            alert(`✅ Invitación enviada exitosamente a ${companeroSeleccionado.nombre}`);
            
            // Cerrar modal y resetear estados
            resetearModalCompanero();
            onRecargarDatos?.();
        } catch (error) {
            alert('❌ Error al enviar invitación: ' + (error.response?.data?.message || error.message));
        } finally {
            setEnviandoInvitacion(false);
        }
    };

    const resetearModalCompanero = () => {
        setModalAgregarCompanero(false);
        setBusquedaCompanero('');
        setCompaneroSeleccionado(null);
        setErrorBusqueda(null);
    };

    const cargarReuniones = async () => {
        console.log('🔄 Cargando reuniones para estudiante:', usuario.cedula);
        setCargandoReuniones(true);
        try {
            const response = await reunionesService.obtenerPorEstudiante(usuario.cedula);
            console.log('✅ Reuniones recibidas:', response);
            console.log('📊 Cantidad de reuniones:', response.data?.length || 0);
            setReuniones(response.data || []);
        } catch (error) {
            console.error('❌ Error al cargar reuniones:', error);
            alert('Error al cargar reuniones: ' + error.message);
        } finally {
            setCargandoReuniones(false);
        }
    };

    // Cargar reuniones cuando la vista es 'reuniones'
    useEffect(() => {
        if (vistaActiva === 'reuniones' && usuario?.cedula) {
            cargarReuniones();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vistaActiva, usuario]);

    const handleAbrirModalReunion = (proyectoParam = null) => {
        console.log('🔔 handleAbrirModalReunion llamado con proyecto:', proyectoParam);
        // Usar el proyecto pasado como parámetro o el proyecto del estado
        const proyectoActual = proyectoParam || proyecto;
        
        console.log('📋 Proyecto actual:', proyectoActual);
        
        if (!proyectoActual?.directorNombre) {
            console.warn('⚠️ No hay director asignado');
            alert('Necesitas tener un director asignado para solicitar reuniones');
            return;
        }
        // Obtener cédula del director desde el proyecto
        const directorCedula = proyectoActual.directorCedula || proyectoActual.directorProfesorCedula || proyectoActual.directorExternoCedula;
        console.log('👨‍🏫 Director:', directorCedula, proyectoActual.directorNombre);
        
        setReceptorReunion({
            cedula: directorCedula,
            nombre: proyectoActual.directorNombre
        });
        setModalSolicitarReunion(true);
        console.log('✅ Modal de reunión abierto');
    };

    const handleReunionSolicitada = () => {
        setModalSolicitarReunion(false);
        cargarReuniones();
    };

    const handleProyectoCreado = (nuevoProyecto) => {
        setModalCrearProyecto(false);
        onProyectoCreado?.(nuevoProyecto);
    };

    const handleDirectorInvitado = async () => {
        setModalSolicitarDirector(false);
        await onDirectorInvitado?.();
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando tu proyecto...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-container">
                    <p className="error-message">❌ {error}</p>
                </div>
            </div>
        );
    }

    // Vista de REUNIONES
    if (vistaActiva === 'reuniones') {
        if (!proyecto) {
            return (
                <div className="dashboard-container">
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>Necesitas un proyecto para gestionar reuniones</h3>
                        <p>Primero crea tu proyecto de grado para poder solicitar reuniones con tu director.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>
                        <span className="saludo">Mis Reuniones</span>
                    </h1>
                    <p className="subtitulo">Gestiona las reuniones con tu director</p>
                </div>

                {cargandoReuniones ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Cargando reuniones...</p>
                    </div>
                ) : reuniones.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <h3>No tienes reuniones programadas</h3>
                        <p>Solicita una reunión con tu director para discutir el avance de tu proyecto.</p>
                    </div>
                ) : (
                    <div className="reuniones-grid">
                        {reuniones.map((reunion) => (
                            <ReunionCard
                                key={reunion.id}
                                reunion={reunion}
                                usuario={usuario}
                                onReunionActualizada={cargarReuniones}
                            />
                        ))}
                    </div>
                )}

            </div>
        );
    }

    // Estado: SIN PROYECTO (Empty State)
    if (!proyecto) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header estudiante-header">
                    <h1>
                        <span className="saludo">Mi Dashboard</span>
                        <span className="nombre">{usuario.nombre}</span>
                    </h1>
                    <p className="subtitulo">Bienvenido al sistema de gestión de proyectos de grado</p>
                </div>

                <div className="empty-state-estudiante">
                    <div className="empty-state-icon-large">📚</div>
                    <h2>Aún no tienes un proyecto registrado</h2>
                    <p className="empty-state-description">
                        Crea tu proyecto de grado para comenzar. Podrás invitar compañeros y solicitar un director después.
                    </p>
                    <button 
                        className="btn-crear-proyecto-primary"
                        onClick={() => setModalCrearProyecto(true)}
                    >
                        ✨ Crear Mi Proyecto
                    </button>
                </div>

                {/* Modal crear proyecto */}
                {modalCrearProyecto && (
                    <FormularioProyectoSimple
                        cedulaEstudiante={usuario.cedula}
                        onClose={() => setModalCrearProyecto(false)}
                        onProyectoCreado={handleProyectoCreado}
                    />
                )}
            </div>
        );
    }

    // Estado: CON PROYECTO (Vista completa)
    return (
        <div className="dashboard-container">
            <div className="dashboard-header estudiante-header">
                <h1>
                    <span className="saludo">Mi Dashboard</span>
                    <span className="nombre">{usuario.nombre}</span>
                </h1>
                <p className="subtitulo">Visualiza el estado de tu proyecto de grado</p>
            </div>

            {/* Card del proyecto */}
            <div className="proyecto-estudiante-card">
                <ProyectoCard
                    proyecto={proyecto}
                    esEstudiante={true}
                    onAgendarReunion={handleAbrirModalReunion}
                    onVerHistorial={onVerHistorial}
                    onVerDetalle={onVerDetalle}
                />
            </div>

            {/* Sección de Director */}
            <div className="seccion-director">
                <h3>👨‍🏫 Director del Proyecto</h3>
                
                {!proyecto.directorNombre ? (
                    invitacionDirectorPendiente ? (
                        // Invitación pendiente
                        <div className="director-invitacion-pendiente">
                            <div className="invitacion-pendiente-icono">⏳</div>
                            <div className="invitacion-pendiente-contenido">
                                <p className="invitacion-pendiente-titulo">
                                    Invitación Enviada
                                </p>
                                <p className="invitacion-pendiente-texto">
                                    Has enviado una invitación a <strong>{invitacionDirectorPendiente.metadata?.directorNombre || 'un director'}</strong>
                                </p>
                                <p className="invitacion-pendiente-nota">
                                    💡 Espera su respuesta o cancela si deseas invitar a otro director
                                </p>
                            </div>
                            <button 
                                className="btn-cancelar-invitacion-director"
                                onClick={onCancelarInvitacionDirector}
                                title="Cancelar invitación"
                            >
                                <span>✕ Cancelar Invitación</span>
                            </button>
                        </div>
                    ) : (
                        // Sin director y sin invitación
                        <div className="director-sin-asignar">
                            <div className="director-sin-asignar-icono">🔍</div>
                            <p className="director-sin-asignar-texto">
                                Aún no tienes un director asignado
                            </p>
                            <button 
                                className="btn-solicitar-director"
                                onClick={() => setModalSolicitarDirector(true)}
                            >
                                <span>📨 Solicitar Director</span>
                            </button>
                            <p className="director-sin-asignar-nota">
                                💡 Busca un profesor o director externo para que dirija tu proyecto
                            </p>
                        </div>
                    )
                ) : (
                    // Director asignado
                    <div className="director-asignado">
                        <div className="director-asignado-avatar">
                            {proyecto.directorNombre.charAt(0)}
                        </div>
                        <div className="director-asignado-info">
                            <span className="director-asignado-nombre">
                                {proyecto.directorNombre}
                            </span>
                            <span className="director-asignado-tipo">
                                {proyecto.tipoDirector === 'PROFESOR' ? '👨‍🏫 Profesor' : '🎯 Director Externo'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Sección de Equipo */}
            <div className="equipo-trabajo-card">
                <div className="equipo-header">
                    <h3>👥 Equipo de Trabajo</h3>
                    <span className="equipo-contador">{proyecto.estudiantes?.length || 1}/3 integrantes</span>
                </div>
                
                <div className="equipo-lista">
                    {proyecto.estudiantes?.map((est, index) => (
                        <div key={est.cedula || index} className="equipo-miembro">
                            <div className="miembro-avatar">
                                {(est.nombres || est.nombre || 'U')?.charAt(0)}
                                {(est.apellidos || '')?.charAt(0)}
                            </div>
                            <div className="miembro-info">
                                <span className="miembro-nombre">
                                    {est.nombres || est.nombre || 'Nombre'} {est.apellidos || ''}
                                </span>
                                <span className="miembro-codigo">{est.codigo || est.cedula}</span>
                            </div>
                            {index === 0 && <span className="lider-badge">👑 Líder</span>}
                        </div>
                    )) || (
                        <div className="equipo-miembro">
                            <div className="miembro-avatar">
                                {usuario.nombre?.charAt(0)}
                            </div>
                            <div className="miembro-info">
                                <span className="miembro-nombre">{usuario.nombre}</span>
                                <span className="miembro-codigo">{usuario.cedula}</span>
                            </div>
                            <span className="lider-badge">👑 Líder</span>
                        </div>
                    )}
                    
                    {/* Slots vacíos para compañeros */}
                    {(proyecto.estudiantes?.length || 1) < 3 && (
                        <>
                            {[...Array(3 - (proyecto.estudiantes?.length || 1))].map((_, i) => (
                                <div 
                                    key={`slot-${i}`} 
                                    className="equipo-slot-vacio"
                                    onClick={() => setModalAgregarCompanero(true)}
                                >
                                    <div className="slot-icono">➕</div>
                                    <span>Agregar compañero</span>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {(proyecto.estudiantes?.length || 1) < 3 && (
                    <p className="equipo-nota">
                        💡 Puedes agregar hasta {3 - (proyecto.estudiantes?.length || 1)} compañero(s) más a tu proyecto
                    </p>
                )}
            </div>

            {/* Modal Solicitar Director */}
            {modalSolicitarDirector && (
                <ModalSolicitarDirector
                    proyecto={proyecto}
                    usuario={usuario}
                    onCerrar={() => setModalSolicitarDirector(false)}
                    onDirectorInvitado={handleDirectorInvitado}
                />
            )}

            {/* Modal Agregar Compañero */}
            {modalAgregarCompanero && (
                <div className="modal-overlay" onClick={resetearModalCompanero}>
                    <div className="modal-content modal-agregar-companero" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>👥 Agregar Compañero de Equipo</h2>
                            <button className="modal-close" onClick={resetearModalCompanero}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-descripcion">
                                Ingresa el código estudiantil para invitar a tu compañero a tu proyecto de grado.
                            </p>
                            
                            <div className="busqueda-companero">
                                <div className="form-group">
                                    <label>Código estudiantil</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Ej: 1151555"
                                            value={busquedaCompanero}
                                            onChange={(e) => {
                                                setBusquedaCompanero(e.target.value);
                                                setErrorBusqueda(null);
                                                setCompaneroSeleccionado(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !buscandoCompanero) {
                                                    handleBuscarCompanero();
                                                }
                                            }}
                                            className="input-busqueda"
                                            disabled={buscandoCompanero}
                                        />
                                        <button 
                                            className="btn-buscar"
                                            onClick={handleBuscarCompanero}
                                            disabled={buscandoCompanero || !busquedaCompanero}
                                        >
                                            {buscandoCompanero ? '🔍 Buscando...' : '🔍 Buscar'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Errores de búsqueda */}
                                {errorBusqueda && (
                                    <div className="error-busqueda">
                                        ⚠️ {errorBusqueda}
                                    </div>
                                )}
                                
                                {/* Resultado de búsqueda */}
                                {companeroSeleccionado && (
                                    <div className="resultados-busqueda">
                                        <div className="resultado-item seleccionado">
                                            <div className="resultado-avatar">
                                                {companeroSeleccionado.nombre ? 
                                                    companeroSeleccionado.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
                                                    : '??'}
                                            </div>
                                            <div className="resultado-info">
                                                <span className="resultado-nombre">{companeroSeleccionado.nombre || 'Nombre no disponible'}</span>
                                                <span className="resultado-codigo">Cédula: {companeroSeleccionado.cedula}</span>
                                                <span className="resultado-codigo">Código: {companeroSeleccionado.codigo}</span>
                                            </div>
                                            <span className="check-seleccion">✓</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="nota-info">
                                <span className="nota-icono">ℹ️</span>
                                <p>El estudiante recibirá una notificación y deberá aceptar unirse al proyecto.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-cancelar" 
                                onClick={resetearModalCompanero}
                                disabled={enviandoInvitacion}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="btn-confirmar"
                                disabled={!companeroSeleccionado || enviandoInvitacion}
                                onClick={handleInvitarCompanero}
                            >
                                {enviandoInvitacion ? '📨 Enviando...' : '📨 Enviar Invitación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Solicitar Reunión - Disponible para todas las vistas */}
            {modalSolicitarReunion && receptorReunion && proyecto && (
                <ModalSolicitarReunion
                    proyecto={proyecto}
                    usuario={usuario}
                    receptorCedula={receptorReunion.cedula}
                    receptorNombre={receptorReunion.nombre}
                    onCerrar={() => setModalSolicitarReunion(false)}
                    onReunionSolicitada={handleReunionSolicitada}
                />
            )}
        </div>
    );
}

export default DashboardEstudiante;
