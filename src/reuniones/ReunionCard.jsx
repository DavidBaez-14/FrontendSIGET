import { useState } from 'react';
// import { reunionesService } from '../services/api'; // No se usa directamente aquí
import ModalRegistrarReunion from './ModalRegistrarReunion';
import './ReunionCard.css';

function ReunionCard({ 
    reunion, 
    usuario,
    onReunionActualizada 
}) {
    const [expandido, setExpandido] = useState(false);
    // const [procesando, setProcesando] = useState(false); // No se usa actualmente
    const [modalRegistrarAbierto, setModalRegistrarAbierto] = useState(false);

    // Formatear fecha y hora
    const formatearFechaHora = (fecha) => {
        if (!fecha) return 'No definida';
        const date = new Date(fecha);
        return date.toLocaleString('es-CO', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return null;
        const date = new Date(fecha);
        return date.toLocaleDateString('es-CO', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        });
    };

    // Determinar si es una reunión pasada (sin campo confirmada disponible)
    const ahora = new Date();
    const fechaReunion = reunion.fechaReunion ? new Date(reunion.fechaReunion) : null;
    const esPasada = fechaReunion && fechaReunion < ahora;
    const esPendiente = false; // Sin campo confirmada, asumimos todas confirmadas
    
    console.log('📅 ReunionCard:', {
        id: reunion.id,
        proyecto: reunion.proyectoTitulo,
        fecha: reunion.fechaReunion,
        esPasada,
        tipo: reunion.tipo
    });

    // Obtener icono del tipo
    const getTipoIcono = (tipo) => {
        const iconos = {
            'VIRTUAL': '💻',
            'PRESENCIAL': '🏢',
            'CORREO': '📧',
            'TELEFONICA': '📞'
        };
        return iconos[tipo] || '📅';
    };

    // Manejar cancelación
    // const handleCancelar = async () => {
    //     if (!confirm('¿Estás seguro de cancelar esta reunión?')) return;
    //     setProcesando(true);
    //     try {
    //         await reunionesService.cancelarReunion(reunion.id, usuario.cedula);
    //         alert('✓ Reunión cancelada exitosamente');
    //         onReunionActualizada && onReunionActualizada();
    //     } catch (error) {
    //         console.error('Error al cancelar:', error);
    //         alert('Error: ' + error.message);
    //     } finally {
    //         setProcesando(false);
    //     }
    // };

    // Marcar asistencia (el director marca si el estudiante asistió)
    // NOTA: Ahora se maneja desde ModalRegistrarReunion
    // const handleMarcarAsistencia = async (asistio) => {
    //     setProcesando(true);
    //     try {
    //         const payload = { 
    //             asistioEstudiante: asistio, 
    //             observaciones: null 
    //         };

    //         await reunionesService.marcarAsistencia(reunion.id, payload);
    //         alert(`✓ Asistencia marcada: El estudiante ${asistio ? 'asistió' : 'no asistió'}`);
    //         onReunionActualizada && onReunionActualizada();
    //     } catch (error) {
    //         console.error('Error al marcar asistencia:', error);
    //         alert('Error: ' + error.message);
    //     } finally {
    //         setProcesando(false);
    //     }
    // };

    return (
        <article className={`reunion-card ${esPendiente ? 'reunion-card--pendiente' : ''} ${esPasada ? 'reunion-card--pasada' : ''}`}>
            <div className="reunion-card__header">
                <div className="reunion-header-info">
                    <span className="reunion-tipo-icono">{getTipoIcono(reunion.tipo)}</span>
                    <div>
                        <h3 className="reunion-card__titulo">{reunion.proyectoTitulo}</h3>
                        <p className="reunion-card__subtitulo">
                            Reunión del proyecto
                        </p>
                    </div>
                </div>
                {esPasada ? (
                    <span className="reunion-badge reunion-badge--pasada">
                        ✓ Realizada
                    </span>
                ) : (
                    <span className="reunion-badge reunion-badge--confirmada">
                        📅 Programada
                    </span>
                )}
            </div>

            <div className="reunion-card__info">
                <div className="info-row">
                    <span className="info-label">📅 Fecha:</span>
                    <span className="info-value">{formatearFechaHora(reunion.fechaReunion)}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">⏱️ Duración:</span>
                    <span className="info-value">{reunion.duracionMinutos} minutos</span>
                </div>
                <div className="info-row">
                    <span className="info-label">{getTipoIcono(reunion.tipo)} Tipo:</span>
                    <span className="info-value">{reunion.tipo}</span>
                </div>
            </div>

            <div className="reunion-card__temas">
                <h4>📝 Temas a Tratar:</h4>
                <p>{reunion.temasTratados}</p>
            </div>

            {!esPendiente && reunion.acuerdos && (
                <div className="reunion-card__acuerdos">
                    <h4>✅ Acuerdos:</h4>
                    <p>{reunion.acuerdos}</p>
                </div>
            )}

            {reunion.proximaReunion && (
                <div className="reunion-card__proxima">
                    <span>🗓️ Próxima reunión programada: {formatearFecha(reunion.proximaReunion)}</span>
                </div>
            )}

            {expandido && reunion.observaciones && (
                <div className="reunion-card__observaciones">
                    <h4>💬 Observaciones:</h4>
                    <p>{reunion.observaciones}</p>
                </div>
            )}

            {!esPendiente && esPasada && (
                <div className="reunion-card__asistencia">
                    <div className="asistencia-info">
                        <span className={reunion.asistioEstudiante ? 'asistio-si' : 'asistio-no'}>
                            {reunion.asistioEstudiante ? '✅' : '❌'} Estudiante asistió
                        </span>
                    </div>
                </div>
            )}

            <div className="reunion-card__footer">
                <button 
                    className="btn-expandir"
                    onClick={() => setExpandido(!expandido)}
                >
                    {expandido ? '▲ Ver menos' : '▼ Ver más'}
                </button>

                {esPasada && (usuario.tipoUsuario === 'PROFESOR' || usuario.tipoUsuario === 'DIRECTOR_EXTERNO') && (
                    <div className="botones-asistencia">
                        <button 
                            className="btn-asistencia btn-registrar-detalles"
                            onClick={() => setModalRegistrarAbierto(true)}
                        >
                            📝 Registrar Detalles
                        </button>
                    </div>
                )}

                {/* Botón de cancelar removido - sin campo solicitanteCedula no podemos determinar quién solicitó */}
            </div>

            {/* Modal para registrar detalles */}
            {modalRegistrarAbierto && (
                <ModalRegistrarReunion
                    reunion={reunion}
                    onCerrar={() => setModalRegistrarAbierto(false)}
                    onReunionActualizada={onReunionActualizada}
                />
            )}
        </article>
    );
}

export default ReunionCard;
