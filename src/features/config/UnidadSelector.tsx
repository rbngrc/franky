import { useUnidad } from './UnidadContext';

export const UnidadSelector = () => {
  const { unidad, setUnidad } = useUnidad();
  return (
    <select
      value={unidad}
      onChange={(e) => setUnidad(e.target.value as 't' | 'm3')}
      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--color-border)', marginRight: 8 }}
    >
      <option value="t">t</option>
      <option value="m3">m³</option>
    </select>
  );
};
