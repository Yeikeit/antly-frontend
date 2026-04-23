'use client';

interface DashboardHeaderProps {
  user?: {
    firstName?: string;
    lastName?: string;
  };
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <span className="dashboard-header-title">Antly</span>
      <div className="dashboard-header-content">
        <span className="dashboard-user-name">
          {user?.firstName} {user?.lastName}
        </span>
        <button onClick={onLogout} className="dashboard-logout-button">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
