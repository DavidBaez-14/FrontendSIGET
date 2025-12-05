import './StatsCard.css';

function StatsCard({ titulo, valor, icono, color = 'primary' }) {
    // Si color es hexadecimal, usar estilo inline
    const esHex = color?.startsWith('#');
    
    const estiloCustom = esHex ? {
        '--stats-color': color,
        '--stats-bg': `${color}15`
    } : {};
    
    return (
        <div 
            className={`stats-card ${esHex ? 'stats-card--custom' : `stats-card--${color}`}`}
            style={estiloCustom}
        >
            <div className="stats-content">
                <span className="stats-title">{titulo}</span>
                <span className="stats-value">{valor}</span>
            </div>
            <div className="stats-icon">
                {icono}
            </div>
        </div>
    );
}

export default StatsCard;
