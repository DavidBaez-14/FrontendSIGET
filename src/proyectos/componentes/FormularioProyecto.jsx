import { useState, useEffect } from 'react';
import { proyectosService, catalogosService, usuariosService } from '../../services/api';
import './FormularioProyecto.css';

function FormularioProyecto({ cedulaEstudiante, onClose, onProyectoCreado }) {
    const [paso, setPaso] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingCatalogos, setLoadingCatalogos] = useState(true);
    const [error, setError] = useState(null);
    
    // Catálogos
    const [modalidades, setModalidades] = useState([]);
    const [areas, setAreas] = useState([]);
    const [lineas, setLineas] = useState([]);
    const [lineasFiltradas, setLineasFiltradas] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);

    // Datos del formulario
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        objetivoGeneral: '',
        modalidadId: '',
        areaId: '',
        lineaInvestigacionId: '',
        tipoDirector: 'PROFESOR',
        directorCedula: '',
        estudiantesCedulas: []
    });

    // Búsqueda de estudiantes
    const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
    const [estudiantesFiltrados, setEstudiantesFiltrados] = useState([]);

    useEffect(() => {
        cargarCatalogos();
    }, []);

    useEffect(() => {
        if (formData.areaId) {
            const lineasDeArea = lineas.filter(l => l.areaInvestigacion?.id === parseInt(formData.areaId));
            setLineasFiltradas(lineasDeArea);
            setFormData(prev => ({ ...prev, lineaInvestigacionId: '' }));
        } else {
            setLineasFiltradas([]);
        }
    }, [formData.areaId, lineas]);

    useEffect(() => {
        if (busquedaEstudiante.length >= 2) {
            const filtrados = estudiantes.filter(e => 
                !formData.estudiantesCedulas.includes(e.cedula) &&
                e.cedula !== cedulaEstudiante &&
                (`${e.nombres} ${e.apellidos}`.toLowerCase().includes(busquedaEstudiante.toLowerCase()) ||
                 e.cedula.includes(busquedaEstudiante))
            );
            setEstudiantesFiltrados(filtrados.slice(0, 5));
        } else {
            setEstudiantesFiltrados([]);
        }
    }, [busquedaEstudiante, estudiantes, formData.estudiantesCedulas]);

    const cargarCatalogos = async () => {
        try {
            setLoadingCatalogos(true);
            const [modalidadesData, areasData, lineasData, profesoresData, estudiantesData] = await Promise.all([
                catalogosService.obtenerModalidades(),
                catalogosService.obtenerAreas(),
                catalogosService.obtenerLineas(),
                usuariosService.obtenerProfesores(),
                usuariosService.obtenerEstudiantes()
            ]);
            setModalidades(modalidadesData);
            setAreas(areasData);
            setLineas(lineasData);
            setProfesores(profesoresData);
            setEstudiantes(estudiantesData);
        } catch (err) {
            setError('Error al cargar los catálogos: ' + err.message);
        } finally {
            setLoadingCatalogos(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const agregarEstudiante = (estudiante) => {
        if (formData.estudiantesCedulas.length < 2) {
            setFormData(prev => ({
                ...prev,
                estudiantesCedulas: [...prev.estudiantesCedulas, estudiante.cedula]
            }));
            setBusquedaEstudiante('');
            setEstudiantesFiltrados([]);
        }
    };

    const removerEstudiante = (cedula) => {
        setFormData(prev => ({
            ...prev,
            estudiantesCedulas: prev.estudiantesCedulas.filter(c => c !== cedula)
        }));
    };

    const validarPaso = (numPaso) => {
        switch (numPaso) {
            case 1:
                return formData.titulo.trim() && formData.descripcion.trim() && formData.objetivoGeneral.trim();
            case 2:
                return formData.modalidadId && formData.lineaInvestigacionId;
            case 3:
                return formData.directorCedula;
            default:
                return true;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);
            
            const proyectoData = {
                titulo: formData.titulo,
                descripcion: formData.descripcion,
                objetivoGeneral: formData.objetivoGeneral,
                modalidadId: parseInt(formData.modalidadId),
                lineaInvestigacionId: parseInt(formData.lineaInvestigacionId),
                tipoDirector: formData.tipoDirector,
                directorCedula: formData.directorCedula,
                estudiantesCedulas: formData.estudiantesCedulas
            };

            const nuevoProyecto = await proyectosService.crearProyecto(cedulaEstudiante, proyectoData);
            onProyectoCreado(nuevoProyecto);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getEstudianteInfo = (cedula) => {
        return estudiantes.find(e => e.cedula === cedula);
    };

    if (loadingCatalogos) {
        return (
            <div className="modal-overlay">
                <div className="formulario-modal">
                    <div className="loading-catalogos">
                        <div className="loading-spinner"></div>
                        <p>Cargando formulario...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="formulario-modal">
                <button className="modal-close" onClick={onClose}>×</button>
                
                <div className="formulario-header">
                    <h2>Registrar Proyecto de Grado</h2>
                    <div className="pasos-indicador">
                        {[1, 2, 3, 4].map(num => (
                            <div 
                                key={num} 
                                className={`paso-dot ${paso >= num ? 'activo' : ''} ${paso === num ? 'actual' : ''}`}
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                    <div className="paso-titulo">
                        {paso === 1 && 'Información General'}
                        {paso === 2 && 'Modalidad y Línea'}
                        {paso === 3 && 'Director del Proyecto'}
                        {paso === 4 && 'Compañeros de Equipo'}
                    </div>
                </div>

                {error && (
                    <div className="formulario-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Paso 1: Información General */}
                    {paso === 1 && (
                        <div className="formulario-paso">
                            <div className="form-group">
                                <label htmlFor="titulo">Título del Proyecto *</label>
                                <input
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    placeholder="Ingresa el título de tu proyecto"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="descripcion">Descripción *</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    placeholder="Describe brevemente tu proyecto"
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="objetivoGeneral">Objetivo General *</label>
                                <textarea
                                    id="objetivoGeneral"
                                    name="objetivoGeneral"
                                    value={formData.objetivoGeneral}
                                    onChange={handleChange}
                                    placeholder="¿Cuál es el objetivo principal de tu proyecto?"
                                    rows="3"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Modalidad y Línea */}
                    {paso === 2 && (
                        <div className="formulario-paso">
                            <div className="form-group">
                                <label htmlFor="modalidadId">Modalidad de Grado *</label>
                                <select
                                    id="modalidadId"
                                    name="modalidadId"
                                    value={formData.modalidadId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Selecciona una modalidad</option>
                                    {modalidades.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.nombre?.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="areaId">Área de Investigación *</label>
                                <select
                                    id="areaId"
                                    name="areaId"
                                    value={formData.areaId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Selecciona un área</option>
                                    {areas.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="lineaInvestigacionId">Línea de Investigación *</label>
                                <select
                                    id="lineaInvestigacionId"
                                    name="lineaInvestigacionId"
                                    value={formData.lineaInvestigacionId}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.areaId}
                                >
                                    <option value="">
                                        {formData.areaId ? 'Selecciona una línea' : 'Primero selecciona un área'}
                                    </option>
                                    {lineasFiltradas.map(l => (
                                        <option key={l.id} value={l.id}>{l.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Paso 3: Director */}
                    {paso === 3 && (
                        <div className="formulario-paso">
                            <div className="form-group">
                                <label>Tipo de Director *</label>
                                <div className="radio-group">
                                    <label className={`radio-option ${formData.tipoDirector === 'PROFESOR' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="tipoDirector"
                                            value="PROFESOR"
                                            checked={formData.tipoDirector === 'PROFESOR'}
                                            onChange={handleChange}
                                        />
                                        <span className="radio-icon">👨‍🏫</span>
                                        <span>Profesor UFPS</span>
                                    </label>
                                    <label className={`radio-option ${formData.tipoDirector === 'EXTERNO' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="tipoDirector"
                                            value="EXTERNO"
                                            checked={formData.tipoDirector === 'EXTERNO'}
                                            onChange={handleChange}
                                        />
                                        <span className="radio-icon">🏢</span>
                                        <span>Director Externo</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="directorCedula">Selecciona el Director *</label>
                                <select
                                    id="directorCedula"
                                    name="directorCedula"
                                    value={formData.directorCedula}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Selecciona un director</option>
                                    {profesores.map(p => (
                                        <option key={p.cedula} value={p.cedula}>
                                            {p.nombres} {p.apellidos}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formData.directorCedula && (
                                <div className="director-preview">
                                    {(() => {
                                        const director = profesores.find(p => p.cedula === formData.directorCedula);
                                        return director ? (
                                            <>
                                                <div className="director-avatar">👨‍🏫</div>
                                                <div className="director-info">
                                                    <span className="director-nombre">{director.nombres} {director.apellidos}</span>
                                                    <span className="director-email">{director.email}</span>
                                                </div>
                                            </>
                                        ) : null;
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Paso 4: Compañeros */}
                    {paso === 4 && (
                        <div className="formulario-paso">
                            <div className="paso-info">
                                <span className="info-icon">💡</span>
                                <p>Puedes agregar hasta 2 compañeros a tu proyecto. Este paso es opcional.</p>
                            </div>

                            <div className="form-group">
                                <label>Buscar Compañeros</label>
                                <input
                                    type="text"
                                    value={busquedaEstudiante}
                                    onChange={(e) => setBusquedaEstudiante(e.target.value)}
                                    placeholder="Buscar por nombre o cédula..."
                                    disabled={formData.estudiantesCedulas.length >= 2}
                                />
                                
                                {estudiantesFiltrados.length > 0 && (
                                    <ul className="estudiantes-sugerencias">
                                        {estudiantesFiltrados.map(e => (
                                            <li key={e.cedula} onClick={() => agregarEstudiante(e)}>
                                                <span className="sugerencia-nombre">{e.nombres} {e.apellidos}</span>
                                                <span className="sugerencia-cedula">{e.cedula}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {formData.estudiantesCedulas.length > 0 && (
                                <div className="estudiantes-seleccionados">
                                    <label>Compañeros Agregados:</label>
                                    {formData.estudiantesCedulas.map(cedula => {
                                        const est = getEstudianteInfo(cedula);
                                        return (
                                            <div key={cedula} className="estudiante-chip">
                                                <span>{est?.nombres} {est?.apellidos}</span>
                                                <button type="button" onClick={() => removerEstudiante(cedula)}>×</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {formData.estudiantesCedulas.length === 0 && (
                                <div className="sin-compañeros">
                                    <span>👤</span>
                                    <p>No has agregado compañeros aún</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botones de navegación */}
                    <div className="formulario-acciones">
                        {paso > 1 && (
                            <button 
                                type="button" 
                                className="btn-anterior"
                                onClick={() => setPaso(paso - 1)}
                            >
                                ← Anterior
                            </button>
                        )}
                        
                        {paso < 4 ? (
                            <button 
                                type="button" 
                                className="btn-siguiente"
                                onClick={() => setPaso(paso + 1)}
                                disabled={!validarPaso(paso)}
                            >
                                Siguiente →
                            </button>
                        ) : (
                            <button 
                                type="submit" 
                                className="btn-enviar"
                                disabled={loading || !validarPaso(3)}
                            >
                                {loading ? 'Registrando...' : '✓ Registrar Proyecto'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FormularioProyecto;
