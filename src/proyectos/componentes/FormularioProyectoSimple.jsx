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
                catalogosService.obtenerLineas()
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
                titulo: formData.titulo.trim(),
                descripcion: formData.descripcion.trim(),
                objetivoGeneral: formData.objetivoGeneral.trim(),
                modalidadId: parseInt(formData.modalidadId),
                lineaInvestigacionId: parseInt(formData.lineaInvestigacionId)
            };

            const nuevoProyecto = await proyectosService.crearProyecto(cedulaEstudiante, proyectoData);
            
            if (onProyectoCreado) {
                onProyectoCreado(nuevoProyecto);
            }
            
            if (onClose) {
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear el proyecto. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingCatalogos) {
        return (
            <div className="modal-overlay-simple">
                <div className="modal-simple">
                    <div className="modal-simple-loading">
                        <div className="spinner"></div>
                        <p>Cargando formulario...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay-simple" onClick={onClose}>
            <div className="modal-simple" onClick={(e) => e.stopPropagation()}>
                <div className="modal-simple-header">
                    <div>
                        <span className="header-icon">📝</span>
                        <h2>Crear Proyecto de Grado</h2>
                    </div>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-simple-instrucciones">
                    <p>Completa la información básica de tu proyecto. Más adelante podrás invitar compañeros y solicitar un director.</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-simple">
                    <div className="form-simple-group">
                        <label>
                            Título del Proyecto <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            placeholder="Ej: Sistema de gestión de proyectos de grado"
                            maxLength={300}
                            disabled={loading}
                        />
                        <small>{formData.titulo.length}/300 caracteres</small>
                    </div>

                    <div className="form-simple-group">
                        <label>
                            Descripción <span className="required">*</span>
                        </label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Describe brevemente de qué trata tu proyecto..."
                            rows={4}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-simple-group">
                        <label>
                            Objetivo General <span className="required">*</span>
                        </label>
                        <textarea
                            name="objetivoGeneral"
                            value={formData.objetivoGeneral}
                            onChange={handleChange}
                            placeholder="¿Qué buscas lograr con este proyecto?"
                            rows={3}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-simple-row">
                        <div className="form-simple-group">
                            <label>
                                Modalidad <span className="required">*</span>
                            </label>
                            <select
                                name="modalidadId"
                                value={formData.modalidadId}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Selecciona una modalidad</option>
                                {modalidades.map(mod => (
                                    <option key={mod.id} value={mod.id}>
                                        {mod.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-simple-group">
                            <label>
                                Línea de Investigación <span className="required">*</span>
                            </label>
                            <select
                                name="lineaInvestigacionId"
                                value={formData.lineaInvestigacionId}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Selecciona una línea</option>
                                {lineasInvestigacion.map(linea => (
                                    <option key={linea.id} value={linea.id}>
                                        {linea.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal-simple-footer">
                        <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <span>✨</span>
                                    Crear Proyecto
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
