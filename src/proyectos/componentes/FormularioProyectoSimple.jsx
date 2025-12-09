import { useState, useEffect } from 'react';
import { proyectosService, catalogosService } from '../../services/api';
import './FormularioProyectoSimple.css';

/**
 * Formulario simplificado para crear proyectos
 * Solo requiere: título, descripción, objetivo, modalidad y línea de investigación
 * NO requiere director (se asignará después mediante invitación)
 */
function FormularioProyectoSimple({ cedulaEstudiante, onClose, onProyectoCreado }) {
    const [loading, setLoading] = useState(false);
    const [loadingCatalogos, setLoadingCatalogos] = useState(true);
    const [error, setError] = useState(null);
    
    // Catálogos
    const [modalidades, setModalidades] = useState([]);
    const [lineasInvestigacion, setLineasInvestigacion] = useState([]);

    // Datos del formulario
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        objetivoGeneral: '',
        modalidadId: '',
        lineaInvestigacionId: ''
    });

    useEffect(() => {
        cargarCatalogos();
    }, []);

    const cargarCatalogos = async () => {
        try {
            setLoadingCatalogos(true);
            const [modalidadesData, lineasData] = await Promise.all([
                catalogosService.obtenerModalidades(),
                catalogosService.obtenerLineasInvestigacion()
            ]);
            setModalidades(modalidadesData);
            setLineasInvestigacion(lineasData);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!formData.titulo.trim()) {
            setError('El título es obligatorio');
            return;
        }
        if (!formData.descripcion.trim()) {
            setError('La descripción es obligatoria');
            return;
        }
        if (!formData.objetivoGeneral.trim()) {
            setError('El objetivo general es obligatorio');
            return;
        }
        if (!formData.modalidadId) {
            setError('Debes seleccionar una modalidad');
            return;
        }
        if (!formData.lineaInvestigacionId) {
            setError('Debes seleccionar una línea de investigación');
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            const proyectoData = {
                titulo: formData.titulo,
                descripcion: formData.descripcion,
                objetivoGeneral: formData.objetivoGeneral,
                modalidadId: parseInt(formData.modalidadId),
                lineaInvestigacionId: parseInt(formData.lineaInvestigacionId)
            };

            const nuevoProyecto = await proyectosService.crearProyecto(cedulaEstudiante, proyectoData);
            onProyectoCreado(nuevoProyecto);
            onClose();
        } catch (err) {
            setError(err.message || 'Error al crear el proyecto');
        } finally {
            setLoading(false);
        }
    };

    if (loadingCatalogos) {
        return (
            <div className="modal-overlay">
                <div className="formulario-simple-modal">
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
            <div className="formulario-simple-modal">
                <button className="modal-close" onClick={onClose}>×</button>
                
                <div className="formulario-header">
                    <h2>🎓 Crear Proyecto de Grado</h2>
                    <p className="formulario-subtitle">
                        Completa la información básica de tu proyecto. Más adelante podrás invitar compañeros y solicitar un director.
                    </p>
                </div>

                {error && (
                    <div className="formulario-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="formulario-simple">
                    {/* Título */}
                    <div className="form-group">
                        <label htmlFor="titulo" className="form-label">
                            Título del Proyecto <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            placeholder="Ej: Sistema de gestión de proyectos de grado"
                            className="form-input"
                            maxLength={300}
                            required
                        />
                        <small className="form-hint">{formData.titulo.length}/300 caracteres</small>
                    </div>

                    {/* Descripción */}
                    <div className="form-group">
                        <label htmlFor="descripcion" className="form-label">
                            Descripción <span className="required">*</span>
                        </label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Describe brevemente de qué trata tu proyecto..."
                            className="form-textarea"
                            rows={4}
                            required
                        />
                    </div>

                    {/* Objetivo General */}
                    <div className="form-group">
                        <label htmlFor="objetivoGeneral" className="form-label">
                            Objetivo General <span className="required">*</span>
                        </label>
                        <textarea
                            id="objetivoGeneral"
                            name="objetivoGeneral"
                            value={formData.objetivoGeneral}
                            onChange={handleChange}
                            placeholder="¿Qué buscas lograr con este proyecto?"
                            className="form-textarea"
                            rows={3}
                            required
                        />
                    </div>

                    {/* Modalidad */}
                    <div className="form-group">
                        <label htmlFor="modalidadId" className="form-label">
                            Modalidad <span className="required">*</span>
                        </label>
                        <select
                            id="modalidadId"
                            name="modalidadId"
                            value={formData.modalidadId}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="">Selecciona una modalidad</option>
                            {modalidades.map(modalidad => (
                                <option key={modalidad.id} value={modalidad.id}>
                                    {modalidad.nombre}
                                </option>
                            ))}
                        </select>
                        {formData.modalidadId && (
                            <small className="form-info">
                                💡 {modalidades.find(m => m.id === parseInt(formData.modalidadId))?.descripcion}
                            </small>
                        )}
                    </div>

                    {/* Línea de Investigación */}
                    <div className="form-group">
                        <label htmlFor="lineaInvestigacionId" className="form-label">
                            Línea de Investigación <span className="required">*</span>
                        </label>
                        <select
                            id="lineaInvestigacionId"
                            name="lineaInvestigacionId"
                            value={formData.lineaInvestigacionId}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="">Selecciona una línea de investigación</option>
                            {lineasInvestigacion.map(linea => (
                                <option key={linea.id} value={linea.id}>
                                    {linea.nombre}
                                </option>
                            ))}
                        </select>
                        {formData.lineaInvestigacionId && (
                            <small className="form-info">
                                📊 {lineasInvestigacion.find(l => l.id === parseInt(formData.lineaInvestigacionId))?.descripcion}
                            </small>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="formulario-acciones">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-cancelar"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-crear"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    ✓ Crear Proyecto
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FormularioProyectoSimple;
