import Link from "next/link";
import { FaRegChartBar, FaWallet, FaExchangeAlt, FaCog, FaPlus } from "react-icons/fa";

type SideBarProps = {
  open?: boolean;
  onClose?: () => void;
};

export default function SideBar({ open = true, onClose }: SideBarProps) {
  return (
    <aside
      className={`
        fixed md:static z-40 top-0 left-0 h-screen w-64 bg-white border-r flex flex-col justify-between shadow-md
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      <div className="p-6 pt-16 md:pt-6">
        {/* Logo y título */}
        <div className="mb-8 flex items-center gap-2">
          <span className="text-2xl text-[#0E7C8B]"><FaRegChartBar /></span>
          <div>
            <div className="font-bold text-lg text-[#0E7C8B]">Antly</div>
          </div>
        </div>
        {/* Navegación */}
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#e6f7fa] text-[#0E7C8B] font-medium transition">
            <FaRegChartBar /> Dashboard
          </Link>
          <Link href="/budget" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#e6f7fa] text-slate-700 transition">
            <FaWallet /> Presupuesto
          </Link>
          <Link href="/transactions" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#e6f7fa] text-slate-700 transition">
            <FaExchangeAlt /> Transacciones
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#e6f7fa] text-slate-700 transition">
            <FaCog /> Configuración
          </Link>
        </nav>
      </div>
      
      <div className="p-6">
        <Link href="/transactions/new" className="flex items-center justify-center gap-2 bg-[#0E7C8B] text-white font-semibold py-3 rounded-xl hover:bg-[#0a6470] transition-colors text-sm w-full">
          <FaPlus /> Agregar Transacción
        </Link>
      </div>
    </aside>
  );
}