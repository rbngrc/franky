import { Link, Outlet, useLocation } from 'react-router-dom';

export const ParcelasPage = () => {
  const { pathname } = useLocation();
  const esListado = pathname === '/parcelas/tabla';

  return (
    <div className="page-container">
      {esListado && (
        <div className="page-header">
          <p className="page-desc">Fincas, superficies y geolocalización</p>
          <Link to="/parcelas/nueva" className="btn btn-primary">
            + Nueva parcela
          </Link>
        </div>
      )}

      <Outlet />
    </div>
  );
};
