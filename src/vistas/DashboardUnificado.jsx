import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TablaProyectos from '../compartidos/componentes/TablaProyectos';
import StatsCard from '../compartidos/componentes/StatsCard';
import ProyectoCard from '../proyectos/componentes/ProyectoCard';
import * as api from '../services/api';
import { historialService } from '../services/api';
import './DashboardUnificado.css';

// Mapeo de códigos de programa a nombres (según programas.sql)
const PROGRAMAS = {
    '111': 'Ingeniería Civil',
    '112': 'Ingeniería Mecánica',
    '115': 'Ingeniería de Sistemas',
    '116': 'Ingeniería Electrónica',
    '118': 'Ingeniería de Minas',
    '119': 'Ingeniería Electromecánica',
    '120': 'Ingeniería Industrial',
    '210': 'Administración de Empresas',
    '211': 'Contaduría Pública',
    '310': 'Derecho',
    '410': 'Enfermería',
    '411': 'Medicina',
    '510': 'Comunicación Social',
    '511': 'Trabajo Social',
    '610': 'Ingeniería Ambiental',
    '710': 'Lic. Matemáticas',
    '711': 'Lic. Informática',
    '712': 'Lic. Biología y Química',
    '713': 'Lic. Educación Física',
    '714': 'Lic. Lengua Castellana',
    '715': 'Lic. Lenguas Extranjeras',
    '810': 'Arquitectura',
    '910': 'Artes Plásticas',
    '1010': 'Economía',
    '1110': 'Zootecnia',
    '1210': 'Música',
    '1310': 'Biotecnología',
    '1410': 'Comunicación y Marketing Digital',
    '1510': 'Ingeniería Agroindustrial',
    '1610': 'Ingeniería de Software'
};

const obtenerNombrePrograma = (codigo) => PROGRAMAS[codigo] || `Programa ${codigo}`;

/**
 * Dashboard unificado que muestra contenido según el rol del usuario
 * @param {string} vistaActiva - 'dashboard' o 'proyectos' para determinar el layout
 */
function DashboardUnificado({ vistaActiva = 'dashboard' }) {
    const { usuario, esAdmin, esDirector, esEstudiante } = useAuth();
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminInfo, setAdminInfo] = useState(null);
    
    // Estados para modal de cambio de estado
    const [modalAbierto, setModalAbierto] = useState(false);
    const [proyectoParaCambio, setProyectoParaCambio] = useState(null);
    const [eventosCambioEstado, setEventosCambioEstado] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState('');
    const [descripcionEvento, setDescripcionEvento] = useState('');
    const [procesandoCambio, setProcesandoCambio] = useState(false);
    
    // Estados para modal de historial
    const [historialAbierto, setHistorialAbierto] = useState(false);
    const [proyectoParaHistorial, setProyectoParaHistorial] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);

    // Estado para modal de próximamente
    const [modalProximamente, setModalProximamente] = useState({ abierto: false, tipo: '' });

    // Estado para modal de agregar compañero
    const [modalAgregarCompanero, setModalAgregarCompanero] = useState(false);
    const [busquedaCompanero, setBusquedaCompanero] = useState('');
    const [companeroSeleccionado, setCompaneroSeleccionado] = useState(null);

    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuario]);

    const cargarDatos = async () => {
        setLoading(true);
        setError(null);
        try {
            if (esAdmin) {
                await cargarDatosAdmin();
            } else if (esDirector) {
                await cargarDatosDirector();
            } else if (esEstudiante) {
                await cargarDatosEstudiante();
            }
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error al cargar los datos. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const cargarDatosAdmin = async () => {
        const [proyectosData, infoData, eventosData] = await Promise.all([
            api.obtenerProyectosPorAdmin(usuario.cedula),
            api.obtenerInfoAdmin(usuario.cedula),
            historialService.obtenerEventosCambioEstado()
        ]);
        setProyectos(proyectosData);
        setAdminInfo(infoData);
        setEventosCambioEstado(eventosData);
    };

    const cargarDatosDirector = async () => {
        const data = await api.obtenerProyectosPorDirector(usuario.cedula);
        setProyectos(data);
    };

    const cargarDatosEstudiante = async () => {
        const data = await api.obtenerProyectosPorEstudiante(usuario.cedula);
        setProyectos(Array.isArray(data) ? data : [data].filter(Boolean));
    };

    // Funciones para modal de cambio de estado
    const abrirModalCambioEstado = (proyecto) => {
        setProyectoParaCambio(proyecto);
        setEventoSeleccionado('');
        setDescripcionEvento('');
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
            alert('Seleccione un evento para cambiar el estado');
            return;
        }

        try {
            setProcesandoCambio(true);
            await historialService.cambiarEstadoProyecto(
                proyectoParaCambio.id,
                parseInt(eventoSeleccionado),
                descripcionEvento,
                usuario.cedula
            );
            alert('Estado cambiado exitosamente');
            cerrarModal();
            cargarDatos(); // Recargar proyectos
        } catch (err) {
            alert('Error al cambiar estado: ' + err.message);
        } finally {
            setProcesandoCambio(false);
        }
    };

    // Funciones para modal de historial
    const abrirHistorial = async (proyecto) => {
        setProyectoParaHistorial(proyecto);
        setCargandoHistorial(true);
        setHistorialAbierto(true);
        try {
            const data = await historialService.obtenerHistorialProyecto(proyecto.id);
            setHistorial(data);
        } catch (err) {
            alert('Error al cargar historial: ' + err.message);
        } finally {
            setCargandoHistorial(false);
        }
    };

    const cerrarHistorial = () => {
        setHistorialAbierto(false);
        setHistorial([]);
        setProyectoParaHistorial(null);
    };

    // Funciones auxiliares de estilo
    const getEstadoClass = (estado) => {
        const clases = {
            'REGISTRADO': 'estado-registrado',
            'EN_REVISION_FORMATO': 'estado-revision',
            'CON_CORRECCIONES_FORMATO': 'estado-correcciones',
            'EN_REVISION_CONTENIDO': 'estado-revision',
            'CON_CORRECCIONES_CONTENIDO': 'estado-correcciones',
            'EN_REVISION_COMITE': 'estado-revision',
            'CON_OBSERVACIONES_COMITE': 'estado-correcciones',
            'APROBADO_INICIO': 'estado-aprobado',
            'EN_DESARROLLO': 'estado-desarrollo',
            'PRORROGA_SOLICITADA': 'estado-warning',
            'INFORME_PARCIAL_PRESENTADO': 'estado-info',
            'INFORME_FINAL_PRESENTADO': 'estado-info',
            'EN_REVISION_FINAL': 'estado-revision',
            'SUSTENTACION_PROGRAMADA': 'estado-info',
            'EN_SUSTENTACION': 'estado-desarrollo',
            'CERRADO': 'estado-cerrado',
            'FINALIZADO': 'estado-finalizado',
            'ARCHIVADO': 'estado-archivado',
            'CANCELADO': 'estado-cancelado',
            'RECHAZADO': 'estado-rechazado'
        };
        return clases[estado] || 'estado-default';
    };

    const getFaseClass = (fase) => {
        const clases = {
            'FORMULACION': 'fase-formulacion',
            'EVALUACION': 'fase-evaluacion',
            'APROBACION': 'fase-aprobacion',
            'EJECUCION': 'fase-ejecucion',
            'CIERRE': 'fase-cierre',
            'FINALIZACION': 'fase-finalizacion'
        };
        return clases[fase] || 'fase-default';
    };

    // Callbacks para acciones
    const handleCambiarEstado = (proyecto) => {
        abrirModalCambioEstado(proyecto);
    };

    const handleAgendarReunion = () => {
        setModalProximamente({ abierto: true, tipo: 'reunion' });
    };

    const handleVerHistorial = async (proyecto) => {
        abrirHistorial(proyecto);
    };

    const handleVerDetalle = () => {
        setModalProximamente({ abierto: true, tipo: 'detalle' });
    };

    const cerrarModalProximamente = () => {
        setModalProximamente({ abierto: false, tipo: '' });
    };

    const accionesCallbacks = {
        onCambiarEstado: handleCambiarEstado,
        onAgendarReunion: handleAgendarReunion,
        onVerHistorial: handleVerHistorial,
        onVerDetalle: handleVerDetalle
    };

    // Calcular estadísticas
    const calcularStats = () => {
        const total = proyectos.length;
        const enDesarrollo = proyectos.filter(p => 
            p.estado?.toLowerCase().includes('desarrollo') || 
            p.estado?.toLowerCase().includes('progreso')
        ).length;
        const enRevision = proyectos.filter(p => 
            p.estado?.toLowerCase().includes('revision')
        ).length;
        const completados = proyectos.filter(p => 
            p.estado?.toLowerCase().includes('completado') || 
            p.estado?.toLowerCase().includes('finalizado') ||
            p.estado?.toLowerCase().includes('aprobado')
        ).length;

        return { total, enDesarrollo, enRevision, completados };
    };

    const stats = calcularStats();

    const renderHeaderAdmin = () => (
        <div className="dashboard-header admin-header">
            <div className="admin-info">
                <h1>
                    <span className="saludo">Bienvenido,</span>
                    <span className="nombre">{usuario.nombre}</span>
                </h1>
                <div className="admin-badges">
                    <span className={`role-badge ${usuario.esAdminGeneral ? 'super-admin' : 'coordinador'}`}>
                        {usuario.esAdminGeneral ? '👑 Super Administrador' : '📋 Coordinador de Comité'}
                    </span>
                    {adminInfo?.programaCodigo && (
                        <span className="programa-badge">
                            🎓 {obtenerNombrePrograma(adminInfo.programaCodigo)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    const renderHeaderDirector = () => (
        <div className="dashboard-header director-header">
            <h1>
                <span className="saludo">Panel de Director</span>
                <span className="nombre">{usuario.nombre}</span>
            </h1>
            <p className="subtitulo">Gestiona los proyectos asignados a tu dirección</p>
        </div>
    );

    const renderHeaderEstudiante = () => (
        <div className="dashboard-header estudiante-header">
            <h1>
                <span className="saludo">Mi Dashboard</span>
                <span className="nombre">{usuario.nombre}</span>
            </h1>
            <p className="subtitulo">Visualiza el estado de tu proyecto de grado</p>
        </div>
    );

    const renderStats = () => (
        <div className="stats-grid">
            <StatsCard 
                titulo="Total Proyectos" 
                valor={stats.total} 
                icono="📁"
                color="#667eea"
            />
            <StatsCard 
                titulo="En Desarrollo" 
                valor={stats.enDesarrollo} 
                icono="🔨"
                color="#48bb78"
            />
            <StatsCard 
                titulo="En Revisión" 
                valor={stats.enRevision} 
                icono="👀"
                color="#ed8936"
            />
            <StatsCard 
                titulo="Completados" 
                valor={stats.completados} 
                icono="✅"
                color="#38b2ac"
            />
        </div>
    );

    // Render del contenido principal según rol
    const renderContenido = () => {
        if (error) {
            return (
                <div className="error-container">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                    <button onClick={cargarDatos} className="btn-reintentar">
                        Reintentar
                    </button>
                </div>
            );
        }

        // Estudiante sin proyecto: mostrar opción para crear
        if (esEstudiante && proyectos.length === 0) {
            return (
                <div className="sin-proyecto-container">
                    <div className="sin-proyecto-card">
                        <div className="sin-proyecto-icono">📚</div>
                        <h2>Aún no tienes un proyecto registrado</h2>
                        <p>Inicia tu proceso de grado registrando tu propuesta de proyecto</p>
                        <button 
                            className="btn-crear-proyecto"
                            onClick={() => setModalProximamente({ abierto: true, tipo: 'crearProyecto' })}
                        >
                            <span>➕</span> Registrar Proyecto
                        </button>
                    </div>
                    
                    <div className="info-cards-grid">
                        <div className="info-card">
                            <span className="info-card-icon">📋</span>
                            <h3>Requisitos</h3>
                            <p>Debes tener definido el título, objetivo y director para tu propuesta</p>
                        </div>
                        <div className="info-card">
                            <span className="info-card-icon">👥</span>
                            <h3>Compañeros</h3>
                            <p>Puedes agregar hasta 2 compañeros a tu proyecto</p>
                        </div>
                        <div className="info-card">
                            <span className="info-card-icon">📅</span>
                            <h3>Proceso</h3>
                            <p>Una vez registrado, será evaluado por el comité curricular</p>
                        </div>
                    </div>
                </div>
            );
        }

        // Estudiante con un solo proyecto: mostrar vista completa con equipo y documentos
        if (esEstudiante && proyectos.length === 1) {
            const proyecto = proyectos[0];
            return (
                <div className="estudiante-dashboard-grid">
                    {/* Columna izquierda: Proyecto + Equipo */}
                    <div className="estudiante-columna-principal">
                        <h2 className="seccion-titulo">Mi Proyecto de Grado</h2>
                        <ProyectoCard 
                            proyecto={proyecto} 
                            onVerDetalle={() => handleVerDetalle(proyecto)}
                            onVerHistorial={() => handleVerHistorial(proyecto)}
                            onAgendarReunion={() => handleAgendarReunion(proyecto)}
                            esEstudiante={true}
                        />
                        
                        {/* Sección de Equipo de Trabajo */}
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
                    </div>
                    
                    {/* Columna derecha: Documentos */}
                    <div className="estudiante-columna-documentos">
                        <div className="documentos-card">
                            <div className="documentos-header">
                                <h3>📄 Documentos del Proyecto</h3>
                            </div>
                            
                            <div className="documentos-lista">
                                <div className="documento-item documento-propuesta">
                                    <div className="documento-icono">📝</div>
                                    <div className="documento-info">
                                        <span className="documento-nombre">Propuesta de Proyecto</span>
                                        <span className="documento-estado estado-pendiente">Pendiente</span>
                                    </div>
                                    <button 
                                        className="btn-subir-doc"
                                        onClick={() => setModalProximamente({ abierto: true, tipo: 'documento' })}
                                    >
                                        Subir
                                    </button>
                                </div>
                                
                                <div className="documento-item documento-anteproyecto">
                                    <div className="documento-icono">📋</div>
                                    <div className="documento-info">
                                        <span className="documento-nombre">Anteproyecto</span>
                                        <span className="documento-estado estado-bloqueado">🔒 Bloqueado</span>
                                    </div>
                                    <button className="btn-subir-doc" disabled>
                                        Subir
                                    </button>
                                </div>
                                
                                <div className="documento-item documento-avance">
                                    <div className="documento-icono">📊</div>
                                    <div className="documento-info">
                                        <span className="documento-nombre">Informe de Avance</span>
                                        <span className="documento-estado estado-bloqueado">🔒 Bloqueado</span>
                                    </div>
                                    <button className="btn-subir-doc" disabled>
                                        Subir
                                    </button>
                                </div>
                                
                                <div className="documento-item documento-final">
                                    <div className="documento-icono">📚</div>
                                    <div className="documento-info">
                                        <span className="documento-nombre">Documento Final</span>
                                        <span className="documento-estado estado-bloqueado">🔒 Bloqueado</span>
                                    </div>
                                    <button className="btn-subir-doc" disabled>
                                        Subir
                                    </button>
                                </div>
                            </div>
                            
                            <div className="documentos-ayuda">
                                <span className="ayuda-icono">💡</span>
                                <p>Los documentos se desbloquean conforme avanza el estado de tu proyecto</p>
                            </div>
                        </div>
                        
                        {/* Card de próximas entregas */}
                        <div className="entregas-card">
                            <div className="entregas-header">
                                <h3>⏰ Próximas Entregas</h3>
                            </div>
                            <div className="entregas-lista">
                                <div className="entrega-item">
                                    <div className="entrega-fecha">
                                        <span className="fecha-dia">15</span>
                                        <span className="fecha-mes">DIC</span>
                                    </div>
                                    <div className="entrega-info">
                                        <span className="entrega-nombre">Propuesta de Proyecto</span>
                                        <span className="entrega-descripcion">Documento inicial con descripción</span>
                                    </div>
                                </div>
                            </div>
                            <p className="entregas-nota">📅 Las fechas se actualizan según el calendario académico</p>
                        </div>
                    </div>
                </div>
            );
        }

        // Director en vista Dashboard: mostrar cards
        if (esDirector && vistaActiva === 'dashboard') {
            return (
                <div className="proyectos-cards-container">
                    <h2 className="seccion-titulo">Proyectos Dirigidos</h2>
                    {proyectos.length === 0 ? (
                        <div className="sin-proyectos">
                            <span className="sin-proyectos-icon">📭</span>
                            <p>No tienes proyectos asignados actualmente</p>
                        </div>
                    ) : (
                        <div className="proyectos-cards-grid">
                            {proyectos.map((proyecto) => (
                                <ProyectoCard 
                                    key={proyecto.id}
                                    proyecto={proyecto}
                                    onVerDetalle={() => handleVerDetalle(proyecto)}
                                    onVerHistorial={() => handleVerHistorial(proyecto)}
                                    onAgendarReunion={() => handleAgendarReunion(proyecto)}
                                    esDirector={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Para admin, director (en vista proyectos) o estudiante con múltiples proyectos: tabla
        return (
            <div className="proyectos-tabla-container">
                <h2 className="seccion-titulo">
                    {esAdmin ? 'Proyectos del Programa' : esDirector ? 'Proyectos Dirigidos' : 'Mis Proyectos'}
                </h2>
                <TablaProyectos 
                    proyectos={proyectos}
                    rol={usuario.rol}
                    acciones={accionesCallbacks}
                    loading={loading}
                    mostrarPrograma={esAdmin}
                />
            </div>
        );
    };

    return (
        <div className="dashboard-unificado">
            {/* Header según rol */}
            {esAdmin && renderHeaderAdmin()}
            {esDirector && renderHeaderDirector()}
            {esEstudiante && renderHeaderEstudiante()}

            {/* Stats - solo para admin y director */}
            {(esAdmin || esDirector) && !loading && renderStats()}

            {/* Contenido principal */}
            {renderContenido()}

            {/* Modal de cambio de estado */}
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
                                    <span className={`estado-badge ${getEstadoClass(proyectoParaCambio.estado)}`}>
                                        {proyectoParaCambio.estado?.replace(/_/g, ' ')}
                                    </span>
                                </p>
                                <p>
                                    <strong>Fase actual:</strong>{' '}
                                    <span className={`fase-badge ${getFaseClass(proyectoParaCambio.fase)}`}>
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
                                                <p><strong>Descripción:</strong> {evento.descripcion}</p>
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
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancelar" onClick={cerrarModal}>
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

            {/* Modal de historial */}
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

            {/* Modal de Próximamente */}
            {modalProximamente.abierto && (
                <div className="modal-overlay" onClick={cerrarModalProximamente}>
                    <div className="modal-content modal-proximamente" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={cerrarModalProximamente}>×</button>
                        <div className="proximamente-content">
                            <span className="proximamente-icon">
                                {modalProximamente.tipo === 'reunion' ? '📅' : 
                                 modalProximamente.tipo === 'documento' ? '📄' : 
                                 modalProximamente.tipo === 'companero' ? '✉️' : 
                                 modalProximamente.tipo === 'crearProyecto' ? '📝' : '🔍'}
                            </span>
                            <h2>
                                {modalProximamente.tipo === 'reunion' 
                                    ? '¡Módulo de Reuniones!' 
                                    : modalProximamente.tipo === 'documento'
                                    ? '¡Gestión de Documentos!'
                                    : modalProximamente.tipo === 'companero'
                                    ? '¡Invitación Enviada!'
                                    : modalProximamente.tipo === 'crearProyecto'
                                    ? '¡Registro de Proyecto!'
                                    : '¡Vista Detallada!'}
                            </h2>
                            <p>
                                {modalProximamente.tipo === 'reunion'
                                    ? 'Próximamente podrás agendar y gestionar reuniones con tu director de tesis directamente desde esta plataforma.'
                                    : modalProximamente.tipo === 'documento'
                                    ? 'Próximamente podrás subir y gestionar todos los documentos de tu proyecto de grado desde esta plataforma.'
                                    : modalProximamente.tipo === 'companero'
                                    ? 'La invitación será enviada al estudiante seleccionado. Esta funcionalidad estará disponible próximamente.'
                                    : modalProximamente.tipo === 'crearProyecto'
                                    ? 'El formulario de registro de proyectos estará disponible próximamente. Podrás registrar tu propuesta con todos los datos necesarios.'
                                    : 'Próximamente podrás ver todos los detalles de tu proyecto en una vista expandida.'}
                            </p>
                            <div className="proximamente-features">
                                {modalProximamente.tipo === 'reunion' ? (
                                    <>
                                        <span>✨ Programar reuniones</span>
                                        <span>✨ Recibir notificaciones</span>
                                        <span>✨ Historial de reuniones</span>
                                    </>
                                ) : modalProximamente.tipo === 'documento' ? (
                                    <>
                                        <span>✨ Subir documentos PDF</span>
                                        <span>✨ Control de versiones</span>
                                        <span>✨ Revisiones del director</span>
                                    </>
                                ) : modalProximamente.tipo === 'companero' ? (
                                    <>
                                        <span>✨ Invitaciones por correo</span>
                                        <span>✨ Confirmación automática</span>
                                        <span>✨ Gestión de equipos</span>
                                    </>
                                ) : modalProximamente.tipo === 'crearProyecto' ? (
                                    <>
                                        <span>✨ Título y descripción</span>
                                        <span>✨ Selección de director</span>
                                        <span>✨ Línea de investigación</span>
                                        <span>✨ Agregar compañeros</span>
                                    </>
                                ) : (
                                    <>
                                        <span>✨ Información completa</span>
                                        <span>✨ Documentos adjuntos</span>
                                        <span>✨ Timeline del proyecto</span>
                                    </>
                                )}
                            </div>
                            <button className="btn-entendido" onClick={cerrarModalProximamente}>
                                ¡Entendido!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Agregar Compañero */}
            {modalAgregarCompanero && (
                <div className="modal-overlay" onClick={() => setModalAgregarCompanero(false)}>
                    <div className="modal-content modal-agregar-companero" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>👥 Agregar Compañero de Equipo</h2>
                            <button className="modal-close" onClick={() => setModalAgregarCompanero(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-descripcion">
                                Busca a tu compañero por nombre o código estudiantil para agregarlo al proyecto.
                            </p>
                            
                            <div className="busqueda-companero">
                                <div className="form-group">
                                    <label>Buscar estudiante</label>
                                    <input
                                        type="text"
                                        placeholder="Nombre o código del estudiante..."
                                        value={busquedaCompanero}
                                        onChange={(e) => setBusquedaCompanero(e.target.value)}
                                        className="input-busqueda"
                                    />
                                </div>
                                
                                {/* Resultados de búsqueda simulados */}
                                {busquedaCompanero.length >= 2 && (
                                    <div className="resultados-busqueda">
                                        <div 
                                            className={`resultado-item ${companeroSeleccionado?.codigo === '1151234' ? 'seleccionado' : ''}`}
                                            onClick={() => setCompaneroSeleccionado({ nombre: 'María García López', codigo: '1151234' })}
                                        >
                                            <div className="resultado-avatar">MG</div>
                                            <div className="resultado-info">
                                                <span className="resultado-nombre">María García López</span>
                                                <span className="resultado-codigo">Código: 1151234</span>
                                            </div>
                                            {companeroSeleccionado?.codigo === '1151234' && <span className="check-seleccion">✓</span>}
                                        </div>
                                        <div 
                                            className={`resultado-item ${companeroSeleccionado?.codigo === '1155678' ? 'seleccionado' : ''}`}
                                            onClick={() => setCompaneroSeleccionado({ nombre: 'Carlos Pérez Ruiz', codigo: '1155678' })}
                                        >
                                            <div className="resultado-avatar">CP</div>
                                            <div className="resultado-info">
                                                <span className="resultado-nombre">Carlos Pérez Ruiz</span>
                                                <span className="resultado-codigo">Código: 1155678</span>
                                            </div>
                                            {companeroSeleccionado?.codigo === '1155678' && <span className="check-seleccion">✓</span>}
                                        </div>
                                    </div>
                                )}
                                
                                {companeroSeleccionado && (
                                    <div className="companero-seleccionado-preview">
                                        <span>Seleccionado:</span>
                                        <strong>{companeroSeleccionado.nombre}</strong>
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
                                onClick={() => {
                                    setModalAgregarCompanero(false);
                                    setBusquedaCompanero('');
                                    setCompaneroSeleccionado(null);
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="btn-confirmar"
                                disabled={!companeroSeleccionado}
                                onClick={() => {
                                    setModalProximamente({ abierto: true, tipo: 'companero' });
                                    setModalAgregarCompanero(false);
                                    setBusquedaCompanero('');
                                    setCompaneroSeleccionado(null);
                                }}
                            >
                                Enviar Invitación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardUnificado;
