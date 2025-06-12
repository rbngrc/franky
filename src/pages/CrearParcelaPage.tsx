import { useState, useEffect } from 'react';
import type { Provincia, Municipio } from '../features/parcelas/types/ubicacion.types';
import { fetchProvincias, fetchMunicipios } from '../features/parcelas/api/ubicacionApiService';
// Más adelante importaremos el mapa y el formulario final aquí

export const CrearParcelaPage = () => {
    // Estados para las listas y las selecciones del usuario
    const [provincias, setProvincias] = useState<Provincia[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string>('');
    const [municipioSeleccionado, setMunicipioSeleccionado] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Cargar la lista de provincias cuando el componente se monta
    useEffect(() => {
        const cargarProvincias = async () => {
            const data = await fetchProvincias();
            setProvincias(data);
        };
        cargarProvincias();
    }, []);

    // Cargar la lista de municipios CADA VEZ que cambia la provincia seleccionada
    useEffect(() => {
        if (provinciaSeleccionada) {
            const cargarMunicipios = async () => {
                setIsLoading(true);
                const data = await fetchMunicipios(provinciaSeleccionada);
                setMunicipios(data);
                setIsLoading(false);
            };
            cargarMunicipios();
        } else {
            setMunicipios([]); // Limpiamos la lista si no hay provincia
        }
    }, [provinciaSeleccionada]);

    const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProvinciaSeleccionada(e.target.value);
        setMunicipioSeleccionado(''); // Reseteamos el municipio al cambiar de provincia
    };

    return (
        <div>
            <h3>Selección de Zona SIGPAC</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label>
                    Provincia:
                    <select value={provinciaSeleccionada} onChange={handleProvinciaChange}>
                        <option value="">-- Selecciona --</option>
                        {provincias.map((prov) => (
                            <option key={prov.codigo} value={prov.codigo}>
                                {prov.nombre}
                            </option>
                        ))}
                    </select>
                </label>
                
                {provinciaSeleccionada && (
                    <label>
                        Municipio:
                        <select 
                            value={municipioSeleccionado} 
                            onChange={(e) => setMunicipioSeleccionado(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">{isLoading ? 'Cargando...' : '-- Selecciona --'}</option>
                            {municipios.map((mun) => (
                                <option key={mun.codigo} value={mun.codigo}>
                                    {mun.nombre}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            <hr style={{ margin: '2rem 0' }} />

            {municipioSeleccionado && (
                <div>
                    <h4>Visor SIGPAC para el municipio seleccionado</h4>
                    <p>Aquí cargaremos el mapa con las parcelas de la provincia {provinciaSeleccionada} y el municipio {municipioSeleccionado}.</p>
                    {/* El siguiente paso será reemplazar este texto por el componente de mapa */}
                </div>
            )}
        </div>
    );
};