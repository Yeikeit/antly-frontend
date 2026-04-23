'use client';

interface DashboardWelcomeProps {
  userName?: string;
}

export function DashboardWelcome({ userName }: DashboardWelcomeProps) {
  return (
    <div>
      <h1 className="dashboard-title">
        ¡Bienvenido{userName ? `, ${userName}` : ''}!
      </h1>
      <p className="dashboard-subtitle">
        El dashboard está en construcción.
      </p>
    </div>
  );
}
