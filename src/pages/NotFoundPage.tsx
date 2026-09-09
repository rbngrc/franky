import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div style={{
    padding: '4rem 1rem',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto'
  }}>
    <div style={{
      fontSize: '6rem',
      fontFamily: "'Bebas Neue', sans-serif",
      color: '#1565C0',
      lineHeight: 1,
      letterSpacing: '4px',
      marginBottom: '0.5rem'
    }}>
      404
    </div>
    <div style={{
      fontSize: '2rem',
      fontFamily: "'Bebas Neue', sans-serif",
      color: '#E53935',
      letterSpacing: '2px',
      marginBottom: '1rem'
    }}>
      ¡NO QUE NO ESTÁ, SUPER!
    </div>
    <p style={{
      fontSize: '1rem',
      color: '#546E7A',
      marginBottom: '2rem',
      lineHeight: 1.6
    }}>
      Esta página no existe... ¿seguro que no te la ha roto Franky a golpes?
    </p>
    <Link
      to="/"
      style={{
        padding: '0.75rem 2rem',
        background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 600,
        display: 'inline-block',
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 4px 15px rgba(21, 101, 192, 0.3)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(21, 101, 192, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      ★ Volver al inicio
    </Link>
  </div>
);
