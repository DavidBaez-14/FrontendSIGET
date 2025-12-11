import { useState, useEffect } from 'react';
import StatsCard from '../compartidos/componentes/StatsCard';
import TablaProyectos from '../compartidos/componentes/TablaProyectos';
import ProyectoCard from '../proyectos/componentes/ProyectoCard';
import ModalSolicitarReunion from '../reuniones/ModalSolicitarReunion';
import ReunionCard from '../reuniones/ReunionCard';
import { reunionesService } from '../services/api';
import './DashboardUnificado.css';

/**
 * Dashboard para Directores (Profesores y Directores Externos)
 * - En vista 'dashboard': muestra cards con los proyectos
 * - En vista 'proyectos': muestra tabla completa
 */
function DashboardDirector({ 
    usuario,
    proyectos, 
    loading, 
    error,
    stats,
    vistaActiva = 'dashboard',
    onCambiarEstado,
    onVerHistorial,
    onVerDetalle
}) {
    // Estados para reuniones
    const [reuniones, setReuniones] = useState([]);
    const [cargandoReuniones, setCargandoReuniones] = useState(false);
    const [modalSolicitarReunion, setModalSolicitarReunion] = useState(false);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [receptorReunion, setReceptorReunion] = useState(null);

    const cargarReuniones = async () => {
        console.log('🔄 Cargando reuniones para director:', usuario.cedula);
        setCargandoReuniones(true);
        try {
            const response = await reunionesService.obtenerPorDirector(usuario.cedula);
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

    const handleAbrirModalReunion = (proyecto) => {
        console.log('🔔 Director: handleAbrirModalReunion llamado con proyecto:', proyecto);
        
        if (!proyecto.estudiantes || proyecto.estudiantes.length === 0) {
            console.warn('⚠️ Proyecto sin estudiantes');
            alert('Este proyecto no tiene estudiantes asignados');
            return;
        }
        const estudiantePrincipal = proyecto.estudiantes[0];
        console.log('👨‍🎓 Estudiante principal:', estudiantePrincipal);
        
        setProyectoSeleccionado(proyecto);
        setReceptorReunion({
            cedula: estudiantePrincipal.cedula,
            nombre: `${estudiantePrincipal.nombres || estudiantePrincipal.nombre} ${estudiantePrincipal.apellidos || ''}`
        });
        setModalSolicitarReunion(true);
        console.log('✅ Modal de reunión abierto para director');
    };

    const handleReunionSolicitada = () => {
        setModalSolicitarReunion(false);
        cargarReuniones();
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando tus proyectos dirigidos...</p>
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
        return (
            <div className="dashboard-container">
                <div className="dashboard-header director-header">
                    <h1>
                        <span className="saludo">Mis Reuniones</span>
                        <span className="nombre">{usuario.nombre}</span>
                    </h1>
                    <p className="subtitulo">Gestiona las reuniones con tus estudiantes</p>
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
                        <p>Las reuniones solicitadas por tus estudiantes aparecerán aquí.</p>
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

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header director-header">
                <h1>
                    <span className="saludo">Panel de Director</span>
                    <span className="nombre">{usuario.nombre}</span>
                </h1>
                <p className="subtitulo">Gestiona los proyectos asignados a tu dirección</p>
            </div>

            {/* Estadísticas */}
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

            {/* Vista Dashboard: Cards */}
            {vistaActiva === 'dashboard' && (
                <div className="proyectos-cards-container">
                    <div className="section-header">
                        <h2>📚 Mis Proyectos Dirigidos</h2>
                        <p className="section-subtitle">
                            Proyectos bajo tu dirección académica
                        </p>
                    </div>

                    {proyectos.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>No tienes proyectos asignados</h3>
                            <p>Aún no se te han asignado proyectos para dirigir.</p>
                        </div>
                    ) : (
                        <div className="proyectos-cards-grid">
                            {proyectos.map((proyecto) => (
                                <ProyectoCard 
                                    key={proyecto.id}
                                    proyecto={proyecto}
                                    onVerDetalle={onVerDetalle}
                                    onVerHistorial={onVerHistorial}
                                    onAgendarReunion={() => handleAbrirModalReunion(proyecto)}
                                    esDirector={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Vista Proyectos: Tabla */}
            {vistaActiva === 'proyectos' && (
                <div className="proyectos-section">
                    <div className="section-header">
                        <h2>📚 Mis Proyectos Dirigidos</h2>
                        <p className="section-subtitle">
                            Proyectos bajo tu dirección académica
                        </p>
                    </div>

                    {proyectos.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>No tienes proyectos asignados</h3>
                            <p>Aún no se te han asignado proyectos para dirigir.</p>
                        </div>
                    ) : (
                        <TablaProyectos 
                            proyectos={proyectos}
                            rol="DIRECTOR"
                            acciones={{
                                onCambiarEstado,
                                onVerHistorial,
                                onAgendarReunion: handleAbrirModalReunion,
                                onVerDetalle
                            }}
                        />
                    )}
                </div>
            )}

            {/* Modal Solicitar Reunión - Disponible para todas las vistas */}
            {modalSolicitarReunion && proyectoSeleccionado && receptorReunion && (
                <ModalSolicitarReunion
                    proyecto={proyectoSeleccionado}
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

export default DashboardDirector;
