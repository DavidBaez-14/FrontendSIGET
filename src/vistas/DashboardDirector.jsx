import StatsCard from '../compartidos/componentes/StatsCard';
import TablaProyectos from '../compartidos/componentes/TablaProyectos';
import ProyectoCard from '../proyectos/componentes/ProyectoCard';
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
    onAgendarReunion,
    onVerDetalle
}) {
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
                                    onAgendarReunion={onAgendarReunion}
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
                                onAgendarReunion,
                                onVerDetalle
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default DashboardDirector;
