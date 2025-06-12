import { useParcelas } from '../features/parcelas/hooks/useParcelas';

export const DashboardPage = () => {

  const { totalParcelas } = useParcelas();
  

  return (
    <div>

      {/* Mantenemos únicamente la sección de contadores */}
      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-value">{totalParcelas}</span>
          <span className="stat-label">Parcelas guardadas</span>
        </div>
        {/* Aquí podríamos añadir más tarjetas con otros contadores en el futuro */}
      </div>
      
    </div>
  );
};