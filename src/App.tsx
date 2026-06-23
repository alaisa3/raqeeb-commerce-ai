import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { 
  TrendingUp, 
  Clock, 
  RotateCcw, 
  AlertTriangle, 
  MessageSquare, 
  ChevronLeft, 
  Search, 
  RefreshCw, 
  Copy, 
  Check, 
  ArrowUpRight, 
  Plus, 
  HelpCircle, 
  Upload as UploadIcon,
  Filter,
  CheckCircle2,
  Lock,
  Globe,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar
} from "recharts";
import { Order, ReturnRequest, MessageTemplate, AgentTask, CustomerAlert } from "./types";

const delayedTrendData = [
  { day: "05/24", Aramex: 2, SMSA: 1, Naqel: 3, SPL: 1, Total: 7 },
  { day: "05/26", Aramex: 3, SMSA: 2, Naqel: 2, SPL: 0, Total: 7 },
  { day: "05/28", Aramex: 1, SMSA: 1, Naqel: 4, SPL: 2, Total: 8 },
  { day: "05/30", Aramex: 4, SMSA: 3, Naqel: 5, SPL: 1, Total: 13 },
  { day: "06/01", Aramex: 2, SMSA: 0, Naqel: 3, SPL: 1, Total: 6 },
  { day: "06/03", Aramex: 2, SMSA: 1, Naqel: 4, SPL: 3, Total: 10 },
  { day: "06/05", Aramex: 3, SMSA: 1, Naqel: 5, SPL: 2, Total: 11 },
  { day: "06/07", Aramex: 4, SMSA: 3, Naqel: 3, SPL: 1, Total: 11 },
  { day: "06/09", Aramex: 2, SMSA: 1, Naqel: 5, SPL: 4, Total: 12 },
  { day: "06/11", Aramex: 5, SMSA: 2, Naqel: 6, SPL: 1, Total: 14 },
  { day: "06/13", Aramex: 3, SMSA: 1, Naqel: 4, SPL: 2, Total: 10 },
  { day: "06/15", Aramex: 4, SMSA: 2, Naqel: 7, SPL: 2, Total: 15 },
  { day: "06/17", Aramex: 5, SMSA: 2, Naqel: 8, SPL: 3, Total: 18 },
  { day: "06/19", Aramex: 3, SMSA: 1, Naqel: 5, SPL: 1, Total: 10 },
  { day: "06/21", Aramex: 2, SMSA: 2, Naqel: 4, SPL: 2, Total: 10 },
  { day: "06/23", Aramex: 4, SMSA: 1, Naqel: 6, SPL: 3, Total: 14 }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Start as true inside app for frictionless demo
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // States
  const [orders, setOrders] = useState<Order[] | any[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [alerts, setAlerts] = useState<CustomerAlert[]>([]);
  const [settings, setSettings] = useState<any>({
    returnDays: 7,
    openedReturnable: false,
    expectedDays: 3,
    whatsappNumber: "966501234567",
    defaultTone: "برودية",
    enableEmailAlerts: true,
    enableSMSAlerts: true,
    alertDelayThresholdHours: 24,
    emailTemplateBody: "",
    smsTemplateBody: ""
  });
  const [store, setStore] = useState<any>({
    storeName: "رواسي العطور",
    platform: "demo"
  });

  // Action/loading states
  const [loading, setLoading] = useState<boolean>(false);
  const [logsList, setLogsList] = useState<string[]>(["نظام رقيب نشط ومستعد لمراقبة المتجر"]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState("alaisa3@gmail.com");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerStoreName, setRegisterStoreName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Filter states
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [carrierFilter, setCarrierFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  // New return form
  const [newReturnOrderNum, setNewReturnOrderNum] = useState("");
  const [newReturnReason, setNewReturnReason] = useState("المنتج لرائحة مختلفة ولا يدوم");
  const [newReturnCondition, setNewReturnCondition] = useState("سليم ومغلف");
  const [newReturnOpened, setNewReturnOpened] = useState(false);

  // Template custom edit states
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateBody, setEditingTemplateBody] = useState("");

  // CSV paste/raw upload state
  const [csvContent, setCsvContent] = useState("");

  // Auto-dismiss toasts
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Initial Fetch Setup
  useEffect(() => {
    fetchCoreData();
  }, [isAuthenticated]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const fetchCoreData = async () => {
    setLoading(true);
    try {
      const [ordRes, retRes, tskRes, tmplRes, setRes, alertsRes, storeRes] = await Promise.all([
        fetch("/api/orders").then(r => r.json()),
        fetch("/api/returns").then(r => r.json()),
        fetch("/api/tasks").then(r => r.json()),
        fetch("/api/messages/templates").then(r => r.json()),
        fetch("/api/settings").then(r => r.json()),
        fetch("/api/customer-alerts").then(r => r.json()).catch(() => []),
        fetch("/api/auth/me").then(r => r.json()).catch(() => null)
      ]);

      if (Array.isArray(ordRes)) setOrders(ordRes);
      if (Array.isArray(retRes)) setReturns(retRes);
      if (Array.isArray(tskRes)) setTasks(tskRes);
      if (Array.isArray(tmplRes)) setTemplates(tmplRes);
      if (setRes && !setRes.error) setSettings(setRes);
      if (Array.isArray(alertsRes)) setAlerts(alertsRes);
      if (storeRes && storeRes.store) {
        setStore(storeRes.store);
      }
    } catch (err) {
      console.error("Error loading system state:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setStore(data.store);
        showToast("تم تسجيل الدخول بنجاح! مرحبًا بك في رقيب التجارة");
        addLog("تم تسجيل دخول التاجر وبدء محاكاة العمليات");
      } else {
        showToast(data.error || "فشل تسجيل الدخول", "error");
      }
    } catch (e) {
      showToast("حدث خطأ بالاتصال بالمنصة", "error");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: registerEmail, 
          password: registerPassword, 
          fullName: registerName, 
          storeName: registerStoreName 
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        showToast("تأسيس المتجر بنجاح! تم الدخول للوضع التجريبي الفوري");
        addLog(`متجر جديد ${registerStoreName} مستعد للربط الإلكتروني`);
        fetchCoreData();
      } else {
        showToast(data.error || "خطأ في تسجيل البيانات", "error");
      }
    } catch (e) {
      showToast("خطأ بالاتصال بالخادم", "error");
    }
  };

  const syncSalla = async () => {
    setSyncing(true);
    addLog("طلب مزامنة حية من خوادم سلة للتجارة الإلكترونية...");
    try {
      const res = await fetch("/api/salla/sync-orders", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("تمت معالجة ومزامنة طلب جديد بنجاح!");
        addLog(`تم اكتشاف وتحديث طلب # ${data.added.orderNumber} لصالح العميل ${data.added.customerName}`);
        fetchCoreData();
      }
    } catch (e) {
      showToast("فشل الاتصال بخادم سلة", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleOAuthConnect = async () => {
    addLog("بدء تشغيل بروتوكول التوثيق Salla OAuth 2.0...");
    try {
      const res = await fetch("/api/salla/connect");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      showToast("خطأ في تشغيل الاتصال الذكي بسلة", "error");
    }
  };

  const handleResetDemoData = async () => {
    setLoading(true);
    addLog("جاري إعادة تهيئة الوضع التجريبي بالبيانات السعودية الافتراضية...");
    try {
      const res = await fetch("/api/demo/load", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("تمت إعادة تحميل بيانات المتجر الافتراضي بنجاح");
        addLog("تم تهيئة 5 طلبات تجريبية كبرى لمدن الرياض ومكة وجدة وتبوك وأبها");
        fetchCoreData();
      }
    } catch (err) {
      showToast("حدث خطأ أثناء تنشيط البيانات", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const res = await fetch("/api/tasks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId })
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status === "completed" ? "open" : "completed" } : t));
        showToast("تم حفظ التعديل بنجاح");
      }
    } catch (e) {
      showToast("فشلت حماية المهمة", "error");
    }
  };

  const handleFollowupChange = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/orders/update-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status })
      });
      if (res.ok) {
        showToast("تم تحديث مستوى متابعة الشحنة");
        addLog(`تحديث خط المتابعة للمعرف ${orderId}`);
        fetchCoreData();
      }
    } catch (e) {
      showToast("فشل تواصل الخادم", "error");
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReturnOrderNum) return showToast("يرجى إدخال رقم الطلب", "error");
    setLoading(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: newReturnOrderNum,
          reason: newReturnReason,
          productCondition: newReturnCondition,
          opened: newReturnOpened,
          notes: ""
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("تلقى العميل الرد وبانتظار الموافقة النهائية!");
        addLog(`إيداع طلب إرجاع للمنتج رقم ${newReturnOrderNum}`);
        setNewReturnOrderNum("");
        fetchCoreData();
      } else {
        showToast(data.error || "فشل تسجيل طلب المرتجع", "error");
      }
    } catch (e) {
      showToast("فشل إيداع الطلب", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async (id: string) => {
    try {
      const res = await fetch("/api/messages/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, body: editingTemplateBody })
      });
      if (res.ok) {
        showToast("تم حفظ قالب الواتساب الجديد بنجاح!");
        setEditingTemplateId(null);
        fetchCoreData();
      }
    } catch (e) {
      showToast("حدث خطأ بالخادم", "error");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast("تم تحديث سياسات المتجر وتنبيهات الشحن بعد 24 ساعة بنجاح!");
        fetchCoreData();
      }
    } catch (e) {
      showToast("خطأ بالخادم", "error");
    }
  };

  const handleScanForDelays = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customer-alerts/trigger", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "تم فحص الشحنات المتأخرة وإرسال التنبيهات");
        fetchCoreData();
      } else {
        showToast(data.error || "فشل فحص الشحنات", "error");
      }
    } catch (e) {
      showToast("خطأ في الاتصال بالخادم", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestAlert = async (orderId: string, type: 'email' | 'sms') => {
    try {
      const res = await fetch("/api/customer-alerts/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, type })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`تمت محاكاة وإرسال تنبيه (${type === 'sms' ? 'SMS' : 'البريد الإلكتروني'}) بنجاح!`);
        fetchCoreData();
      } else {
        showToast(data.error || "فشل إرسال التنبيه التجريبي", "error");
      }
    } catch (e) {
      showToast("خطأ في الاتصال بالخادم", "error");
    }
  };

  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return showToast("الرجاء لصق محتويات CSV أولاً", "error");
    
    // Parse simulated simple CSV
    // order_id,customer_name,phone,city,carrier,order_date,status,last_update,total,return_requested
    const lines = csvContent.split("\n");
    if (lines.length < 2) return showToast("البيانات المنسوخة قصيرة للغاية لتكون صالحة", "error");

    const header = lines[0].split(",");
    const list: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(",");
      if (cols.length >= 5) {
        list.push({
          order_id: cols[0] || "",
          customer_name: cols[1] || "",
          phone: cols[2] || "",
          city: cols[3] || "الرياض",
          carrier: cols[4] || "سمسا",
          order_date: cols[5] || new Date().toISOString().substring(0, 10),
          status: cols[6] || "متأخر",
          last_update: cols[7] || new Date().toISOString(),
          total: cols[8] || "250",
          return_requested: cols[9] || "false",
        });
      }
    }

    if (list.length === 0) return showToast("صيغة المدخلات خاطئة. يرجى مراجعة المثال المرفق", "error");

    setLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: list })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`تم استيراد وتحليل ${data.count} من شحنات المتجر بنجاح!`);
        addLog(`محرك الذكاء الاصطناعي يقوم بفلترة ${data.count} شحنة جديدة`);
        setCsvContent("");
        fetchCoreData();
      }
    } catch (e) {
      showToast("فشلت تصفية ملف الاستيراد", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("تم النسخ للحافظة بنجاح! جاهز للإرسال بالواتساب ✅");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const addLog = (msg: string) => {
    setLogsList(p => [ `[${new Date().toLocaleTimeString("ar-SA")}] - ${msg}`, ...p ]);
  };

  // Safe variables renderer helper
  const replaceVariables = (text: string, o: any) => {
    return text
      .replace(/{customer_name}/g, o.customerName)
      .replace(/{order_number}/g, o.orderNumber)
      .replace(/{carrier}/g, o.carrier)
      .replace(/{customer_city}/g, o.customerCity)
      .replace(/{city}/g, o.customerCity)
      .replace(/{store_name}/g, store.storeName || "رواسي العطور");
  };

  // Filter calculations
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.orderNumber?.includes(orderSearch) ||
      o.carrier?.toLowerCase().includes(orderSearch.toLowerCase());
    
    const matchesStatus = statusFilter === "all" ? true : o.status === statusFilter;
    const matchesCity = cityFilter === "all" ? true : o.customerCity === cityFilter;
    const matchesCarrier = carrierFilter === "all" ? true : o.carrier === carrierFilter;
    const matchesRisk = riskFilter === "all" ? true : o.analysis?.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesCity && matchesCarrier && matchesRisk;
  });

  // Calculate dynamic stats
  const totalOrdersCount = orders.length;
  const delayedShipmentsCount = orders.filter(o => o.status === "متأخر").length;
  const openReturnsCount = returns.filter(r => r.status === "open").length;
  const highRiskCount = orders.filter(o => o.analysis?.riskLevel === "مرتفع").length;
  const pendingTasksCount = tasks.filter(t => t.status === "open").length;

  return (
    <div id="app-root" className="min-h-screen bg-brand-dark flex font-sans leading-relaxed selection:bg-brand-emerald selection:text-brand-dark">
      
      {/* Dynamic Native RTL Navigation */}
      {isAuthenticated && (
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            setSelectedOrderId(null);
          }} 
          storeName={store.storeName}
          isSalla={store.platform === "salla"}
          logout={() => {
            setIsAuthenticated(false);
            showToast("تم تسجيل الخروج بنجاح 👋");
          }}
        />
      )}

      {/* Main Panel Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-8 relative flex flex-col gap-6">

        {/* Global Floating Toast */}
        {toast && (
          <div id="interactive-toast" className={`fixed bottom-6 left-6 z-50 flex items-center gap-3.5 px-5 py-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border transition-all transform scale-100 animate-slide-in ${
            toast.type === "success" 
              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
              : "bg-red-50 text-red-800 border-red-200"
          }`}>
            <span className="text-sm font-bold">{toast.message}</span>
            <button onClick={() => setToast(null)} className="hover:opacity-85 font-extrabold text-xs cursor-pointer text-slate-500 hover:text-slate-900">✕</button>
          </div>
        )}

        {/* TOP BAR / Header Section */}
        {isAuthenticated && (
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {currentTab === "dashboard" && "لوحة الرقابة والعمليات اليومية"}
                  {currentTab === "orders" && "سجلات ومتابعة الشحنات"}
                  {currentTab === "delayed" && "فلترة الشحنات المتأخرة"}
                  {currentTab === "returns" && "البوابة الذكية للمرتجعات"}
                  {currentTab === "messages" && "قوالب ومولد رسائل الواتساب الذكي"}
                  {currentTab === "upload" && "استيراد الشحنات يدوياً (CSV)"}
                  {currentTab === "settings" && "إعدادات منصة رقيب وتنبيهات السياسة"}
                  {currentTab === "billing" && "خطط الترقية واشتراكات متجر سلة"}
                </h1>
                {store.platform === "demo" && (
                  <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
                    الوضع التجريبي نشط
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-1">
                تنبؤ بمخاطر العمليات قبل حدوثها لمتاجر سلة السعودية
              </p>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <button
                id="reset-demo-btn"
                onClick={handleResetDemoData}
                title="إعادة شحن البيانات الافتراضية"
                className="bg-[#112240] hover:bg-[#1e345b] text-gray-300 border border-gray-800 hover:border-brand-teal/50 transition-all px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-brand-emerald" />
                استعادة البيانات الافتراضية
              </button>

              <button
                id="sync-button"
                onClick={syncSalla}
                disabled={syncing}
                className="bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl hover:shadow-brand-emerald/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "جاري مزامنة سلة..." : "مزامنة طلبات سلة"}
              </button>
            </div>
          </header>
        )}

        {/* ----------------- RENDER BODY PANELS ----------------- */}

        {!isAuthenticated ? (
          /* MARKETING / OUT OF APP CONTROLLER */
          <div className="max-w-6xl mx-auto w-full py-10 flex flex-col gap-14 text-center">
            
            {/* Header Landing Panel */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-emerald flex items-center justify-center text-brand-dark font-extrabold text-lg">
                  رقيب
                </div>
                <span className="font-extrabold text-xl text-white">رقيب التجارة</span>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setIsRegisterMode(false); }} className="text-brand-emerald text-sm font-semibold hover:underline cursor-pointer">تسجيل دخول للمشتركين</button>
                <button onClick={() => { setIsRegisterMode(true); }} className="bg-brand-emerald/10 text-brand-emerald px-4 py-1.5 rounded-lg border border-brand-emerald/20 text-sm font-bold cursor-pointer transition-colors hover:bg-brand-emerald/20">انضم إلينا</button>
              </div>
            </div>

            {/* HERO MARKETING VIEW */}
            <section className="bg-gradient-to-b from-[#0b192c]/50 to-[#0c101d] p-12 rounded-3xl border border-gray-800 flex flex-col items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl -z-10"></div>
              
              <div className="inline-block bg-[#112240] text-brand-emerald border border-brand-emerald/20 px-4 py-1.5 rounded-full text-xs font-bold mb-2">
                إيجنت ذكي يراقب متجرك قبل أن تتحول المشاكل إلى شكاوى 🛡️
              </div>
              
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-4xl">
                مساعد لوجستي وذكي متكامل يراقب شحنات متجرك بـ <span className="text-brand-emerald">سلة</span> ويرصد تأخر التوصيل لعملائك!
              </h2>
              
              <p className="text-gray-400 text-lg max-w-2xl">
                رقيب يساعد تجار سلة على تلافي غرامات الشحن، ومحاربة الشكاوي بتقديم تنبيهات حية، تحليلات مخاطر، مع صياغة رسائل واتساب جاهزة للتواصل والاعتذار الفوري للعملاء والناقلين.
              </p>

              <div className="flex items-center gap-4 justify-center mt-4">
                <button 
                  onClick={() => setIsAuthenticated(true)}
                  className="bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-extrabold px-8 py-4 rounded-2xl text-base shadow-xl hover:shadow-brand-emerald/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  تخطي والدخول للوضع التجريبي فورا
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </section>

            {/* AUTH SECTION (LOGIN & REGISTER SYSTEM CARDS IN LANDING) */}
            <div id="auth-forms-container" className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
              
              {/* BRAND CARD */}
              <div className="bg-[#0b192c] p-8 rounded-2xl border border-gray-800 text-right flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">لماذا يعتمد تجار سلة على رقيب؟</h3>
                  <ul className="space-y-4 my-6 text-gray-300 text-sm">
                    <li className="flex items-start gap-2.5">
                      <span className="text-brand-emerald mt-1 font-bold">✓</span>
                      <span><strong>كشف فوري للشحنات المعلقة:</strong> يرصد متى توقفت شحنة العميل عند سمسا أو أرامكس ويتيح الاعتذار الفوري.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-brand-emerald mt-1 font-bold">✓</span>
                      <span><strong>إدارة المرتجعات بقواعد مرنة:</strong> يتخذ قرارات القبول والرفض بناءً على سياسة متجرك وصحّة المنتجات المفتوحة.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-brand-emerald mt-1 font-bold">✓</span>
                      <span><strong>نسخ وإرسال بالواتساب:</strong> مسودات معدة بحسب اسم السبط، رقم الشحنة، والناقل؛ لصالح العميل أو الناقل لتسريع المتابعة.</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-6 border-t border-gray-800 text-xs text-brand-emerald font-semibold flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-emerald"></span>
                  موصل بشكل رسمي مع منصة سلة السعودية للتجارة
                </div>
              </div>

              {/* DYNAMIC FORM */}
              <div className="bg-[#0b192c] p-8 rounded-2xl border border-gray-800 text-right">
                {isRegisterMode ? (
                  <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-white">تسجيل تاجر جديد</h3>
                    <p className="text-xs text-gray-400">سجل حسابك التجريبي واربط متجرك بلمسة زر واحدة</p>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">الاسم الكامل للتاجر</label>
                      <input 
                        type="text" 
                        required
                        value={registerName}
                        onChange={e => setRegisterName(e.target.value)}
                        placeholder="مثال: عبدالله الراجحي" 
                        className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-emerald"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">اسم المتجر بسلسلة (أو اسم افتراضي)</label>
                      <input 
                        type="text" 
                        required
                        value={registerStoreName}
                        onChange={e => setRegisterStoreName(e.target.value)}
                        placeholder="مثال: رسيل للقهوة المختصة" 
                        className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-emerald"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">البريد الإلكتروني للعمل</label>
                      <input 
                        type="email" 
                        required
                        value={registerEmail}
                        onChange={e => setRegisterEmail(e.target.value)}
                        placeholder="name@store.sa" 
                        className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-emerald"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">كلمة المرور الأمنية</label>
                      <input 
                        type="password" 
                        required
                        value={registerPassword}
                        onChange={e => setRegisterPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-emerald"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-extrabold py-3 rounded-xl text-sm transition-all cursor-pointer mt-2"
                    >
                      تأسيس المتجر والبدء الآن
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-2">
                      لديك حساب بالفعل؟{" "}
                      <button type="button" onClick={() => setIsRegisterMode(false)} className="text-brand-emerald font-bold hover:underline">سجل الدخول</button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-white">تسجيل الدخول للمنصة</h3>
                    <p className="text-xs text-gray-400">أدخل بيانات متجرك لبدء رصد الشحنات</p>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">البريد الإلكتروني للتاجر</label>
                      <input 
                        type="email" 
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="demo@raqeeb.sa" 
                        className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-emerald"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">كلمة المرور المسجلة</label>
                      <input 
                        type="password" 
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-emerald"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-extrabold py-3 rounded-xl text-sm transition-all cursor-pointer mt-2"
                    >
                      تأكيد ودخول لوحة المعالجة
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-2">
                      سجل معنا كتاجر سلة جديد؟{" "}
                      <button type="button" onClick={() => setIsRegisterMode(true)} className="text-brand-emerald font-bold hover:underline">سجل حساب جديد</button>
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* MARKETING FAQ SECTION */}
            <div className="bg-[#0b192c] p-8 rounded-3xl border border-gray-800 max-w-4xl mx-auto w-full text-right">
              <h3 className="text-xl font-bold text-white mb-6 text-center">الأسئلة الشائعة حول رقيب التجارة</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-800 pb-4">
                  <h4 className="font-bold text-white text-base">هل التطبيق مجرب ومتوافق مع متطلبات سلة؟</h4>
                  <p className="text-gray-400 text-sm mt-1">نعم، تم تصميمه ليتكامل فورياً باستخدام بروتوكول Salla OAuth 2.0 المعتمد ويزامن سلة المشتريات والطلبات وتحديثات الشحن المباشرة.</p>
                </div>
                <div className="border-b border-gray-800 pb-4">
                  <h4 className="font-bold text-white text-base">هل يعمل النظام دون ربط حقيقي مباشر بالبداية؟</h4>
                  <p className="text-gray-400 text-sm mt-1">بالتأكيد! صممنا وضعاً تجريبياً (Demo Mode) كاملاً ومسبق الشحن بـ ٥ طلبات سعودية حقيقية لمدن كبرى لمساعدتك على استكشاف الفوائد على الفور.</p>
                </div>
                <div className="pb-2">
                  <h4 className="font-bold text-white text-base">هل يرسل النظام رسائل واتساب تلقائية؟</h4>
                  <p className="text-gray-400 text-sm mt-1">يُنتج رقيب مسودة ردود مخصصة تماماً وتفاعلية في ثلاث نبرات مختلفة (رسمية، ودية، ومختصرة)، ويكون بمقدور التاجر نسخها بلمسة زر لتطبيق الوكيل دون مخاطر حظر الحسابات.</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* AUTHENTICATED SaaS INTERFACING APP */
          <div className="flex flex-col gap-6">

            {/* SALLY QUICK OAUTH CONNECTION BANNER */}
            {store.platform === "demo" && (
              <div id="oauth-connect-card" className="bg-[#1e1a0b] text-[#fcd34d] border border-amber-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">الربط الإلكتروني بمتجر سلة غير مفعل</h4>
                    <p className="text-xs text-amber-200 mt-1">
                      أنت تتصفح المنصة حالياً بوضع البيانات التجريبية لحفظ سلامة تشغيل الميزات. اربط حساب سلة الفعلي لبدء الرصد والتحصيل المباشر.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleOAuthConnect}
                  className="bg-amber-500 hover:bg-amber-400 text-brand-dark px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                >
                  <Globe className="w-4 h-4" />
                  ربط متجر سلة الفعلي
                </button>
              </div>
            )}

            {/* VIEW MANAGER BRANCHING ROUTING */}
            {selectedOrderId ? (

              /* VIEW 1: PRECISE ORDER DETAILS SUB-VIEW */
              (() => {
                const order = orders.find(o => o.id === selectedOrderId);
                if (!order) return <p>خطأ في استدعاء تفاصيل الشحنة.</p>;
                return (
                  <div className="space-y-6">
                    <button 
                      onClick={() => setSelectedOrderId(null)}
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1 cursor-pointer"
                    >
                      <span>→</span> العودة لقائمة الشحنات
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Sub-Card 1: Master Order metadata */}
                      <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                          <div>
                            <span className="text-xs text-gray-400 block">رقم طلب متجر سلة</span>
                            <span className="text-xl font-bold text-white">#{order.orderNumber}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                            order.status === "متأخر" ? "bg-red-500/10 text-red-400" :
                            order.status === "تم الشحن" ? "bg-amber-500/10 text-amber-400" :
                            order.status === "مكتمل" ? "bg-green-500/10 text-green-400" : "bg-gray-800 text-gray-400"
                          }`}>{order.status}</span>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">اسم العميل:</span>
                            <span className="font-semibold text-white">{order.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">مدينة التوصيل:</span>
                            <span className="font-semibold text-white">{order.customerCity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">شركة الشحن:</span>
                            <span className="font-semibold text-white">{order.carrier}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">تاريخ الشراء:</span>
                            <span className="font-semibold text-white">{order.orderDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">إجمالي المبيعات:</span>
                            <span className="font-bold text-brand-emerald">{order.total} ريال</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                          <label className="text-xs text-gray-400 block mb-2">تحديث حالة المتابعة الداخلية</label>
                          <select
                            value={order.followupStatus}
                            onChange={(e) => handleFollowupChange(order.id, e.target.value)}
                            className="w-full bg-brand-dark border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                          >
                            <option value="new">جديد (بانتظار الإجراء)</option>
                            <option value="investigating">قيد التحقيق الفني</option>
                            <option value="escalated">تم التصعيد للناقل</option>
                            <option value="resolved">تم الحل والإغلاق</option>
                          </select>
                        </div>
                      </div>

                      {/* Sub-Card 2: Smart Agent Analysis Result */}
                      <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 flex flex-col gap-4 md:col-span-2">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-brand-emerald" />
                            <h3 className="font-bold text-white text-lg">تحليل رقيب الذكي للخطورة والعمليات</h3>
                          </div>
                          
                          {/* Risk Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.analysis?.riskLevel === "مرتفع" ? "bg-red-500/10 text-red-400 border border-red-500/30" :
                            order.analysis?.riskLevel === "متوسط" ? "bg-amber-500/10 text-amber-500 border border-amber-500/30" :
                            "bg-green-500/10 text-brand-emerald border border-brand-emerald/30"
                          }`}>خطورة: {order.analysis?.riskLevel || "غير محدد"}</span>
                        </div>

                        {/* Analysis Body */}
                        <div className="space-y-4">
                          <div className="p-4 bg-brand-dark rounded-xl border border-gray-800">
                            <span className="text-xs text-gray-400 font-bold block mb-1">تفسير حالة التأخر أو المشكلة:</span>
                            <p className="text-sm text-gray-200">{order.analysis?.reason || "لا توجد مشاكل تم رصدها على مسار هذه الشحنة."}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="p-3.5 bg-brand-dark rounded-xl border border-gray-800">
                              <span className="text-xs text-brand-emerald font-bold block mb-1">الإجراء التنفيذي المقترح من رقيب:</span>
                              <p className="text-gray-300">{order.analysis?.recommendedAction || "لا توجد ضرورة برفع تذكرة متابعة حاليا."}</p>
                            </div>
                            <div className="p-3.5 bg-brand-dark rounded-xl border border-gray-800">
                              <span className="text-xs text-amber-500 font-bold block mb-1">ملاحظات لوجستية داخلية:</span>
                              <p className="text-gray-300">{order.analysis?.internalNote || "البيانات متطابقة."}</p>
                            </div>
                          </div>

                          {/* Suggested Copyable Texts container */}
                          <div className="pt-4 border-t border-gray-800 space-y-4">
                            <h4 className="text-sm font-bold text-white mb-2">نصوص واتساب مقترحة لحجم المشكلة:</h4>

                            <div className="space-y-3">
                              <div className="bg-brand-dark p-4 rounded-xl border border-gray-800 relative">
                                <span className="absolute top-3 left-3 bg-brand-emerald/10 text-brand-emerald text-[11px] px-2 py-0.5 rounded font-bold">رسالة العميل</span>
                                <p className="text-xs text-gray-300 mt-2 mb-3 max-w-[90%] font-mono py-1">
                                  {order.analysis?.customerMessage}
                                </p>
                                <button
                                  onClick={() => copyToClipboard(order.analysis?.customerMessage || "", "cust-" + order.id)}
                                  className="w-full justify-center bg-[#112240] hover:bg-[#1e345b] text-white border border-gray-800 hover:border-brand-emerald/50 transition-all py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                                >
                                  {copiedId === "cust-" + order.id ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                                  {copiedId === "cust-" + order.id ? "تم النسخ!" : "نسخ رسالة العميل وإرسالها بالواتساب"}
                                </button>
                              </div>

                              <div className="bg-brand-dark p-4 rounded-xl border border-gray-800 relative">
                                <span className="absolute top-3 left-3 bg-amber-500/10 text-amber-500 text-[11px] px-2 py-0.5 rounded font-bold">رسالة شركة الشحن ({order.carrier})</span>
                                <p className="text-xs text-gray-300 mt-2 mb-3 max-w-[90%] font-mono py-1">
                                  {order.analysis?.carrierMessage}
                                </p>
                                <button
                                  onClick={() => copyToClipboard(order.analysis?.carrierMessage || "", "carr-" + order.id)}
                                  className="w-full justify-center bg-[#112240] hover:bg-[#1e345b] text-white border border-gray-800 hover:border-brand-emerald/50 transition-all py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                                >
                                  {copiedId === "carr-" + order.id ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                                  {copiedId === "carr-" + order.id ? "تم النسخ!" : "نسخ رسالة تصعيد شركة الشحن"}
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()

            ) : (

              /* CORE TABS SWITCH PANEL */
              <div>
                
                {/* TAB 1: DASHBOARD OVERVIEW */}
                {currentTab === "dashboard" && (
                  <div className="space-y-6">

                    {/* KPI CARDS GRID */}
                    <div id="kpi-grid" className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      
                      <div className="bg-brand-navy p-5 rounded-2xl border border-gray-800 flex flex-col gap-1">
                        <span className="text-xs text-gray-400 font-bold block">إجمالي طلبات سلة</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-2xl font-bold text-white">{totalOrdersCount}</span>
                          <span className="text-xs text-brand-emerald">نشط</span>
                        </div>
                      </div>

                      <div className="bg-brand-navy p-5 rounded-2xl border border-gray-800 flex flex-col gap-1">
                        <span className="text-xs text-gray-400 font-bold block">شحنات متأخرة</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-2xl font-bold text-red-400">{delayedShipmentsCount}</span>
                          <span className="text-xs text-red-500 font-bold animate-pulse">● رصد عاجل</span>
                        </div>
                      </div>

                      <div className="bg-brand-navy p-5 rounded-2xl border border-gray-800 flex flex-col gap-1">
                        <span className="text-xs text-gray-400 font-bold block">طلبات عالية الخطورة</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-2xl font-bold text-amber-500">{highRiskCount}</span>
                          <span className="text-xs text-amber-400">تتطلب تواصل</span>
                        </div>
                      </div>

                      <div className="bg-brand-navy p-5 rounded-2xl border border-gray-800 flex flex-col gap-1">
                        <span className="text-xs text-gray-400 font-bold block">طلبات مرتجعات مفتوحة</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-2xl font-bold text-brand-teal">{openReturnsCount}</span>
                          <span className="text-xs text-brand-teal">تحت القرار</span>
                        </div>
                      </div>

                      <div className="bg-brand-navy p-5 rounded-2xl border border-gray-800 flex flex-col gap-1 col-span-2 md:col-span-1">
                        <span className="text-xs text-gray-400 font-bold block">تنبيهات معلقة</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-2xl font-bold text-[#fcd34d]">{pendingTasksCount}</span>
                          <span className="text-xs text-gray-400">تحديث اليوم</span>
                        </div>
                      </div>

                    </div>

                    {/* CHART AREA: TREND OF DELAYED SHIPMENTS OVER THE LAST 30 DAYS */}
                    <div id="delayed-trend-chart-card" className="bg-brand-navy p-6 rounded-2xl border border-slate-200/80">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-red-50 text-red-600 block">
                              <TrendingUp className="w-4 h-4" />
                            </span>
                            <h3 className="font-extrabold text-slate-900 text-base">مراقبة وتتبع الشحنات المتأخرة (آخر ٣٠ يوماً)</h3>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            تتبع الأداء الزمني وحركة تأخر الشحن للناقلين لتحديد نقاط الخلل والاختناق اللوجستي مبكراً.
                          </p>
                        </div>
                        
                        {/* Quick carriers indicators summary */}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                            <span className="text-slate-700">أرامكس</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-700">سمسا</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            <span className="text-slate-700">ناقل Express</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                            <span className="text-slate-700">SPL</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-[300px] mt-2 select-none">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={delayedTrendData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorAramex" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                              </linearGradient>
                              <linearGradient id="colorSMSA" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                              </linearGradient>
                              <linearGradient id="colorNaqel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01}/>
                              </linearGradient>
                              <linearGradient id="colorSPL" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.01}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="day" 
                              stroke="#94a3b8" 
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              dy={10}
                            />
                            <YAxis 
                              stroke="#94a3b8" 
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              dx={-10}
                            />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-right space-y-1.5 min-w-[140px]">
                                      <p className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-1 mb-1">{`تاريخ: ${label}`}</p>
                                      {payload.map((item: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between text-xs font-semibold gap-4">
                                          <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                            <span className="text-slate-500">{item.name}</span>
                                          </div>
                                          <span className="text-slate-900 font-bold">{item.value} شحنة</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area type="monotone" name="أرامكس" dataKey="Aramex" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAramex)" />
                            <Area type="monotone" name="سمسا" dataKey="SMSA" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSMSA)" />
                            <Area type="monotone" name="ناقل" dataKey="Naqel" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNaqel)" />
                            <Area type="monotone" name="SPL" dataKey="SPL" stroke="#ec4899" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSPL)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                          ناقل Express يشهد حالياً تصاعداً طفيفاً في أوقات التسليم لمدينة تبوك وأبها بنسبة زيادة متوقعة ٢٢٪
                        </span>
                        <button onClick={() => setCurrentTab("delayed")} className="text-emerald-600 hover:text-emerald-700 font-bold transition-all shrink-0 cursor-pointer">
                          تصفية الشحنات المتأخرة بالكامل ←
                        </button>
                      </div>
                    </div>

                    {/* MAIN TWO COLUMN VIEW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                      {/* Right column: Main recommendations and Risky list */}
                      <div className="lg:col-span-2 space-y-6">
                        
                        {/* Agent recommendations banner */}
                        <div className="bg-gradient-to-r from-[#0d221b] to-brand-navy p-6 rounded-2xl border border-brand-emerald/20">
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-brand-emerald shrink-0" />
                            <div>
                              <h3 className="text-white font-bold text-base">توجيه ذكي من رقيب لمكافحة الشكاوى اليوم</h3>
                              <p className="text-xs text-gray-300 mt-1">
                                رصدنا تأخر ٣ شحنات لدى كل من (أرامكس وناقل) متجهة لمدينتي الرياض وتبوك. نقترح عليك نسخ رسالة المتابعة وإشعار العملاء سريعًا لإخماد أي غضب استباقيًا قبل تقديم شكاوى لوزارة التجارة أو تطبيق سلة.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Recent Risky Orders Table */}
                        <div className="bg-brand-navy rounded-2xl border border-gray-800 p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-base">آخر الشحنات ذات الخطورة العالية والمتوسطة</h3>
                            <button onClick={() => setCurrentTab("orders")} className="text-xs text-brand-emerald hover:underline font-bold cursor-pointer">عرض كل الشحنات ←</button>
                          </div>

                          <div className="overflow-x-auto text-sm">
                            <table className="w-full text-right border-collapse">
                              <thead>
                                <tr className="border-b border-gray-800 text-gray-400 text-xs">
                                  <th className="py-3 px-2 font-semibold">رقم الطلب</th>
                                  <th className="py-3 px-2 font-semibold">العميل</th>
                                  <th className="py-3 px-2 font-semibold">المدينة والناقل</th>
                                  <th className="py-3 px-2 font-semibold">تاريخه</th>
                                  <th className="py-3 px-2 font-semibold text-center">الخطورة</th>
                                  <th className="py-3 px-2 font-semibold text-left">إجراء</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800/50">
                                {orders.slice(0, 4).map((o) => (
                                  <tr key={o.id} className="hover:bg-gray-800/20 transition-colors">
                                    <td className="py-3.5 px-2 font-bold text-white">#{o.orderNumber}</td>
                                    <td className="py-3.5 px-2">{o.customerName}</td>
                                    <td className="py-3.5 px-2 text-xs">
                                      {o.customerCity} | <span className="text-gray-400">{o.carrier}</span>
                                    </td>
                                    <td className="py-3.5 px-2 text-xs text-gray-400">{o.orderDate}</td>
                                    <td className="py-3.5 px-2 text-center">
                                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                        o.analysis?.riskLevel === "مرتفع" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                        o.analysis?.riskLevel === "متوسط" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                        "bg-green-500/10 text-brand-emerald border border-brand-emerald/20"
                                      }`}>{o.analysis?.riskLevel || "منخفض"}</span>
                                    </td>
                                    <td className="py-3.5 px-2 text-left">
                                      <button
                                        onClick={() => setSelectedOrderId(o.id)}
                                        className="bg-[#112240] hover:bg-brand-emerald hover:text-brand-dark text-white text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold inline-flex items-center gap-1"
                                      >
                                        تحليل رقيب
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>

                      {/* Left Column: Live Agent Task, Operations Logs & Quick Return trigger */}
                      <div className="space-y-6">

                        {/* Tasks Card list */}
                        <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 space-y-4">
                          <h3 className="font-bold text-white text-base">مهام المتابعة الإدارية المقترحة</h3>
                          <div className="space-y-3">
                            {tasks.length === 0 ? (
                              <p className="text-xs text-gray-500 text-center py-4">لا توجد مهام معلقة في السجل حالياً 🎉</p>
                            ) : (
                              tasks.map((task) => (
                                <div key={task.id} className="p-3 bg-brand-dark rounded-xl border border-gray-800 flex items-start gap-3">
                                  <input 
                                    type="checkbox" 
                                    checked={task.status === "completed"}
                                    onChange={() => toggleTask(task.id)}
                                    className="w-4 h-4 rounded mt-1 border-gray-700 bg-brand-dark text-brand-emerald focus:ring-0 cursor-pointer"
                                  />
                                  <div className="flex-1 text-right">
                                    <span className={`font-bold text-xs ${task.status === "completed" ? "line-through text-gray-500" : "text-white"}`}>{task.title}</span>
                                    <p className="text-[11px] text-gray-400 mt-0.5 leading-normal">{task.description}</p>
                                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 ${
                                      task.priority === "high" ? "bg-red-500/10 text-red-400" : "bg-gray-800 text-gray-400"
                                    }`}>أولوية: {task.priority === "high" ? "قصوى" : "متوسطة"}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        
                        {/* Live Audit System Logs */}
                        <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-sm">سجل عمليات رقيب الفورية (Live Audit)</h3>
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-ping"></span>
                          </div>
                          
                          <div className="bg-brand-dark p-3 rounded-xl border border-gray-800 h-44 overflow-y-auto font-mono text-left text-[11px] text-gray-400 space-y-2 select-all leading-normal">
                            {logsList.map((log, idx) => (
                              <div key={idx} className="border-b border-gray-800/40 pb-1 last:border-0 hover:text-white transition-all text-right">
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                )}


                {/* TAB 2: POWERFUL ORDERS LIST WITH RTL FILTERS */}
                {currentTab === "orders" && (
                  <div className="space-y-6">
                    
                    {/* Filter container block */}
                    <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 grid grid-cols-1 md:grid-cols-5 gap-4">
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1.5">البحث السريع</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                            placeholder="اسم العميل، رقم الطلب..."
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1.5">حالة الشحنة بالناقل</label>
                        <select 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full bg-brand-dark border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                        >
                          <option value="all">الكل</option>
                          <option value="متأخر">متأخر</option>
                          <option value="تم الشحن">تم الشحن</option>
                          <option value="قيد التجهيز">قيد التجهيز</option>
                          <option value="مكتمل">مكتمل</option>
                          <option value="مرتجع">مرتجع</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1.5">المدينة</label>
                        <select 
                          value={cityFilter}
                          onChange={(e) => setCityFilter(e.target.value)}
                          className="w-full bg-brand-dark border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                        >
                          <option value="all">جميع المدن السعودية</option>
                          <option value="الرياض">الرياض</option>
                          <option value="جدة">جدة</option>
                          <option value="تبوك">تبوك</option>
                          <option value="أبها">أبها</option>
                          <option value="المدينة">المدينة</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1.5">شركة الشحن</label>
                        <select 
                          value={carrierFilter}
                          onChange={(e) => setCarrierFilter(e.target.value)}
                          className="w-full bg-brand-dark border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                        >
                          <option value="all">جميع الناقلين</option>
                          <option value="أرامكس">أرامكس</option>
                          <option value="سمسا">سمسا</option>
                          <option value="ناقل">ناقل</option>
                          <option value="SPL">SPL</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1.5">مستوى خطورة رقيب</label>
                        <select 
                          value={riskFilter}
                          onChange={(e) => setRiskFilter(e.target.value)}
                          className="w-full bg-brand-dark border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                        >
                          <option value="all">كل مستويات الخطورة</option>
                          <option value="مرتفع">مرتفع</option>
                          <option value="متوسط">متوسط</option>
                          <option value="منخفض">منخفض</option>
                        </select>
                      </div>

                    </div>

                    {/* Master Orders table list card */}
                    <div className="bg-brand-navy rounded-2xl border border-gray-800 overflow-hidden">
                      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0d1624]">
                        <h3 className="font-bold text-white">كل الشحنات المسجلة بالمستودع</h3>
                        <span className="text-xs text-gray-400">تصفية نتائج: {filteredOrders.length} طلب</span>
                      </div>

                      <div className="overflow-x-auto text-sm">
                        <table className="w-full text-right border-collapse">
                          <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-xs bg-brand-dark/20">
                              <th className="py-4 px-4 font-semibold">رقم طلب سلة</th>
                              <th className="py-4 px-4 font-semibold">اسم وسجلات العميل</th>
                              <th className="py-4 px-4 font-semibold">المدينة</th>
                              <th className="py-4 px-4 font-semibold">شركة الشحن</th>
                              <th className="py-4 px-4 font-semibold text-center">أيام التأخر</th>
                              <th className="py-4 px-4 font-semibold">آخر نشاط</th>
                              <th className="py-4 px-4 font-semibold text-center">خطورة رقيب</th>
                              <th className="py-4 px-4 font-semibold text-left">إجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800/40">
                            {filteredOrders.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="py-12 text-center text-gray-500">
                                  لم يتم العثور على أي شحنات مطابقة لمعايير التصفية الحالية 🔍
                                </td>
                              </tr>
                            ) : (
                              filteredOrders.map((o) => (
                                <tr key={o.id} className="hover:bg-gray-800/10 transition-colors">
                                  <td className="py-4 px-4 font-bold text-white">#{o.orderNumber}</td>
                                  <td className="py-4 px-4">
                                    <div className="font-medium text-gray-200">{o.customerName}</div>
                                    <div className="text-[10px] text-gray-400">{o.customerPhone || "بدون رقم مسجل"}</div>
                                  </td>
                                  <td className="py-4 px-4">{o.customerCity}</td>
                                  <td className="py-4 px-4">
                                    <span className="text-brand-emerald font-semibold">{o.carrier}</span>
                                  </td>
                                  <td className="py-4 px-4 text-center font-mono">
                                    {o.status === "متأخر" ? (
                                      <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded font-bold text-xs">٥+ أيام</span>
                                    ) : (
                                      <span className="text-gray-500 text-xs">-</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-4 text-xs text-gray-400">
                                    {new Date(o.lastUpdate).toLocaleDateString("ar-SA")}
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                      o.analysis?.riskLevel === "مرتفع" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                      o.analysis?.riskLevel === "متوسط" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                      "bg-green-500/10 text-brand-emerald border border-brand-emerald/20"
                                    }`}>{o.analysis?.riskLevel || "منخفض"}</span>
                                  </td>
                                  <td className="py-4 px-4 text-left">
                                    <button
                                      onClick={() => setSelectedOrderId(o.id)}
                                      className="bg-[#112240] hover:bg-brand-emerald hover:text-brand-dark text-white text-xs px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer inline-flex items-center gap-1"
                                    >
                                      الرد والتحليل
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}


                {/* TAB 3: DELAYED SHIPMENTS EXCLUSIVE PORTAL */}
                {currentTab === "delayed" && (
                  <div className="space-y-6">
                    
                    {/* Header Banner with auto control buttons */}
                    <div className="bg-gradient-to-r from-red-950/25 via-brand-navy to-brand-navy p-6 rounded-2xl border border-red-900/35 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="space-y-1.5 md:max-w-2xl text-right">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                          <h3 className="font-bold text-red-300 text-lg">لوحة تتبع وتحريك التنبيهات للشحنات المتأخرة</h3>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          يتتبع رقيب التجارة حالة الشحنات الراكدة لدى شركات الشحن (أرامكس، سمسا، ناقل، إلخ). في حال تخطي التأخير مهلة <span className="text-brand-teal font-bold">{settings.alertDelayThresholdHours || 24} ساعة</span>، يقوم المحرك تلقائياً بصياغة وإرسال رسائل اعتذار ذكية للعميل عبر البريد أو SMS لاستباق الشكاوى والحفاظ على تقييم متجرك.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <div className="bg-[#0b131e] px-3.5 py-2.5 rounded-xl border border-gray-800 text-[11px] text-gray-400 space-y-1 text-right">
                          <p className="flex items-center gap-1.5 justify-end">
                            <span className={settings.enableEmailAlerts ? "text-brand-emerald" : "text-gray-500"}>●</span>
                            البريد المتأخر: {settings.enableEmailAlerts ? "نشط تلقائياً" : "معطل"}
                          </p>
                          <p className="flex items-center gap-1.5 justify-end">
                            <span className={settings.enableSMSAlerts ? "text-brand-emerald" : "text-gray-500"}>●</span>
                            قنوات SMS: {settings.enableSMSAlerts ? "نشطة تلقائياً" : "معطلة"}
                          </p>
                        </div>

                        <button
                          onClick={handleScanForDelays}
                          disabled={loading}
                          className="bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark px-5 py-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-brand-emerald/10 border-none"
                        >
                          <Sparkles className="w-4 h-4" />
                          {loading ? "جاري فحص الشحنات..." : "تشغيل فحص الشحنات المتأخرة وتوليد التنبيهات"}
                        </button>
                      </div>
                    </div>

                    {/* Divided Layout: Left List, Right Dispatch Log */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Column 1: Delayed Orders list */}
                      <div className="lg:col-span-7 space-y-5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-sm flex items-center gap-2">
                            📦 شحنات متأخرة نشطة بالمنصة ({orders.filter(o => o.status === "متأخر").length})
                          </h4>
                          <span className="text-xs text-gray-500">تم تصفية الشحنات ذات التحديث الراكد</span>
                        </div>

                        {orders.filter(o => o.status === "متأخر").length === 0 ? (
                          <div className="text-center bg-brand-navy p-12 rounded-2xl border border-gray-800 text-gray-400 space-y-2">
                            <Check className="w-8 h-8 text-brand-emerald mx-auto" />
                            <p className="text-xs font-bold text-gray-300">لا توجد شحنات متأخرة حالياً!</p>
                            <p className="text-[10px] text-gray-500">متجرك يعمل بكفاءة تامة وتوصيل سريع للغاية 🚀</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {orders.filter(o => o.status === "متأخر").map((o) => (
                              <div key={o.id} className="bg-brand-navy p-5 rounded-2xl border border-gray-800/80 hover:border-gray-700/60 transition-all flex flex-col justify-between gap-4">
                                
                                <div className="flex items-center justify-between pb-3 border-b border-gray-800/60">
                                  <div>
                                    <span className="text-xs text-gray-550 block">رقم طلب متجر سلة</span>
                                    <span className="font-extrabold text-white text-base">#{o.orderNumber}</span>
                                  </div>
                                  <div className="text-left">
                                    <span className="text-xs text-gray-550 block text-left">شركة شحن سلة</span>
                                    <span className="font-bold text-brand-emerald bg-brand-emerald/10 px-2.5 py-0.5 rounded-full inline-block text-xs mt-0.5">{o.carrier}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                                  <p className="flex justify-between">
                                    <span className="text-gray-400">العميل:</span>
                                    <span className="text-white font-semibold">{o.customerName}</span>
                                  </p>
                                  <p className="flex justify-between">
                                    <span className="text-gray-400">الرمز / الجوال:</span>
                                    <span className="text-gray-300 font-mono">{o.customerPhone || "بريد إلكتروني فقط"}</span>
                                  </p>
                                  <p className="flex justify-between">
                                    <span className="text-gray-400">المدينة:</span>
                                    <span className="text-white font-semibold">{o.customerCity}</span>
                                  </p>
                                  <p className="flex justify-between">
                                    <span className="text-gray-400">تاريخ الشراء:</span>
                                    <span className="text-white">{o.orderDate}</span>
                                  </p>
                                  <p className="flex justify-between col-span-2 border-t border-gray-800/40 pt-2 text-[11px]">
                                    <span className="text-amber-500 font-bold">آخر تحديث من شركة الشحن:</span>
                                    <span className="text-amber-500 font-bold">{new Date(o.lastUpdate).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' })} ({Math.round((Date.now() - new Date(o.lastUpdate).getTime()) / (1000 * 3600 * 24))} يوم راكد)</span>
                                  </p>
                                </div>

                                {/* Simulated Automatic test send panel */}
                                <div className="bg-[#070d16] p-4 rounded-xl border border-gray-800/80 text-xs text-right space-y-3">
                                  <div>
                                    <span className="text-brand-teal text-[11px] font-extrabold block mb-1">الاعتذار التلقائي المقترح بذكاء رقيب:</span>
                                    <p className="text-gray-300 italic leading-relaxed text-[11px]">
                                      "{o.analysis?.customerMessage || `مرحباً ${o.customerName}، نعتذر لتأخر شحنتك الموجهة لـ ${o.customerCity} مع ناقل ${o.carrier}...`}"
                                    </p>
                                  </div>

                                  <div className="border-t border-gray-800/60 pt-2.5">
                                    <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">
                                      اطلب اختبار إرسال ومحاكاة رسالة الاعتذار والاطمئنان فوراً للعميل لدراسة محاذاة النص والـ SMS:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        onClick={() => handleSendTestAlert(o.id, 'sms')}
                                        className="bg-[#112240] text-[#a5f3fc] border border-cyan-900/40 py-2 rounded-lg font-bold text-[11px] hover:bg-cyan-950/20 transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                                        إرسال تنبيه SMS تجريبي
                                      </button>
                                      
                                      <button
                                        onClick={() => handleSendTestAlert(o.id, 'email')}
                                        className="bg-[#112240] text-[#a7f3d0] border border-emerald-900/40 py-2 rounded-lg font-bold text-[11px] hover:bg-emerald-950/20 transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                                      >
                                        <Clock className="w-3.5 h-3.5 text-brand-emerald" />
                                        إرسال بريد إلكتروني تجريبي
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => setSelectedOrderId(o.id)}
                                  className="w-full bg-[#112240] hover:bg-[#162c54] text-white border border-gray-800 transition-all py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  عرض كشف التحليل اللوجستي الكامل في شاشة مستقلة
                                  <ChevronLeft className="w-4 h-4" />
                                </button>

                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Column 2: Customer Dispatched alerts History */}
                      <div className="lg:col-span-5 space-y-5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-sm flex items-center gap-2">
                            🔔 سجل التنبيهات المرسلة تلقائياً ({alerts.length})
                          </h4>
                          <span className="text-xs text-gray-550">تحديث فوري لـ SMS والبريد</span>
                        </div>

                        <div className="bg-brand-navy rounded-2xl border border-gray-800 p-5 space-y-4">
                          <p className="text-xs text-gray-400 leading-normal text-right">
                            تعرض هذه القائمة كافة التنبيهات التي صدرت وأُرسِلت تلقائياً أو يدوياً للعملاء للتخفيف من غضب التأخير وتحسين العلاقة العامة.
                          </p>

                          {alerts.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 text-xs border border-dashed border-gray-800 rounded-xl">
                              لم يتم إطلاق أي تنبيهات شحن حتى الآن. اضغط على زر الفحص أو أرسل تنبيهاً تجريبياً من قائمة اليمين.
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                              {alerts.map((alert) => (
                                <div key={alert.id} className="bg-brand-dark p-3.5 rounded-xl border border-gray-800/50 text-right text-xs space-y-2">
                                  
                                  <div className="flex items-center justify-between pb-2 border-b border-gray-800/40">
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-white text-xs">#{alert.orderNumber} - {alert.customerName}</p>
                                      <p className="text-[10px] text-gray-500 font-mono text-left">{alert.recipient}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        alert.type === 'sms' 
                                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      }`}>
                                        {alert.channel}
                                      </span>
                                      {alert.isTest && (
                                        <span className="text-[9px] text-amber-400 font-semibold bg-amber-500/15 px-1.5 py-0.2 rounded">تنبيه تجاري تجريبي</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="bg-[#03070b] p-2.5 rounded-lg border border-gray-900 text-[11px] text-gray-300 leading-relaxed font-sans">
                                    {alert.message}
                                  </div>

                                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
                                      تم التسليم والوصول بنجاح ✓
                                    </span>
                                    <span className="font-mono text-gray-550">
                                      {new Date(alert.sentAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>

                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                )}


                {/* TAB 4: RETURNS PORTAL */}
                {currentTab === "returns" && (
                  <div className="space-y-6">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Form to submit return request */}
                      <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 space-y-4">
                        <h3 className="font-bold text-white text-base">تسجيل طلب إرجاع جديد</h3>
                        <p className="text-xs text-gray-400 leading-normal">
                          سجل طلب المرتجع المستلم من عميلك هنا وسيقوم محرك رقيب باتخاذ قرار القبول المبدئي وصياغة بوليصة الشحن المناسبة.
                        </p>

                        <form onSubmit={handleReturnSubmit} className="space-y-4 text-sm">
                          <div>
                            <label className="block text-xs font-bold text-gray-300 mb-1">رقم طلب متجر سلة</label>
                            <input 
                              type="text" 
                              required
                              value={newReturnOrderNum}
                              onChange={(e) => setNewReturnOrderNum(e.target.value)}
                              placeholder="مثال: 10982" 
                              className="w-full bg-brand-dark border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">يجب أن يتطابق مع رقم طلب للناقل مسجل بالمنصة.</p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-300 mb-1">سبب طلب الإرجاع للتجارة</label>
                            <textarea 
                              value={newReturnReason}
                              onChange={(e) => setNewReturnReason(e.target.value)}
                              placeholder="اكتب تفاصيل شكوى العميل عن المنتج..." 
                              rows={3}
                              className="w-full bg-brand-dark border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-emerald"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-300 mb-1">حالة غلاف وصحة المنتج</label>
                            <select 
                              value={newReturnCondition}
                              onChange={(e) => setNewReturnCondition(e.target.value)}
                              className="w-full bg-brand-dark border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                            >
                              <option value="سليم ومغلف">سليم ومغلف تماماً (حالة المصنع)</option>
                              <option value="تم فتحه وتجربته">تم فتحه وتجربته</option>
                              <option value="به عيب تصنيعي">به كسر أو تسريب عيب مصنعي</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="opened-chk"
                              checked={newReturnOpened}
                              onChange={(e) => setNewReturnOpened(e.target.checked)}
                              className="w-4 h-4 rounded border-gray-700 bg-brand-dark text-brand-emerald focus:ring-0 cursor-pointer"
                            />
                            <label htmlFor="opened-chk" className="text-xs text-gray-300 cursor-pointer">هل تم تمزيق أو نزع كرتون المنتج الخارجي؟</label>
                          </div>

                          <button 
                            type="submit" 
                            className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-extrabold py-3 rounded-xl text-xs transition-all cursor-pointer mt-2"
                          >
                            اتخاذ قرار مبدئي وحفظ
                          </button>
                        </form>
                      </div>

                      {/* Decided Returns lists */}
                      <div className="lg:col-span-2 bg-brand-navy p-6 rounded-2xl border border-gray-800 space-y-4">
                        <h3 className="font-bold text-white text-base">قرارات وإدارة المرتجعات النشطة</h3>
                        
                        <div className="space-y-4">
                          {returns.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-12">لا توجد طلبات مرتجعات نشطة حالياً.</p>
                          ) : (
                            returns.map((ret) => (
                              <div key={ret.id} className="p-5 bg-brand-dark rounded-xl border border-gray-800 space-y-3">
                                
                                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                                  <div>
                                    <span className="text-xs text-gray-400 block">رقم طلب المرتجع لـ {ret.customerName}</span>
                                    <span className="font-bold text-white">الطلب #{ret.orderNumber}</span>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                                    ret.decision === "قبول مبدئي" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                    ret.decision === "رفض مبدئي" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                    "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                  }`}>{ret.decision}</span>
                                </div>

                                <div className="text-xs space-y-1.5 text-gray-300">
                                  <p><strong>سبب العميل:</strong> {ret.reason}</p>
                                  <p><strong>حالة الغلاف:</strong> {ret.productCondition}</p>
                                  <p className="text-amber-500"><strong>تفسير قرار رقيب:</strong> {ret.decisionReason}</p>
                                </div>

                                <div className="bg-[#112240] p-3 rounded-lg border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                  <p className="text-gray-300 italic max-w-[80%]">"{ret.customerMessage}"</p>
                                  <button
                                    onClick={() => copyToClipboard(ret.customerMessage, "msg-ret-" + ret.id)}
                                    className="bg-brand-emerald text-brand-dark px-3 py-1.5 rounded font-extrabold text-[10px] shrink-0 text-center cursor-pointer"
                                  >
                                    نسخ رسالة تأكيد العميل
                                  </button>
                                </div>

                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                )}


                {/* TAB 5: MESSAGE TEMPLATE / GENERATOR */}
                {currentTab === "messages" && (
                  <div className="space-y-6">
                    <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 space-y-2">
                      <h3 className="font-bold text-white text-base">مكتبة قوالب رسائل الواتساب للتواصل مع العملاء</h3>
                      <p className="text-xs text-gray-400 leading-normal">
                        صممنا هذه الميزة لتساعدك على الحفاظ على نبرة احترافية موحدة في مراسلات متجرك. يمكنك تعديل النصوص وحفظها، أو استخدام المتغيرات الديناميكية مثل اسم العميل، والناقل، والمدينة.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {templates.map((t) => (
                        <div key={t.id} className="bg-brand-navy p-6 rounded-2xl border border-gray-800 flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
                              <h4 className="font-bold text-white text-sm">{t.title}</h4>
                              <span className="bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 text-[10px] px-2 py-0.5 rounded font-semibold">{t.tone}</span>
                            </div>

                            {editingTemplateId === t.id ? (
                              <div className="mt-3">
                                <textarea
                                  value={editingTemplateBody}
                                  onChange={(e) => setEditingTemplateBody(e.target.value)}
                                  className="w-full bg-brand-dark border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                                  rows={5}
                                />
                                <div className="text-[10px] text-gray-500 mt-1 leading-normal">
                                  المتغيرات المدعومة: {" {customer_name}، {order_number}، {carrier}، {customer_city}، {store_name} "}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-300 mt-3 font-mono leading-relaxed whitespace-pre-wrap">
                                {t.body}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {editingTemplateId === t.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateTemplate(t.id)}
                                  className="bg-brand-emerald text-brand-dark px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  حفظ القالب
                                </button>
                                <button
                                  onClick={() => setEditingTemplateId(null)}
                                  className="bg-gray-800 text-gray-400 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                                >
                                  إلغاء
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingTemplateId(t.id);
                                    setEditingTemplateBody(t.body);
                                  }}
                                  className="bg-[#112240] text-gray-300 hover:text-white hover:border-brand-emerald/40 border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                >
                                  تعديل النص
                                </button>
                                <button
                                  onClick={() => copyToClipboard(t.body, "tmpl-" + t.id)}
                                  className="bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-3 py-1.5 rounded-lg text-xs font-extrabold hover:bg-brand-emerald/20 cursor-pointer"
                                >
                                  نسخ القالب التجريبي
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}


                {/* TAB 6: MANUAL IMPORT (CSV / PASTE DATA) */}
                {currentTab === "upload" && (
                  <div className="space-y-6">
                    <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 space-y-3">
                      <h3 className="font-bold text-white text-base">استيراد وتحليل شحنات سلة يدوياً (CSV)</h3>
                      <p className="text-xs text-gray-400 leading-normal">
                        إذا لم ترغب في ربط متجرك بسلة عبر مفاتيح الـ API الفورية حتى الآن، يمكنك ببساطة نسخ ولصق بيانات طلبياتك هنا بصيغة CSV أو تسلسل نصي وسيقوم رقيب بتحليلها وصياغة الردود آلياً.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      <div className="md:col-span-2 bg-brand-navy p-6 rounded-2xl border border-gray-800 space-y-4">
                        <h4 className="font-bold text-white text-sm">مربع إدخال البيانات ولصق الـ CSV</h4>
                        
                        <form onSubmit={handleCSVUpload} className="space-y-4">
                          <textarea
                            value={csvContent}
                            onChange={(e) => setCsvContent(e.target.value)}
                            placeholder="order_id,customer_name,phone,city,carrier,order_date,status,last_update,total,return_requested
10992,أحمد الشهري,966509988221,الرياض,أرامكس,2026-06-20,متأخر,2026-06-22,340,false
10993,فيصل القحطاني,966551122334,مكة,سمسا,2026-06-19,تم الشحن,2026-06-21,180,false"
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl p-4 font-mono text-xs text-white focus:outline-none focus:border-brand-emerald"
                            rows={10}
                          />

                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setCsvContent(`order_id,customer_name,phone,city,carrier,order_date,status,last_update,total,return_requested
10995,نواف الحربي,966539988771,جدة,SPL,2026-06-20,متأخر,2026-06-21,450.0,false
10996,نورة المقرن,966504433221,حائل,أرامكس,2026-06-18,مكتمل,2026-06-20,290.0,true`)}
                              className="text-xs text-brand-teal hover:underline font-semibold cursor-pointer"
                            >
                              إدراج مثال توضيحي جاهز للنسخ
                            </button>

                            <button
                              type="submit"
                              className="bg-brand-emerald text-brand-dark px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <UploadIcon className="w-4 h-4" />
                              بدء الاستيراد والتحليل آلياً
                            </button>
                          </div>
                        </form>
                      </div>

                      <div className="bg-[#0c1421] p-6 rounded-2xl border border-gray-800 text-right space-y-4">
                        <h4 className="font-bold text-white text-sm">إرشادات تنسيق ملف الـ CSV</h4>
                        <div className="text-xs text-gray-400 space-y-2.5 leading-relaxed">
                          <p>١. يجب أن يحتوي السطر الأول على أسماء الأعمدة تماماً كما هو موضح بالمثال.</p>
                          <p>٢. القيم المطلوبة تشمل:</p>
                          <ul className="list-disc list-inside mr-2 text-[11px] text-gray-500">
                            <li>رقم الطلب (order_id)</li>
                            <li>اسم العميل (customer_name)</li>
                            <li>الجوال (phone)</li>
                            <li>المدينة (city)</li>
                            <li>الناقل (carrier) مثل: سمسا، أرامكس، ناقل</li>
                            <li>الحالة (status) مثل: متأخر، تم الشحن</li>
                          </ul>
                          <p>٣. بمجرد الحفظ والتحليل، سيعمل محرك الذكاء الاصطناعي لرقيب على حساب نسب المخاطرة وبناء المتابعات فورياً.</p>
                        </div>
                      </div>

                    </div>

                  </div>
                )}


                {/* TAB 7: SETTINGS & POLICIES */}
                {currentTab === "settings" && (
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      
                      <div className="space-y-4">
                        <h3 className="font-bold text-white text-base">سياسة المرتجعات اللوجستية للمتجر</h3>
                        
                        <div>
                          <label className="block text-xs font-bold text-gray-400 mb-1.5">المهلة المسموحة لإرجاع المنتجات (بالأيام)</label>
                          <input 
                            type="number" 
                            required
                            value={settings.returnDays}
                            onChange={(e) => setSettings({ ...settings, returnDays: parseInt(e.target.value) || 7 })}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <input 
                            type="checkbox" 
                            id="set-opened"
                            checked={settings.openedReturnable}
                            onChange={(e) => setSettings({ ...settings, openedReturnable: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-700 bg-brand-dark text-brand-emerald focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="set-opened" className="text-xs text-gray-300 cursor-pointer">السماح بإرجاع المنتجات المفتوحة الأغلفة</label>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-normal">
                          في حال التعطيل (مستحسن لمتاجر العطور ومستحضرات التجميل)، سيبدي الإيجنت رفضًا مبدئيًا آليًا في تفاصيل الإرجاع لتفادي خسائر التاجر.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-white text-base">مدة الشحن المتوقعة وتنبيهات التأخّير</h3>
                        
                        <div>
                          <label className="block text-xs font-bold text-gray-400 mb-1.5">مدة الشحن المتوقعة لإيصال الطرود (بالأيام)</label>
                          <input 
                            type="number" 
                            required
                            value={settings.expectedDays}
                            onChange={(e) => setSettings({ ...settings, expectedDays: parseInt(e.target.value) || 3 })}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 mb-1.5">رقم الواتساب المتصل بالمتجر لتوجيه الردود إليه</label>
                          <input 
                            type="text" 
                            required
                            value={settings.whatsappNumber}
                            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                            placeholder="966501234567"
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 border-t border-gray-800/60 pt-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-brand-teal" />
                          <h3 className="font-bold text-white text-base">محرك تنبيهات العملاء التلقائية للشحنات المتأخرة بعد 24 ساعة</h3>
                        </div>
                        <p className="text-xs text-gray-450 leading-relaxed text-right">
                          يرسل رقيب التجارية آلياً رسائل اعتذار وتحديثات تنبيهية ذكية إلى عملائك المتأثرين بتأخر شحناتهم (أكثر من ٢٤ ساعة مثلاً) لمنع تقديم الشكاوى واستباق المشاكل بأسلوبه اللبق. يدمج طاقة الذكاء الاصطناعي من Gemini لتحوير الأسلوب وصياغته بطابع سعودي ترحيبي رائع.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                          <div className="space-y-3 bg-[#09101d] p-4 rounded-xl border border-gray-801">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                id="set-email-alerts"
                                checked={settings.enableEmailAlerts}
                                onChange={(e) => setSettings({ ...settings, enableEmailAlerts: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-700 bg-brand-dark text-brand-emerald focus:ring-0 cursor-pointer"
                              />
                              <label htmlFor="set-email-alerts" className="text-xs font-bold text-gray-200 cursor-pointer">تفعيل التنبيه بالبريد الإلكتروني</label>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-normal">
                              إرسال بريد إلكتروني تلقائي للعميل يتضمن تفاصيل شحنته واعتذاره اللبق عن التأخير.
                            </p>
                          </div>

                          <div className="space-y-3 bg-[#09101d] p-4 rounded-xl border border-gray-801">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                id="set-sms-alerts"
                                checked={settings.enableSMSAlerts}
                                onChange={(e) => setSettings({ ...settings, enableSMSAlerts: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-700 bg-brand-dark text-brand-emerald focus:ring-0 cursor-pointer"
                              />
                              <label htmlFor="set-sms-alerts" className="text-xs font-bold text-gray-200 cursor-pointer">تفعيل التنبيه عبر رسائل SMS</label>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-normal">
                              إرسال رسالة نصية قصيرة فورية لجوال العميل تخفف قلقه بشأن حالة شحنته المتأخرة لدى شركة الشحن.
                            </p>
                          </div>

                          <div className="space-y-1.5 bg-[#09101d] p-4 rounded-xl border border-gray-801">
                            <label className="block text-xs font-bold text-gray-300">مهلة إرسال التنبيه (بالساعات من تاريخ آخر تحديث)</label>
                            <input 
                              type="number" 
                              required
                              min="1"
                              value={settings.alertDelayThresholdHours}
                              onChange={(e) => setSettings({ ...settings, alertDelayThresholdHours: parseInt(e.target.value) || 24 })}
                              className="w-full bg-brand-dark border border-gray-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-brand-emerald"
                            />
                            <p className="text-[10px] text-gray-500 leading-normal">
                              يتم تفعيل التنبيه آلياً بمجرد تجاوز مدة التأخير لهذه المهلة المحددة (ساعة).
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-300">قالب البريد الإلكتروني الاعتذاري الافتراضي</label>
                            <textarea 
                              rows={3}
                              value={settings.emailTemplateBody || "شريكنا العزيز {customer_name}، شحنتك رقم {order_number} المتجهة إلى {customer_city} مع الناقل {carrier} قد تتأخر قليلاً عن الموعد المعتاد بـ 24 ساعة. نعمل جاهدين لتسليمها بأسرع وقت."}
                              onChange={(e) => setSettings({ ...settings, emailTemplateBody: e.target.value })}
                              className="w-full bg-[#060b13] border border-gray-800 rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-brand-emerald focus:ring-0"
                              placeholder="محتوى البريد مع استخدام {customer_name}, {order_number}, {carrier}, {customer_city}..."
                            />
                            <p className="text-[10px] text-gray-500 leading-normal">
                              متاح استخدام المتغيرات التلقائية: <code className="text-brand-teal font-mono">{`{customer_name}`}</code>، <code className="text-brand-teal font-mono">{`{order_number}`}</code>، <code className="text-brand-teal font-mono">{`{carrier}`}</code>، <code className="text-brand-teal font-mono">{`{customer_city}`}</code>. سيقوم Gemini بتحسين الصياغة وإثرائها بأسلوبه اللغوي.
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-300">قالب رسائل SMS الاعتذاري الافتراضي</label>
                            <textarea 
                              rows={3}
                              value={settings.smsTemplateBody || "عميلنا العزيز {customer_name}، نعتذر عن تأخر شحنتك مع {carrier} رقم {order_number}. نعمل على تصعيدها وتسليمها لك عاجلاً."}
                              onChange={(e) => setSettings({ ...settings, smsTemplateBody: e.target.value })}
                              className="w-full bg-[#060b13] border border-gray-800 rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-brand-emerald focus:ring-0"
                              placeholder="محتوى رسالة الجوال SMS..."
                            />
                            <p className="text-[10px] text-gray-500 leading-normal">
                              متاح استخدام المتغيرات التلقائية لتوليد رسائل مخصصة سريعة تفاعلية مع ايموجيات مطمئنة.
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>

                    <button 
                      type="submit" 
                      className="bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      حفظ إعدادات وثاق المتجر وتنبيهات العملاء
                    </button>
                  </form>
                )}


                {/* TAB 8: PRICING / BILLING */}
                {currentTab === "billing" && (
                  <div className="space-y-6">
                    <div className="text-center py-6">
                      <h3 className="text-2xl font-bold text-white mb-2">خطط الاشتراك وباقات رقيب التجارة لمتاجر سلة</h3>
                      <p className="text-gray-400 text-sm max-w-xl mx-auto">
                        اختر الباقة المناسبة لحجم طلبياتك ومبيعات متجرك الشهري. ابدأ بالتجربة المجانية وقم بالترقية بأي وقت لاحقًا.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
                      
                      {/* Starter Card */}
                      <div className="bg-brand-navy p-6 rounded-2xl border border-gray-805 text-right flex flex-col justify-between gap-6 relative">
                        <div className="space-y-4">
                          <span className="text-brand-emerald font-bold text-xs bg-brand-emerald/10 border border-brand-emerald/20 px-2.5 py-0.5 rounded-full inline-block">باقة البداية Starter</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-white">199 ريال</span>
                            <span className="text-xs text-gray-400">/ شهريًا</span>
                          </div>
                          
                          <p className="text-xs text-gray-300 leading-normal">مثالية للمتاجر الناشئة التي تسعى لإبقاء مبيعاتها الأولى بعيدة عن المشاكل لوجستياً.</p>
                          
                          <ul className="text-xs space-y-2.5 text-gray-400">
                            <li>✓ حتى 300 طلب شهرياً</li>
                            <li>✓ مراقبة الشحنات المتأخرة والراكدة</li>
                            <li>✓ نسخ قوالب رسائل الواتساب المعدة</li>
                            <li>✓ دعم فني عبر البريد الإلكتروني</li>
                          </ul>
                        </div>

                        <button className="w-full bg-[#112240] text-gray-300 font-bold py-2.5 rounded-xl text-xs hover:bg-brand-emerald hover:text-brand-dark transition-all cursor-pointer">البدء بالفترة التجريبية</button>
                      </div>

                      {/* Growth Card */}
                      <div className="bg-brand-navy p-6 rounded-2xl border-2 border-brand-emerald text-right flex flex-col justify-between gap-6 relative">
                        <div className="absolute -top-3 left-6 bg-brand-emerald text-brand-dark font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">الأكثر مبيعاً 🔥</div>
                        
                        <div className="space-y-4">
                          <span className="text-brand-emerald font-bold text-xs bg-brand-emerald/10 border border-brand-emerald/20 px-2.5 py-0.5 rounded-full inline-block">باقة النمو Growth</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-white">499 ريال</span>
                            <span className="text-xs text-gray-400">/ شهريًا</span>
                          </div>
                          
                          <p className="text-xs text-gray-300 leading-normal">الخيار الأمثل لمتاجر سلة المتوسطة والنشطة بمبيعات يومية كبرى.</p>
                          
                          <ul className="text-xs space-y-2.5 text-gray-400">
                            <li>✓ حتى 1000 طلب شهرياً</li>
                            <li>✓ تحليل المرتجعات بقواعد برودية مؤتمتة</li>
                            <li>✓ تنبيهات ذكية حية وتصنيف أولوية الخطورة</li>
                            <li>✓ مكتبة رسائل وقوالب متطورة للمتابعة</li>
                          </ul>
                        </div>

                        <button className="w-full bg-brand-emerald text-brand-dark font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer">ترقية الباقة الآن</button>
                      </div>

                      {/* Pro Card */}
                      <div className="bg-brand-navy p-6 rounded-2xl border border-gray-805 text-right flex flex-col justify-between gap-6 relative">
                        <div className="space-y-4">
                          <span className="text-brand-emerald font-bold text-xs bg-brand-emerald/10 border border-brand-emerald/20 px-2.5 py-0.5 rounded-full inline-block">باقة المحترفين Pro</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-white">999 ريال</span>
                            <span className="text-xs text-gray-400">/ شهريًا</span>
                          </div>
                          
                          <p className="text-xs text-gray-300 leading-normal">للشركات والمصانع ومتاجر سلة العملاقة التي تحتاج لمعالجة مستمرة.</p>
                          
                          <ul className="text-xs space-y-2.5 text-gray-400">
                            <li>✓ طلبات استيراد ومزامنة غير محدودة</li>
                            <li>✓ تقارير تحليلية ومؤشرات أداء متقدمة</li>
                            <li>✓ أكثر من تاجر ومستخدم معاً</li>
                            <li>✓ مدير حساب لوجستي سعودي مخصص</li>
                          </ul>
                        </div>

                        <button className="w-full bg-[#112240] text-gray-300 font-bold py-2.5 rounded-xl text-xs hover:bg-brand-emerald hover:text-brand-dark transition-all cursor-pointer">طلب نسخة مخصصة</button>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
