import React from "react";
import RaqeebLogo from "./RaqeebLogo";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  AlertTriangle, 
  RotateCcw, 
  MessageSquare, 
  FileSpreadsheet, 
  Settings, 
  DollarSign, 
  CheckSquare, 
  Unplug, 
  Layers,
  X,
  MessageCircle,
  ShoppingCart
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  storeName: string;
  isSalla: boolean;
  logout: () => void;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export default function Sidebar({ currentTab, setCurrentTab, storeName, isSalla, logout, isOpen, onClose, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "orders", label: "جميع الطلبات", icon: ShoppingBag },
    { id: "delayed", label: "شحنات متأخرة", icon: AlertTriangle },
    { id: "returns", label: "إدارة المرتجعات", icon: RotateCcw },
    { id: "abandoned_carts", label: "السلات المتروكة", icon: ShoppingCart },
    { id: "messages", label: "مركز الرسائل والواتساب", icon: MessageSquare },
    { id: "upload", label: "رفع ملف CSV", icon: FileSpreadsheet },
    { id: "settings", label: "إعدادات المتجر", icon: Settings },
    { id: "billing", label: "الاشتراكات والأسعار", icon: DollarSign },
  ];

  return (
    <div 
      id="sidebar-container" 
      className={`w-66 bg-white border-l border-slate-200/80 flex flex-col h-screen text-slate-600 fixed md:sticky top-0 right-0 z-50 shrink-0 shadow-[1px_0_10px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <RaqeebLogo size={36} />
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">رقيب</span>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose} 
            className="md:hidden p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <span className="text-xs text-emerald-600 font-semibold block mt-1 text-center">ندعمك لتنمو تجارتك</span>
      </div>

      {/* Connected Store Info */}
      <div className="px-4.5 py-4 m-4 bg-slate-50 rounded-2xl border border-slate-100/90 shadow-sm">
        <div className="text-[11px] text-slate-500 font-medium">المتجر المتصل:</div>
        <div className="font-bold text-slate-900 mt-1 text-sm truncate flex items-center gap-2">
          {storeName}
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isSalla ? "bg-emerald-500 shadow-md shadow-emerald-500/20" : "bg-amber-400 animate-pulse"}`} title={isSalla ? "موصل بسلة" : "وضع تجريبي"}></span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded-md border border-slate-100/60 w-fit">
          {isSalla ? "منصة سلة" : "وضع البيانات التجريبية"}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm text-right transition-all duration-200 cursor-pointer ${
                isActive 
                  ? "bg-emerald-50/80 text-emerald-700 font-bold border-r-4 border-emerald-500 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
              <span className="flex-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / User info */}
      <div className="p-4 border-t border-slate-100 flex flex-col gap-2 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs truncate max-w-[130px]">
            <p className="text-slate-900 font-bold">مرحباً، عبدالله</p>
            <p className="text-slate-400 text-[10px] truncate">alaisa3@gmail.com</p>
          </div>
          <button 
            id="logout-btn"
            onClick={logout}
            className="text-xs text-red-600 hover:text-white font-medium transition-all cursor-pointer py-1.5 px-3 rounded-lg hover:bg-red-600 hover:shadow-sm"
          >
            خروج
          </button>
        </div>

        {/* Legal Links */}
        <div className="flex justify-center gap-3 text-[10px] text-slate-400 border-t border-slate-100/60 pt-2.5 mt-1">
          <button 
            onClick={() => onNavigate && onNavigate("/privacy")} 
            className="hover:text-emerald-600 hover:underline cursor-pointer font-semibold transition-all"
          >
            سياسة الخصوصية
          </button>
          <span className="text-slate-300">•</span>
          <button 
            onClick={() => onNavigate && onNavigate("/terms")} 
            className="hover:text-emerald-600 hover:underline cursor-pointer font-semibold transition-all"
          >
            شروط الاستخدام
          </button>
        </div>
      </div>
    </div>
  );
}
