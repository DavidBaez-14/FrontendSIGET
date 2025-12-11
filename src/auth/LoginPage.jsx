import { useState } from 'react';
import { FaUserShield, FaUserTie, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        cedula: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.cedula || !formData.password) {
            setError('Por favor ingrese cédula y contraseña');
            return;
        }

        setCargando(true);
        setError('');

        try {
            await login(formData.cedula, formData.password);
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Header */}
                <div className="login-header">
                    <div className="login-logo">
                        <div className="logo-box">SIGET UFPS</div>
                    </div>
                    <h2 className="login-title">Sistema de Gestión de Tesis</h2>
                    <p className="login-subtitle">Universidad Francisco de Paula Santander</p>
                </div>

                <h3 className="login-prompt">Ingresa tus datos para iniciar sesión</h3>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group-login">
                        <input
                            type="text"
                            name="cedula"
                            placeholder="Cédula"
                            value={formData.cedula}
                            onChange={handleChange}
                            disabled={cargando}
                            className="login-input"
                            autoComplete="username"
                        />
                        <span className="input-icon">👤</span>
                    </div>

                    <div className="form-group-login">
                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={cargando}
                            className="login-input"
                            autoComplete="current-password"
                        />
                        <span className="input-icon">🔒</span>
                    </div>

                    {error && (
                        <div className="login-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={cargando}
                    >
                        {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                {/* Tipos de Usuario */}
                <div className="user-types">
                    <div className="user-type-item">
                        <FaUserShield className="user-icon admin-icon" />
                        <span>Admin</span>
                    </div>
                    <div className="user-type-item">
                        <FaUserTie className="user-icon coord-icon" />
                        <span>Coord</span>
                    </div>
                    <div className="user-type-item">
                        <FaChalkboardTeacher className="user-icon director-icon" />
                        <span>Director</span>
                    </div>
                    <div className="user-type-item">
                        <FaUserGraduate className="user-icon student-icon" />
                        <span>Est</span>
                    </div>
                </div>

                {/* Nota de desarrollo */}
                <div className="login-dev-note">
                    <p><strong>Credenciales de prueba:</strong></p>
                    <p>Contraseña: <code>1234</code> (para todos los usuarios)</p>
                    <p>Admin General: <code>4000000001</code></p>
                    <p>Coordinadora: <code>4000000002</code></p>
                    <p>Director: <code>2000000760</code></p>
                    <p>Estudiante: <code>1000033333</code></p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
