import { useState } from 'react';
import { reunionesService } from '../services/api';
import './ModalSolicitarReunion.css';

function ModalSolicitarReunion({ proyecto, usuario, receptorCedula, receptorNombre, onCerrar, onReunionSolicitada }) {
    const [formData, setFormData] = useState({
        fecha: '',
        hora: '',
        duracionMinutos: 60,
        tipo: 'VIRTUAL',
        temasPropuestos: '',
        observaciones: ''
    });
    const [enviando, setEnviando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.fecha || !formData.hora) {
            alert('Por favor completa la fecha y hora de la reunión');
            return;
        }

        if (!formData.temasPropuestos.trim()) {
            alert('Por favor ingresa los temas a tratar en la reunión');
            return;
        }

        // Combinar fecha y hora en formato LocalDateTime
        const fechaReunion = `${formData.fecha}T${formData.hora}:00`;

        setEnviando(true);
        try {
            const payload = {
                proyectoId: proyecto.id,
                solicitanteCedula: usuario.cedula,
                receptorCedula: receptorCedula,
                fechaReunion: fechaReunion,
                duracionMinutos: parseInt(formData.duracionMinutos),
                tipo: formData.tipo,
                temasPropuestos: formData.temasPropuestos,
                observaciones: formData.observaciones || null
            };

            console.log('📤 Enviando solicitud de reunión:', payload);
            
            const response = await reunionesService.solicitarReunion(payload);
            
            if (response.success) {
                alert('✓ Solicitud de reunión enviada correctamente');
                onReunionSolicitada && onReunionSolicitada();
                onCerrar();
            } else {
                alert('Error: ' + (response.message || 'No se pudo enviar la solicitud'));
            }
        } catch (error) {
            console.error('❌ Error al solicitar reunión:', error);
            alert('Error: ' + error.message);
        } finally {
            setEnviando(false);
        }
    };

    // Obtener fecha mínima (hoy)
    const getFechaMinima = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <>
            <div className="modal-overlay-reunion" onClick={onCerrar}></div>
            <div className="modal-reunion">
                <div className="modal-header-reunion">
                    <h2>📅 Solicitar Reunión</h2>
                    <button className="btn-cerrar-reunion" onClick={onCerrar}>✕</button>
                </div>

                <div className="modal-body-reunion">
                    <div className="info-reunion">
                        <p className="proyecto-info">
                            <strong>Proyecto:</strong> {proyecto.titulo}
                        </p>
                        <p className="receptor-info">
                            <strong>Para:</strong> {receptorNombre}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="form-reunion">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha *</label>
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    min={getFechaMinima()}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Hora *</label>
                                <input
                                    type="time"
                                    name="hora"
                                    value={formData.hora}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Duración (minutos) *</label>
                                <select
                                    name="duracionMinutos"
                                    value={formData.duracionMinutos}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="30">30 minutos</option>
                                    <option value="45">45 minutos</option>
                                    <option value="60">1 hora</option>
                                    <option value="90">1.5 horas</option>
                                    <option value="120">2 horas</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tipo de Reunión *</label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="VIRTUAL">💻 Virtual</option>
                                    <option value="PRESENCIAL">🏢 Presencial</option>
                                    <option value="CORREO">📧 Por Correo</option>
                                    <option value="TELEFONICA">📞 Telefónica</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Temas a Tratar *</label>
                            <textarea
                                name="temasPropuestos"
                                value={formData.temasPropuestos}
                                onChange={handleChange}
                                placeholder="Describe los temas que deseas discutir en la reunión..."
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Observaciones</label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                placeholder="Información adicional (opcional)"
                                rows="3"
                            />
                        </div>

                        <div className="modal-footer-reunion">
                            <button 
                                type="button" 
                                className="btn-cancelar-reunion"
                                onClick={onCerrar}
                                disabled={enviando}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn-enviar-reunion"
                                disabled={enviando}
                            >
                                {enviando ? '📤 Enviando...' : '📅 Enviar Solicitud'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ModalSolicitarReunion;
