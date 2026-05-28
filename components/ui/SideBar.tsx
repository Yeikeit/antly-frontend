"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegChartBar, FaWallet, FaExchangeAlt, FaCog, FaPlus, FaChevronLeft, FaChevronRight, FaChartLine, FaSignOutAlt } from "react-icons/fa";
import { IconType } from "react-icons";

export type NavItem = {
  label: string;
  href: string;
  icon: IconType;
};

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: FaRegChartBar },
  { label: "Presupuesto", href: "/budget", icon: FaWallet },
  { label: "Transacciones", href: "/transactions", icon: FaExchangeAlt },
  { label: "Estadísticas", href: "/statistics", icon: FaChartLine },
  { label: "Configuración", href: "/settings", icon: FaCog },
];

type SideBarProps = {
  open?: boolean;
  onClose?: () => void;
  navItems?: NavItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
};

export default function SideBar({
  open = true,
  onClose,
  navItems = DEFAULT_NAV_ITEMS,
  collapsed = false,
  onToggleCollapse,
  onLogout,
}: SideBarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:static z-40 top-0 left-0 h-screen bg-white border-r border-slate-100
          flex flex-col justify-between shadow-md transition-all duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${collapsed ? "md:w-[72px]" : "w-64"}
        `}
        style={{ width: open ? "256px" : undefined }}
      >
        {/* Header: logo + collapse toggle */}
        <div className={`p-4 pt-16 md:pt-4 ${collapsed ? "md:px-3" : ""}`}>
          <div className={`mb-8 flex items-center ${collapsed ? "md:justify-center" : "gap-2"}`}>
            <span className="text-2xl text-[#0E7C8B] flex-shrink-0">
              <FaRegChartBar />
            </span>
            {!collapsed && (
              <span className="font-bold text-lg text-[#0E7C8B] whitespace-nowrap">Antly</span>
            )}
            {/* Collapse toggle — desktop only */}
            <button
              onClick={onToggleCollapse}
              className={`
                hidden md:flex items-center justify-center w-6 h-6 rounded-full
                bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors
                ${collapsed ? "ml-0 mt-1" : "ml-auto"}
              `}
              aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {collapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors
                    ${collapsed ? "md:justify-center md:px-2" : ""}
                    ${
                      active
                        ? "bg-[#e6f7fa] text-[#0E7C8B]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#0E7C8B]"
                    }
                  `}
                >
                  <Icon className="flex-shrink-0" size={16} />
                  {!collapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                  {/* Mobile always shows label */}
                  {collapsed && (
                    <span className="whitespace-nowrap md:hidden">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer CTA */}
        <div className={`p-4 flex flex-col gap-2 ${collapsed ? "md:px-3" : ""}`}>
          <Link
            href="/transactions/new"
            onClick={onClose}
            title={collapsed ? "Agregar Transacción" : undefined}
            className={`
              flex items-center justify-center gap-2 bg-[#0E7C8B] text-white
              font-semibold py-3 rounded-xl hover:bg-[#0a6470] transition-colors text-sm w-full
              ${collapsed ? "md:px-0" : ""}
            `}
          >
            <FaPlus size={14} className="flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Agregar Transacción</span>}
            {collapsed && <span className="whitespace-nowrap md:hidden">Agregar Transacción</span>}
          </Link>

          {onLogout && (
            <button
              onClick={onLogout}
              title={collapsed ? "Cerrar sesión" : undefined}
              className={`
                hidden md:flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium w-full
                text-red-500 bg-red-50 border border-red-100
                hover:bg-red-100 hover:border-red-200 transition-colors text-sm
                ${collapsed ? "md:justify-center md:px-2" : ""}
              `}
            >
              <FaSignOutAlt size={14} className="flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">Cerrar sesión</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
