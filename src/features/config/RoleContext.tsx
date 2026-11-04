import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from '../auth/context/AuthContext';

export type UserRole =
  | 'ADMIN_GENERAL'
  | 'ADMIN_CHOPOS'
  | 'ADMIN_FORESTAL'
  | 'EMPRESA'
  | 'CONDUCTOR'
  | 'AGENTE_FORESTAL_OPERARIO'
  | 'DIOS';

export type PreviewRole = 'none' | 'CONDUCTOR' | 'agente';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  canViewAll: boolean;
  canManageAll: boolean;
  isAdminChopos: boolean;
  isAdminForestal: boolean;
  isAgenteForestal: boolean;
  isConductor: boolean;
  isEmpresa: boolean;
  conductorDni: string | null;
  setConductorDni: (dni: string | null) => void;
  previewAs: PreviewRole;
  setPreviewAs: (value: PreviewRole) => void;
  isDios: boolean;
}

export const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const auth = useContext(AuthContext);
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem('franky.role');
      if (savedRole) return savedRole as UserRole;
      const s = localStorage.getItem('franky.auth.user');
      if (s) {
        const u = JSON.parse(s) as { rol?: string };
        if (u?.rol) return u.rol as UserRole;
      }
    } catch {
      // ignore
    }
    return 'ADMIN_GENERAL';
  });

  const [conductorDniState, setConductorDniState] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('franky.conductor.dni');
      if (saved) return saved;
    } catch {
      // ignore
    }
    return null;
  });
  const [previewAs, setPreviewAsState] = useState<PreviewRole>(() => {
    try {
      const saved = localStorage.getItem('franky.previewAs');
      if (saved === 'CONDUCTOR' || saved === 'agente' || saved === 'none') return saved;
    } catch {
      // ignore
    }
    return 'none';
  });

  // Si el usuario se autentica, el rol sigue al usuario actual.
  useEffect(() => {
    const rol = auth?.user?.rol;
    if (rol) setRole(rol as UserRole);
  }, [auth?.user?.rol]);

  // Persistencia para recargas y navegacion directa.
  useEffect(() => {
    try {
      localStorage.setItem('franky.role', role);
    } catch {
      // ignore
    }
  }, [role]);

  const isDios = role === 'DIOS';

  // La vista previa solo aplica al super usuario.
  useEffect(() => {
    if (!isDios && previewAs !== 'none') {
      setPreviewAsState('none');
    }
  }, [isDios, previewAs]);

  useEffect(() => {
    try {
      localStorage.setItem('franky.previewAs', previewAs);
    } catch {
      // ignore
    }
  }, [previewAs]);

  useEffect(() => {
    try {
      if (conductorDniState) {
        localStorage.setItem('franky.conductor.dni', conductorDniState);
      } else {
        localStorage.removeItem('franky.conductor.dni');
      }
    } catch {
      // ignore
    }
  }, [conductorDniState]);

  const isConductor = role === 'CONDUCTOR' || (isDios && previewAs === 'CONDUCTOR');
  const isAgenteForestal = role === 'AGENTE_FORESTAL_OPERARIO' || (isDios && previewAs === 'agente');
  const canViewAll = role === 'ADMIN_GENERAL' || isDios;
  const canManageAll = canViewAll;
  const isAdminChopos = role === 'ADMIN_CHOPOS';
  const isAdminForestal = role === 'ADMIN_FORESTAL';
  const isEmpresa = role === 'EMPRESA';
  const conductorDni = isConductor ? conductorDniState : null;
  const setConductorDni = (dni: string | null) => setConductorDniState(dni);

  const setPreviewAs = (value: PreviewRole) => setPreviewAsState(value);

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        canViewAll,
        canManageAll,
        isAdminChopos,
        isAdminForestal,
        isAgenteForestal,
        isConductor,
        isEmpresa,
        conductorDni,
        setConductorDni,
        previewAs,
        setPreviewAs,
        isDios,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
};
