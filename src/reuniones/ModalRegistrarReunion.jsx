import { useState } from 'react';
import { reunionesService } from '../services/api';
import './ModalSolicitarReunion.css'; // Reutilizamos los estilos

function ModalRegistrarReunion({ reunion, onCerrar, onReunionActualizada }) {
    const [formData, setFormData] = useState({
        temasTratados: reunion.temasTratados || '',
        acuerdos: '',
        proximaReunion: '',
        asistioEstudiante: reunion.asistioEstudiante !== false, // Por defecto true
        observaciones: reunion.observaciones || ''
    });
    const [guardando, setGuardando] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setGuardando(true);
        try {
            const payload = {
                reunionId: reunion.id,
                temasTratados: formData.temasTratados,
                acuerdos: formData.acuerdos || null,
                proximaReunion: formData.proximaReunion || null,
                observaciones: formData.observaciones || null
            };

            console.log('📝 Registrando detalles de reunión:', payload);
            
            const response = await reunionesService.registrarDetallesReunion(payload);
            
            if (response.success) {
                // Marcar asistencia del estudiante
                await reunionesService.marcarAsistencia(reunion.id, {
                    asistioEstudiante: formData.asistioEstudiante,
                    observaciones: formData.observaciones || null
                });

                alert('✓ Detalles de reunión registrados correctamente');
                onReunionActualizada && onReunionActualizada();
                onCerrar();
            } else {
                alert('Error: ' + (response.message || 'No se pudieron registrar los detalles'));
            }
        } catch (error) {
            console.error('❌ Error al registrar detalles:', error);
            alert('Error: ' + error.message);
        } finally {
            setGuardando(false);
        }
    };

    // Formatear fecha para input date (no se usa actualmente pero puede ser útil)
    // const formatearFechaInput = (fecha) => {
    //     if (!fecha) return '';
    //     const date = new Date(fecha);
    //     return date.toISOString().split('T')[0];
    // };

    return (
        <>
            <div className="modal-overlay-reunion" onClick={onCerrar}></div>
            <div className="modal-reunion">
                <div className="modal-header-reunion">
                    <h2>📝 Registrar Detalles de Reunión</h2>
                    <button className="btn-cerrar-reunion" onClick={onCerrar}>✕</button>
                </div>

                <div className="modal-body-reunion">
                    <div className="info-reunion">
                        <p className="proyecto-info">
                            <strong>Proyecto:</strong> {reunion.proyectoTitulo}
                        </p>
                        <p className="receptor-info">
                            <strong>Fecha:</strong> {new Date(reunion.fechaReunion).toLocaleString('es-CO')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="form-reunion">
                        <div className="form-group full-width">
                            <label>Temas Tratados *</label>
                            <textarea
                                name="temasTratados"
                                value={formData.temasTratados}
                                onChange={handleChange}
                                placeholder="Describe los temas que se discutieron en la reunión..."
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Acuerdos</label>
                            <textarea
                                name="acuerdos"
                                value={formData.acuerdos}
                                onChange={handleChange}
                                placeholder="Acuerdos o compromisos establecidos..."
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Próxima Reunión</label>
                                <input
                                    type="date"
                                    name="proximaReunion"
                                    value={formData.proximaReunion}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="asistioEstudiante"
                                        checked={formData.asistioEstudiante}
                                        onChange={handleChange}
                                    />
                                    <span>✅ El estudiante asistió</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Observaciones</label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                placeholder="Observaciones adicionales..."
                                rows="3"
                            />
                        </div>

                        <div className="modal-footer-reunion">
                            <button 
                                type="button" 
                                className="btn-cancelar-reunion"
                                onClick={onCerrar}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn-enviar-reunion"
                                disabled={guardando}
                            >
                                {guardando ? '💾 Guardando...' : '💾 Guardar Detalles'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ModalRegistrarReunion;
