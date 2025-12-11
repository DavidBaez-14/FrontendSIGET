import StatsCard from '../compartidos/componentes/StatsCard';
import TablaProyectos from '../compartidos/componentes/TablaProyectos';
import './DashboardUnificado.css';

/**
 * Dashboard para Administradores (Super Admin y Coordinadores de Programa)
 * - Super Admin: Ve todos los proyectos del sistema
 * - Coordinador: Ve solo proyectos de su programa académico
 */
function DashboardAdmin({ 
    usuario,
    adminInfo,
    proyectos, 
    loading, 
    error,
    stats,
    onCambiarEstado,
    onVerHistorial,
    onAgendarReunion,
    onVerDetalle
}) {
    const esSuperAdmin = usuario.esAdminGeneral;
    const esCoordinador = !usuario.esAdminGeneral;

    // Mapeo de códigos de programa
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

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando información administrativa...</p>
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
            {/* Header con información del admin */}
            <div className="dashboard-header admin-header">
                <div className="admin-info">
                    <h1>
                        <span className="saludo">Bienvenido,</span>
                        <span className="nombre">{usuario.nombre}</span>
                    </h1>
                    <div className="admin-badges">
                        <span className={`role-badge ${esSuperAdmin ? 'super-admin' : 'coordinador'}`}>
                            {esSuperAdmin ? '👑 Super Administrador' : '📋 Coordinador de Comité'}
                        </span>
                        {esCoordinador && adminInfo?.programaCodigo && (
                            <span className="programa-badge">
                                🎓 {obtenerNombrePrograma(adminInfo.programaCodigo)}
                            </span>
                        )}
                    </div>
                </div>
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

            {/* Tabla de proyectos */}
            <div className="proyectos-section">
                <div className="section-header">
                    <h2>
                        {esSuperAdmin ? '📊 Todos los Proyectos del Sistema' : '📊 Proyectos del Programa'}
                    </h2>
                    <p className="section-subtitle">
                        {esSuperAdmin 
                            ? 'Vista completa de todos los proyectos registrados'
                            : `Proyectos de ${adminInfo?.programaCodigo ? obtenerNombrePrograma(adminInfo.programaCodigo) : 'tu programa'}`
                        }
                    </p>
                </div>

                <TablaProyectos 
                    proyectos={proyectos}
                    rol="ADMINISTRADOR"
                    acciones={{
                        onCambiarEstado,
                        onVerHistorial,
                        onAgendarReunion,
                        onVerDetalle
                    }}
                />
            </div>
        </div>
    );
}

export default DashboardAdmin;
