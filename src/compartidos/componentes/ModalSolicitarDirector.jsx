import { useState, useEffect } from 'react';
import { notificacionesService } from '../../services/api';
import './ModalSolicitarDirector.css';

function ModalSolicitarDirector({ proyecto, usuario, onCerrar, onDirectorInvitado }) {
    const [directores, setDirectores] = useState([]);
    const [directorSeleccionado, setDirectorSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(false);
    const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);

    useEffect(() => {
        cargarDirectores();
    }, []);

    const cargarDirectores = async () => {
        setCargando(true);
        try {
            const data = await notificacionesService.listarTodosLosDirectores();
            setDirectores(data);
        } catch (error) {
            console.error('Error al cargar directores:', error);
            alert('Error al cargar la lista de directores');
        } finally {
            setCargando(false);
        }
    };

    const handleBuscar = async () => {
        if (!busqueda.trim()) {
            cargarDirectores();
            return;
        }

        setCargando(true);
        try {
            const data = await notificacionesService.buscarDirectores(busqueda);
            setDirectores(data);
            if (data.length === 0) {
                alert('No se encontraron directores con ese criterio de búsqueda');
            }
        } catch (error) {
            console.error('Error al buscar:', error);
            alert('Error al buscar directores');
        } finally {
            setCargando(false);
        }
    };

    const handleSeleccionarDirector = (director) => {
        // Si ya está seleccionado, deseleccionar
        if (directorSeleccionado?.cedula === director.cedula) {
            setDirectorSeleccionado(null);
        } else {
            setDirectorSeleccionado(director);
        }
    };

    const handleEnviarInvitacion = async () => {
        if (!directorSeleccionado) {
            alert('Selecciona un director primero');
            return;
        }

        setEnviandoInvitacion(true);
        try {
            const payload = {
                proyectoId: proyecto.id,
                directorCedula: directorSeleccionado.cedula,
                tipoDirector: directorSeleccionado.tipoDirector,
                cedulaEstudiante: usuario.cedula
            };
            console.log('📤 Enviando invitación:', payload);
            
            await notificacionesService.enviarInvitacionDirector(payload);
            
            alert('✓ Invitación enviada correctamente');
            onDirectorInvitado();
            onCerrar();
        } catch (error) {
            console.error('❌ Error al enviar invitación:', error);
            alert('Error: ' + error.message);
        } finally {
            setEnviandoInvitacion(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleBuscar();
        }
    };

    return (
        <>
            <div className="modal-overlay" onClick={onCerrar}></div>
            <div className="modal-solicitar-director">
                <div className="modal-header-director">
                    <h2>🎓 Solicitar Director</h2>
                    <button className="btn-cerrar" onClick={onCerrar}>✕</button>
                </div>

                <div className="modal-body-director">
                    <p className="descripcion-director">
                        Busca y selecciona un profesor o director externo para que dirija tu proyecto:
                        <strong> {proyecto.titulo}</strong>
                    </p>

                    <div className="busqueda-director">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o especialidad..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={cargando}
                        />
                        <button 
                            onClick={handleBuscar}
                            disabled={cargando}
                            className="btn-buscar-director"
                        >
                            {cargando ? '🔍 Buscando...' : '🔍 Buscar'}
                        </button>
                        <button 
                            onClick={cargarDirectores}
                            disabled={cargando}
                            className="btn-listar-todos"
                        >
                            📋 Ver todos
                        </button>
                    </div>

                    {directorSeleccionado && (
                        <div className="director-seleccionado-info">
                            <div className="info-contenido">
                                <span className="label-seleccionado">✓ Seleccionado:</span>
                                <span className="nombre-seleccionado">{directorSeleccionado.nombre}</span>
                                <span className="especialidad-seleccionado">
                                    {directorSeleccionado.especialidad}
                                </span>
                            </div>
                            <button 
                                className="btn-deseleccionar"
                                onClick={() => setDirectorSeleccionado(null)}
                                title="Quitar selección"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <div className="lista-directores">
                        {cargando ? (
                            <div className="loading-directores">
                                <div className="spinner"></div>
                                <p>Cargando directores...</p>
                            </div>
                        ) : directores.length === 0 ? (
                            <div className="no-resultados">
                                <p>📭 No se encontraron directores</p>
                            </div>
                        ) : (
                            directores.map((director) => (
                                <DirectorCard
                                    key={director.cedula}
                                    director={director}
                                    seleccionado={directorSeleccionado?.cedula === director.cedula}
                                    onSeleccionar={() => handleSeleccionarDirector(director)}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="modal-footer-director">
                    <button 
                        className="btn-cancelar-director" 
                        onClick={onCerrar}
                        disabled={enviandoInvitacion}
                    >
                        Cancelar
                    </button>
                    <button 
                        className="btn-invitar-director" 
                        onClick={handleEnviarInvitacion}
                        disabled={!directorSeleccionado || enviandoInvitacion}
                    >
                        {enviandoInvitacion ? '📤 Enviando...' : '📤 Enviar Invitación'}
                    </button>
                </div>
            </div>
        </>
    );
}

function DirectorCard({ director, seleccionado, onSeleccionar }) {
    const iconoTipo = director.tipoDirector === 'PROFESOR' ? '👨‍🏫' : '🎯';
    
    return (
        <div 
            className={`director-card ${seleccionado ? 'seleccionado' : ''}`}
            onClick={onSeleccionar}
        >
            <div className="director-card-header">
                <span className="director-icono">{iconoTipo}</span>
                <div className="director-info">
                    <h4>{director.nombre}</h4>
                    <span className="director-tipo-badge">
                        {director.tipoDirector === 'PROFESOR' ? 'Profesor' : 'Director Externo'}
                    </span>
                </div>
                {seleccionado && <span className="check-seleccionado">✓</span>}
            </div>
            
            <div className="director-card-body">
                {director.tituloAcademico && (
                    <p className="director-titulo">
                        🎓 {director.tituloAcademico}
                    </p>
                )}
                {director.especialidad && (
                    <p className="director-especialidad">
                        💡 {director.especialidad}
                    </p>
                )}
                {director.tipoDirector === 'PROFESOR' && director.tipoProfesor && (
                    <span className="director-subtipo">
                        {director.tipoProfesor === 'PLANTA' ? '👔 Planta' : 
                         director.tipoProfesor === 'CATEDRATICO' ? '📚 Catedrático' : '⏰ Ocasional'}
                    </span>
                )}
                {director.tipoDirector === 'EXTERNO' && director.institucion && (
                    <p className="director-institucion">
                        🏛️ {director.institucion}
                    </p>
                )}
            </div>
        </div>
    );
}

export default ModalSolicitarDirector;
