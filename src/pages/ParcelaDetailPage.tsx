import { useParams } from 'react-router-dom';
import { useParcela } from '../features/parcelas/hooks/useParcela';
import { MiniMap } from '../features/parcelas/components/MiniMap';

export const ParcelaDetailPage = () => {
    // useParams nos da acceso a los parámetros de la URL, en este caso el :id
    const { id } = useParams<{ id: string }>();
    const { parcela, isLoading, error } = useParcela(id);

    if (isLoading) return <p>Cargando detalles de la parcela...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!parcela) return <p>Parcela no encontrada.</p>;

    return (
        <div>
            <h2>Detalle de la Parcela: {parcela.nombre}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div>
                    <h3>Datos</h3>
                    <p><strong>ID:</strong> {parcela.id}</p>
                    {/* <p><strong>Ref. Catastral:</strong> {parcela.referenciaCatastral || 'N/A'}</p>
                    <p><strong>Área:</strong> {parcela.areaMetrosCuadrados?.toFixed(2) || 'N/A'} m²</p> */}
                    <p><strong>Geometría (WKT):</strong></p>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#f0f0f0', padding: '0.5rem', borderRadius: '4px' }}>
                        {parcela.wktGeolocalizacion || 'No disponible'}
                    </pre>
                </div>
                <div>
                    <h3>Ubicación</h3>
                    {/* Reutilizamos el MiniMap pero lo hacemos más grande */}
                    <div style={{ height: '400px', width: '100%' }}>
                        <MiniMap wktGeometry={parcela.wktGeolocalizacion} />
                    </div>
                </div>
            </div>
        </div>
    );
};