import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificacionesService } from '../../services/api';
import { Bell } from 'lucide-react';
import './NotificacionesDropdown.css';

function NotificacionesDropdown() {
    const { usuario } = useAuth();
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        cargarNotificaciones();
        // Actualizar cada 30 segundos
        const interval = setInterval(cargarNotificaciones, 30000);
        return () => clearInterval(interval);
    }, [usuario.cedula]);

    const cargarNotificaciones = async () => {
        try {
            const [notifsData, contadorData] = await Promise.all([
                notificacionesService.obtenerNotificacionesPendientes(usuario.cedula),
                notificacionesService.contarNotificacionesNoLeidas(usuario.cedula)
            ]);
            setNotificaciones(notifsData);
            setNoLeidas(contadorData.noLeidas);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        }
    };

    const handleAceptarInvitacion = async (notificacion) => {
        setCargando(true);
        try {
            await notificacionesService.responderInvitacion(notificacion.id, 'ACEPTADA');
            await cargarNotificaciones();
            // Recargar página para actualizar el proyecto
            window.location.reload();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    const handleRechazarInvitacion = async (notificacion) => {
        setCargando(true);
        try {
            await notificacionesService.responderInvitacion(notificacion.id, 'RECHAZADA');
            await cargarNotificaciones();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    const handleAceptarInvitacionDireccion = async (notificacion) => {
        setCargando(true);
        try {
            await notificacionesService.responderInvitacionDirector(notificacion.id, 'ACEPTADA');
            await cargarNotificaciones();
            // Recargar página para actualizar el proyecto
            window.location.reload();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    const handleRechazarInvitacionDireccion = async (notificacion) => {
        setCargando(true);
        try {
            await notificacionesService.responderInvitacionDirector(notificacion.id, 'RECHAZADA');
            await cargarNotificaciones();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    const handleMarcarLeida = async (notificacion) => {
        try {
            await notificacionesService.marcarComoLeida(notificacion.id);
            await cargarNotificaciones();
        } catch (error) {
            console.error('Error al marcar como leída:', error);
        }
    };

    const toggleDropdown = () => {
        setMostrarDropdown(!mostrarDropdown);
    };

    return (
        <div className="notificaciones-container">
            <button 
                className="notificaciones-btn" 
                onClick={toggleDropdown}
                title="Notificaciones"
            >
                <Bell size={20} />
                {noLeidas > 0 && (
                    <span className="notificaciones-badge">{noLeidas}</span>
                )}
            </button>

            {mostrarDropdown && (
                <>
                    <div className="notificaciones-overlay" onClick={toggleDropdown}></div>
                    <div className="notificaciones-dropdown">
                        <div className="notificaciones-header">
                            <h3>Notificaciones</h3>
                            {noLeidas > 0 && (
                                <span className="notificaciones-contador">{noLeidas} nueva{noLeidas !== 1 ? 's' : ''}</span>
                            )}
                        </div>
                        
                        <div className="notificaciones-lista">
                            {notificaciones.length === 0 ? (
                                <div className="notificaciones-vacio">
                                    <Bell size={40} style={{ opacity: 0.3 }} />
                                    <p>No tienes notificaciones</p>
                                </div>
                            ) : (
                                notificaciones.map((notif) => (
                                    notif.tipo === 'INVITACION_PROYECTO' ? (
                                        <InvitacionCard 
                                            key={notif.id}
                                            notificacion={notif}
                                            onAceptar={() => handleAceptarInvitacion(notif)}
                                            onRechazar={() => handleRechazarInvitacion(notif)}
                                            cargando={cargando}
                                        />
                                    ) : notif.tipo === 'INVITACION_DIRECCION' ? (
                                        <InvitacionDireccionCard 
                                            key={notif.id}
                                            notificacion={notif}
                                            onAceptar={() => handleAceptarInvitacionDireccion(notif)}
                                            onRechazar={() => handleRechazarInvitacionDireccion(notif)}
                                            cargando={cargando}
                                        />
                                    ) : (
                                        <NotificacionCard 
                                            key={notif.id}
                                            notificacion={notif}
                                            onMarcarLeida={() => handleMarcarLeida(notif)}
                                        />
                                    )
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function InvitacionCard({ notificacion, onAceptar, onRechazar, cargando }) {
    const metadata = notificacion.metadata || {};

    return (
        <div className="notificacion-item invitacion-item">
            <div className="notificacion-icon invitacion-icon">👥</div>
            <div className="notificacion-contenido">
                <h4 className="notificacion-titulo">{notificacion.titulo}</h4>
                <p className="notificacion-proyecto">{metadata.tituloProyecto}</p>
                <p className="notificacion-mensaje">{notificacion.mensaje}</p>
                <div className="invitacion-acciones">
                    <button 
                        className="btn-aceptar" 
                        onClick={onAceptar}
                        disabled={cargando}
                    >
                        ✓ Aceptar
                    </button>
                    <button 
                        className="btn-rechazar" 
                        onClick={onRechazar}
                        disabled={cargando}
                    >
                        ✕ Rechazar
                    </button>
                </div>
            </div>
        </div>
    );
}

function NotificacionCard({ notificacion, onMarcarLeida }) {
    return (
        <div 
            className="notificacion-item"
            onClick={onMarcarLeida}
        >
            <div className="notificacion-icon">
                {notificacion.tipo === 'GENERAL' ? '📢' : '📄'}
            </div>
            <div className="notificacion-contenido">
                <h4 className="notificacion-titulo">{notificacion.titulo}</h4>
                <p className="notificacion-mensaje">{notificacion.mensaje}</p>
                <span className="notificacion-fecha">
                    {new Date(notificacion.fechaCreacion).toLocaleString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            </div>
        </div>
    );
}

function InvitacionDireccionCard({ notificacion, onAceptar, onRechazar, cargando }) {
    const metadata = notificacion.metadata || {};

    return (
        <div className="notificacion-item invitacion-item invitacion-direccion">
            <div className="notificacion-icon invitacion-icon">🎓</div>
            <div className="notificacion-contenido">
                <h4 className="notificacion-titulo">{notificacion.titulo}</h4>
                <p className="notificacion-proyecto">{metadata.tituloProyecto}</p>
                <p className="notificacion-mensaje">{notificacion.mensaje}</p>
                <div className="invitacion-acciones">
                    <button 
                        className="btn-aceptar" 
                        onClick={onAceptar}
                        disabled={cargando}
                    >
                        ✓ Aceptar
                    </button>
                    <button 
                        className="btn-rechazar" 
                        onClick={onRechazar}
                        disabled={cargando}
                    >
                        ✕ Rechazar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotificacionesDropdown;
