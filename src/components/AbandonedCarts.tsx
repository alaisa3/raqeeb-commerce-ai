import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  Sparkles, 
  MessageCircle, 
  Ticket, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Clock, 
  ChevronLeft, 
  AlertCircle,
  Copy,
  Check,
  Zap,
  RefreshCcw,
  User,
  Phone
} from "lucide-react";

interface AbandonedCart {
  id: string;
  cartNumber: string;
  customerName: string;
  customerPhone: string;
  cartValue: number;
  abandonedAt: string;
  status: "abandoned" | "recovered" | "communicated";
  priority: "high" | "medium" | "low";
  products: string;
  analysis?: string; // stringified { advice, draftedMsg }
  couponCode?: string;
}

interface AbandonedCartsProps {
  showToast: (message: string, type?: "success" | "error") => void;
  addLog: (log: string) => void;
  onRefreshAll?: () => void;
}

export default function AbandonedCarts({ showToast, addLog, onRefreshAll }: AbandonedCartsProps) {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [recoveringId, setRecoveringId] = useState<string | null>(null);
  const [couponingId, setCouponingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeActionTab, setActiveActionTab] = useState<"reminder" | "discount" | "call" | "ai">("reminder");
  const [customReminderMsg, setCustomReminderMsg] = useState<string>("");
  const [customDiscountMsg, setCustomDiscountMsg] = useState<string>("");

  // Populate custom messages when selected cart changes or receives coupon code or analysis
  useEffect(() => {
    if (selectedCart) {
      const analysisData = getAnalysisData(selectedCart.analysis);
      if (analysisData && analysisData.draftedMsg) {
        setCustomReminderMsg(analysisData.draftedMsg);
        setCustomDiscountMsg(analysisData.draftedMsg);
      } else {
        setCustomReminderMsg(
          `مرحبًا يا ${selectedCart.customerName} 🌸\nيسعدنا تواصلك مع متجرنا! لاحظنا أن المنتجات المميزة أدناه لا زالت بانتظارك في سلتك المتروكة:\n- ${selectedCart.products}\n\nحرصاً عليك، حجزنا المنتجات لك لضمان عدم نفاد الكمية. تفضل بالعودة لإكمال طلبك بأمان وسهولة بلمسة زر واحدة!\n\nيومك سعيد ونسعد بخدمتك دائماً ✨`
        );
        
        const code = selectedCart.couponCode || "RAQEEB10";
        setCustomDiscountMsg(
          `مرحبًا يا ${selectedCart.customerName} 🌸\nعساك بخير! لاحظنا أنك نسيت بعض المنتجات الرائعة في سلتك وتمنّينا تقتنيها.\n\nعشان نسهلها عليك ونقدّر رغبتك بالمنتج، سوينا لك كود خصم مخصص [ ${code} ] يعطيك خصم فوري على سلتك المتروكة!\n\nانسخ الكوبون وكمل طلبك الحين لضمان حجز القطع قبل نفاد الكمية. تسعدنا خدمتك دائماً ❤️`
        );
      }
    }
  }, [selectedCart, selectedCart?.couponCode, selectedCart?.analysis]);

  // Fetch Carts
  const fetchCarts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/abandoned-carts");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCarts(data);
      }
    } catch (err) {
      console.error("Error fetching abandoned carts:", err);
      showToast("فشل تحميل بيانات السلات المتروكة", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  // Compute stats
  const totalCarts = carts.length;
  const abandonedToday = carts.filter(c => {
    return c.status === "abandoned" || c.status === "communicated";
  }).length;

  const lostSalesValue = carts
    .filter(c => c.status !== "recovered")
    .reduce((sum, c) => sum + c.cartValue, 0);

  const recoveredSalesValue = carts
    .filter(c => c.status === "recovered")
    .reduce((sum, c) => sum + c.cartValue, 0);

  const recoveredCartsCount = carts.filter(c => c.status === "recovered").length;
  const recoveryRate = totalCarts > 0 ? Math.round((recoveredCartsCount / totalCarts) * 100) : 0;

  // Handle Mark as Recovered
  const handleMarkAsRecovered = async (id: string, cartNumber: string, customerName: string) => {
    setRecoveringId(id);
    try {
      const res = await fetch(`/api/abandoned-carts/${id}/recover`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(`تم تحديث حالة السلة #${cartNumber} إلى مسترجعة بنجاح! 🎉`);
        addLog(`[السلات المتروكة] تم استرجاع مبيعات السلة #${cartNumber} للعميل ${customerName}`);
        fetchCarts();
        if (onRefreshAll) onRefreshAll();
        if (selectedCart?.id === id) {
          setSelectedCart({ ...selectedCart, status: "recovered" });
        }
      }
    } catch (err) {
      showToast("حدث خطأ في عملية استرجاع السلة", "error");
    } finally {
      setRecoveringId(null);
    }
  };

  // Handle Generate Coupon
  const handleGenerateCoupon = async (id: string, cartNumber: string, customerName: string) => {
    setCouponingId(id);
    try {
      const res = await fetch(`/api/abandoned-carts/${id}/coupon`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(`تم إنشاء الكوبون الخاص للعميل ${customerName}: ${data.code} 🎫`);
        addLog(`[السلات المتروكة] تم توليد كود خصم جديد ${data.code} للسلة #${cartNumber}`);
        fetchCarts();
        if (selectedCart?.id === id) {
          setSelectedCart({ ...selectedCart, couponCode: data.code });
        }
      }
    } catch (err) {
      showToast("فشل إنشاء كوبون الخصم", "error");
    } finally {
      setCouponingId(null);
    }
  };

  // Handle Analyze Cart
  const handleAnalyzeCart = async (cart: AbandonedCart) => {
    setAnalyzingId(cart.id);
    try {
      const res = await fetch(`/api/abandoned-carts/${cart.id}/analyze`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        const updatedCart = {
          ...cart,
          analysis: JSON.stringify({ advice: data.advice, draftedMsg: data.draftedMsg })
        };
        setSelectedCart(updatedCart);
        setCarts(prev => prev.map(c => c.id === cart.id ? updatedCart : c));
        showToast("اكتمل تحليل رقيب الذكي للسلة بنجاح! 🧠✨");
        addLog(`[تحليل رقيب] تحليل ذكي متكامل للسلة المتروكة #${cart.cartNumber} لصالح ${cart.customerName}`);
      }
    } catch (err) {
      showToast("فشل تحليل السلة بالذكاء الاصطناعي", "error");
    } finally {
      setAnalyzingId(null);
    }
  };

  // Handle Demo Auto Send (WhatsApp)
  const handleDemoAutoSend = async (id: string, message: string, cartNumber: string, customerName: string) => {
    setSendingId(id);
    try {
      const res = await fetch(`/api/abandoned-carts/${id}/send-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`تم إطلاق التنبيه والاتصال التلقائي بنجاح! 🚀`);
        addLog(`[واتساب السلات] تم محاكاة إرسال رسالة استرجاع للعميل ${customerName} للسلة #${cartNumber}`);
        fetchCarts();
        if (onRefreshAll) onRefreshAll();
        if (selectedCart?.id === id) {
          setSelectedCart({ ...selectedCart, status: "communicated" });
        }
      }
    } catch (err) {
      showToast("خطأ في الاتصال وإطلاق التنبيه المباشر", "error");
    } finally {
      setSendingId(null);
    }
  };

  // Click to Chat WhatsApp
  const handleWhatsAppClickToChat = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Helper: Copy code
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("تم النسخ بنجاح!");
  };

  // Parse analysis object
  const getAnalysisData = (analysisStr?: string) => {
    if (!analysisStr) return null;
    try {
      return JSON.parse(analysisStr);
    } catch (e) {
      return null;
    }
  };

  return (
    <div id="abandoned-carts-view" className="max-w-6xl mx-auto w-full space-y-6 text-right" dir="rtl">
      
      {/* Intro header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/10 text-brand-emerald rounded-2xl block">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            </span>
            مراقبة واستعادة السلات المتروكة
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            رصد فوري للسلات المتروكة في سلة، مع توفير تحليل ذكي من رقيب وصياغة رسائل واتساب تفاعلية وكوبونات خصم لاستعادتها.
          </p>
        </div>
        
        <button 
          onClick={fetchCarts} 
          disabled={loading}
          className="bg-[#112240] border border-gray-800 hover:border-brand-emerald/40 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          تحديث البيانات
        </button>
      </div>

      {/* STATS BENTO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-brand-navy p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-semibold">سلات متروكة اليوم</span>
            <span className="text-2xl font-bold text-white">{abandonedToday} سلة</span>
          </div>
        </div>

        <div className="bg-brand-navy p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-semibold">قيمة مبيعات مفقودة</span>
            <span className="text-2xl font-bold text-white">{lostSalesValue} ر.س</span>
          </div>
        </div>

        <div className="bg-brand-navy p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-brand-emerald rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-semibold">مبيعات مسترجعة</span>
            <span className="text-2xl font-bold text-white">{recoveredSalesValue} ر.س</span>
          </div>
        </div>

        <div className="bg-brand-navy p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-brand-teal rounded-xl shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-semibold">معدل الاسترجاع</span>
            <span className="text-2xl font-bold text-white">{recoveryRate}%</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CARTS TABLE */}
        <div className={`${selectedCart ? "lg:col-span-7" : "lg:col-span-12"} bg-brand-navy rounded-2xl border border-gray-800 overflow-hidden transition-all`}>
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">قائمة السلات المتروكة النشطة</h3>
            <span className="text-xs text-gray-400 font-semibold">{carts.length} سلة معروضة</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
              <RefreshCcw className="w-8 h-8 animate-spin text-brand-emerald" />
              <span className="text-xs">جاري جلب السلات المتروكة من متجر سلة...</span>
            </div>
          ) : carts.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-xs">
              لا توجد سلات متروكة في السجلات حالياً.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-brand-dark/20 border-b border-gray-800 text-gray-400 font-bold">
                    <th className="p-4">رقم السلة</th>
                    <th className="p-4">العميل</th>
                    <th className="p-4">قيمة السلة</th>
                    <th className="p-4">وقت الترك</th>
                    <th className="p-4">حالة السلة</th>
                    <th className="p-4">الأولوية</th>
                    <th className="p-4 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {carts.map((cart) => {
                    const isSelected = selectedCart?.id === cart.id;
                    const isRecovered = cart.status === "recovered";
                    const isCommunicated = cart.status === "communicated";
                    
                    return (
                      <tr 
                        key={cart.id} 
                        className={`hover:bg-brand-dark/50 transition-colors ${isSelected ? "bg-emerald-500/5" : ""}`}
                      >
                        <td className="p-4 font-mono font-bold text-white">
                          {cart.cartNumber}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-200 flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            {cart.customerName}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-gray-400" />
                            +{cart.customerPhone}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-white">
                          {cart.cartValue} ر.س
                        </td>
                        <td className="p-4 text-gray-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(cart.abandonedAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {new Date(cart.abandonedAt).toLocaleDateString("ar-SA")}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isRecovered ? "bg-emerald-500/10 text-brand-emerald border border-brand-emerald/20" :
                            isCommunicated ? "bg-sky-500/10 text-brand-teal border border-brand-teal/20" :
                            "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}>
                            {isRecovered ? "تم استرجاعها" : isCommunicated ? "جاري التواصل" : "متروكة"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            cart.priority === "high" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                            cart.priority === "medium" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            "bg-brand-dark/40 text-gray-400 border border-gray-800"
                          }`}>
                            {cart.priority === "high" ? "عالية" : cart.priority === "medium" ? "متوسطة" : "منخفضة"}
                          </span>
                        </td>
                        <td className="p-4 text-left">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap md:flex-nowrap">
                            
                            {/* Send Reminder button */}
                            <button
                              onClick={() => {
                                setSelectedCart(cart);
                                setActiveActionTab("reminder");
                              }}
                              title="ارسال رسالة تذكيرية"
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                                isSelected && activeActionTab === "reminder"
                                  ? "bg-brand-emerald text-brand-dark border-brand-emerald"
                                  : "bg-emerald-950/20 text-brand-emerald border border-brand-emerald/20 hover:bg-brand-emerald hover:text-brand-dark"
                              }`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>تذكير</span>
                            </button>

                            {/* Send Discount Code button */}
                            <button
                              onClick={() => {
                                setSelectedCart(cart);
                                setActiveActionTab("discount");
                              }}
                              title="ارسال كود خصم"
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                                isSelected && activeActionTab === "discount"
                                  ? "bg-amber-500 text-brand-dark border-amber-500"
                                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-brand-dark"
                              }`}
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              <span>كود خصم</span>
                            </button>

                            {/* View / AI Advice button */}
                            <button
                              onClick={() => {
                                setSelectedCart(cart);
                                setActiveActionTab("ai");
                              }}
                              title="إجراءات الاستعادة المتقدمة وتحليل رقيب"
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                                isSelected && activeActionTab === "ai"
                                  ? "bg-[#0ea5e9] text-brand-dark border-[#0ea5e9]"
                                  : "bg-[#112240] text-gray-300 hover:bg-[#0ea5e9] hover:text-brand-dark border border-gray-800"
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>تحليل</span>
                            </button>

                            {/* Mark recovered button */}
                            {!isRecovered && (
                              <button
                                onClick={() => handleMarkAsRecovered(cart.id, cart.cartNumber, cart.customerName)}
                                disabled={recoveringId === cart.id}
                                title="تحديد كـ تم الاسترجاع"
                                className="p-1.5 bg-[#112240] hover:bg-brand-emerald hover:text-brand-dark text-white border border-gray-800 rounded-lg cursor-pointer transition-all shrink-0"
                              >
                                {recoveringId === cart.id ? (
                                  <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5 text-brand-emerald" />
                                )}
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI ANALYSIS / ACTIONS DRAWER PANEL */}
        {selectedCart && (
          <div className="lg:col-span-5 bg-brand-navy rounded-2xl border border-gray-800 p-5 space-y-4 text-right animate-fade-in transition-all">
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div>
                <span className="text-[10px] text-brand-emerald font-bold block">خيارات وإجراءات استعادة السلة</span>
                <h4 className="font-bold text-white text-base">{selectedCart.customerName} (#{selectedCart.cartNumber})</h4>
              </div>
              <button 
                onClick={() => setSelectedCart(null)}
                className="text-gray-400 hover:text-white text-xs font-bold hover:bg-brand-dark p-1.5 rounded-lg transition-all"
              >
                إغلاق
              </button>
            </div>

            {/* Cart content & details */}
            <div className="bg-brand-dark p-4 rounded-xl border border-gray-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold">المنتجات في السلة:</span>
                <span className="font-bold text-gray-200 text-left truncate max-w-[200px]" title={selectedCart.products}>
                  {selectedCart.products}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold">قيمة السلة:</span>
                <span className="font-extrabold text-white">{selectedCart.cartValue} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold">رقم الجوال:</span>
                <span className="font-mono text-gray-200">+{selectedCart.customerPhone}</span>
              </div>
            </div>

            {/* TABS SELECTOR */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-brand-dark/60 border border-gray-800 rounded-xl text-center">
              <button
                onClick={() => setActiveActionTab("reminder")}
                className={`py-2.5 px-0.5 text-[10px] md:text-[11px] font-extrabold rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  activeActionTab === "reminder"
                    ? "bg-brand-emerald text-brand-dark shadow-sm font-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال تذكير</span>
              </button>
              <button
                onClick={() => setActiveActionTab("discount")}
                className={`py-2.5 px-0.5 text-[10px] md:text-[11px] font-extrabold rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  activeActionTab === "discount"
                    ? "bg-amber-500 text-brand-dark shadow-sm font-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>إرسال خصم</span>
              </button>
              <button
                onClick={() => setActiveActionTab("call")}
                className={`py-2.5 px-0.5 text-[10px] md:text-[11px] font-extrabold rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  activeActionTab === "call"
                    ? "bg-emerald-500 text-brand-dark shadow-sm font-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>اتصال هاتفي</span>
              </button>
              <button
                onClick={() => setActiveActionTab("ai")}
                className={`py-2.5 px-0.5 text-[10px] md:text-[11px] font-extrabold rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  activeActionTab === "ai"
                    ? "bg-[#0ea5e9] text-brand-dark shadow-sm font-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>تحليل رقيب</span>
              </button>
            </div>

            {/* TAB CONTENT: REMINDER */}
            {activeActionTab === "reminder" && (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
                  <span className="font-bold text-brand-emerald block">💬 إرسال رسالة تذكيرية لطيفة:</span>
                  <p className="text-gray-400 text-[11px]">
                    نوجه تذكير للعميل بالمنتجات التي تركها في السلة دون منحه أي خصومات في هذه المرحلة للحفاظ على هامش الربح.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400">نص رسالة التذكير (متاح للتعديل):</label>
                  <textarea
                    value={customReminderMsg}
                    onChange={(e) => setCustomReminderMsg(e.target.value)}
                    className="w-full h-32 text-xs bg-slate-950 text-slate-200 border border-gray-800 rounded-xl p-3 focus:border-brand-emerald focus:outline-none font-sans leading-relaxed resize-none"
                    dir="rtl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {/* Send via click-to-chat */}
                  <button
                    onClick={() => handleWhatsAppClickToChat(selectedCart.customerPhone, customReminderMsg)}
                    className="bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    مراسلة عبر واتساب
                  </button>

                  {/* Simulated auto send */}
                  <button
                    onClick={() => handleDemoAutoSend(selectedCart.id, customReminderMsg, selectedCart.cartNumber, selectedCart.customerName)}
                    disabled={sendingId === selectedCart.id}
                    className="bg-cyan-950/20 hover:bg-cyan-950/40 text-[#a5f3fc] border border-cyan-800/30 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    {sendingId === selectedCart.id ? (
                      <RefreshCcw className="w-4 h-4 animate-spin text-[#a5f3fc]" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-[#a5f3fc] animate-pulse" />
                        إرسال تلقائي تجريبي
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DISCOUNT */}
            {activeActionTab === "discount" && (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                  <span className="font-bold text-amber-500 block">🎫 إرسال كود خصم مخصص:</span>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    تحفيز العميل على الشراء بتقديم خصم مؤقت. كود الخصم الفوري يُعد أقوى وسيلة لإقناع المتسوقين المترددين.
                  </p>
                  
                  {/* Coupon generated banner */}
                  {selectedCart.couponCode ? (
                    <div className="flex justify-between items-center bg-brand-dark p-2 rounded-lg border border-amber-500/20 text-xs">
                      <span className="text-amber-500 font-bold flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5" />
                        الكوبون النشط:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono bg-[#112240] text-amber-500 px-2.5 py-0.5 rounded font-black border border-amber-500/10">
                          {selectedCart.couponCode}
                        </span>
                        <button 
                          onClick={() => handleCopyText(selectedCart.couponCode || "", "coupon-side-v2")}
                          className="p-1 hover:bg-brand-dark rounded text-gray-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateCoupon(selectedCart.id, selectedCart.cartNumber, selectedCart.customerName)}
                      disabled={couponingId === selectedCart.id}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-brand-dark py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all text-[11px] cursor-pointer"
                    >
                      {couponingId === selectedCart.id ? (
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Ticket className="w-3.5 h-3.5" />
                          توليد كود خصم مخصص بالذكاء الاصطناعي
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400">نص رسالة الخصم (متاح للتعديل):</label>
                  <textarea
                    value={customDiscountMsg}
                    onChange={(e) => setCustomDiscountMsg(e.target.value)}
                    className="w-full h-32 text-xs bg-slate-950 text-slate-200 border border-gray-800 rounded-xl p-3 focus:border-amber-500 focus:outline-none font-sans leading-relaxed resize-none"
                    dir="rtl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {/* Send via click-to-chat */}
                  <button
                    onClick={() => handleWhatsAppClickToChat(selectedCart.customerPhone, customDiscountMsg)}
                    className="bg-amber-500 hover:bg-amber-600 text-brand-dark py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    مراسلة عبر واتساب
                  </button>

                  {/* Simulated auto send */}
                  <button
                    onClick={() => handleDemoAutoSend(selectedCart.id, customDiscountMsg, selectedCart.cartNumber, selectedCart.customerName)}
                    disabled={sendingId === selectedCart.id}
                    className="bg-cyan-950/20 hover:bg-cyan-950/40 text-[#a5f3fc] border border-cyan-800/30 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    {sendingId === selectedCart.id ? (
                      <RefreshCcw className="w-4 h-4 animate-spin text-[#a5f3fc]" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-[#a5f3fc] animate-pulse" />
                        إرسال تلقائي تجريبي
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PHONE CALL */}
            {activeActionTab === "call" && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
                  <span className="font-bold text-brand-emerald block">📞 المتابعة بالاتصال الهاتفي المباشر:</span>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    الاتصال الهاتفي المباشر هو أفضل حل للسلات ذات القيمة العالية (أعلى من 300 ريال)، لحل مشكلات الدفع، الشحن، أو تقديم مبيعات استشارية للعميل.
                  </p>
                </div>

                <div className="bg-brand-dark border border-gray-800 rounded-xl p-4 space-y-2 text-center">
                  <p className="text-gray-300">رقم جوال العميل للاتصال السريع:</p>
                  <p className="text-lg font-mono font-black text-white">+{selectedCart.customerPhone}</p>
                </div>

                <div className="space-y-2 font-bold">
                  <a
                    href={`tel:${selectedCart.customerPhone}`}
                    className="w-full bg-[#10b981] hover:bg-[#059669] text-brand-dark py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all text-center"
                  >
                    <Phone className="w-4 h-4" />
                    بدء اتصال هاتفي مباشر
                  </a>

                  {selectedCart.status !== "recovered" && (
                    <button
                      onClick={() => handleMarkAsRecovered(selectedCart.id, selectedCart.cartNumber, selectedCart.customerName)}
                      disabled={recoveringId === selectedCart.id}
                      className="w-full bg-[#112240] hover:bg-brand-emerald hover:text-brand-dark border border-gray-800 text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      {recoveringId === selectedCart.id ? (
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-brand-emerald" />
                          تسجيل السلة كـ "مسترجعة بنجاح"
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: AI ANALYSIS */}
            {activeActionTab === "ai" && (
              <div className="space-y-4 animate-fade-in text-xs">
                {selectedCart.analysis ? (
                  (() => {
                    const data = getAnalysisData(selectedCart.analysis);
                    if (!data) return null;
                    return (
                      <div className="space-y-4">
                        
                        {/* Raqeeb Smart advice */}
                        <div className="bg-brand-dark border border-gray-800 rounded-xl p-4 space-y-2">
                          <h5 className="font-extrabold text-[#0ea5e9] text-xs flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-[#0ea5e9] animate-pulse" />
                            نصيحة رقيب لاسترجاع العميل:
                          </h5>
                          <p className="text-xs text-gray-300 leading-relaxed">
                            {data.advice}
                          </p>
                        </div>

                        {/* WhatsApp template content */}
                        <div className="bg-slate-950 text-slate-200 rounded-xl p-4 border border-gray-800 space-y-2.5 relative">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-gray-800 pb-2">
                            <span className="flex items-center gap-1 font-semibold text-brand-emerald">
                              <MessageCircle className="w-3.5 h-3.5" />
                              رسالة المقترح الذكي باللهجة السعودية:
                            </span>
                            <button
                              onClick={() => handleCopyText(data.draftedMsg, "draft-msg-v2")}
                              className="flex items-center gap-1 hover:text-white transition-all cursor-pointer font-bold bg-gray-850 px-2 py-1 rounded border border-gray-800"
                            >
                              {copiedId === "draft-msg-v2" ? (
                                <>
                                  <Check className="w-3 h-3 text-brand-emerald" />
                                  <span>تم النسخ!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-gray-400" />
                                  <span>نسخ الرسالة</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          <p className="text-xs font-sans whitespace-pre-line leading-relaxed select-all">
                            {data.draftedMsg}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-bold">
                          <button
                            onClick={() => handleWhatsAppClickToChat(selectedCart.customerPhone, data.draftedMsg)}
                            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-brand-dark py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                          >
                            <MessageCircle className="w-4 h-4" />
                            فتح دردشة واتساب
                          </button>

                          <button
                            onClick={() => handleDemoAutoSend(selectedCart.id, data.draftedMsg, selectedCart.cartNumber, selectedCart.customerName)}
                            disabled={sendingId === selectedCart.id}
                            className="w-full bg-cyan-950/20 hover:bg-cyan-950/40 text-[#a5f3fc] border border-cyan-800/30 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                          >
                            {sendingId === selectedCart.id ? (
                              <RefreshCcw className="w-4 h-4 animate-spin text-[#a5f3fc]" />
                            ) : (
                              <>
                                <Zap className="w-4 h-4 text-[#a5f3fc] animate-pulse" />
                                إرسال تلقائي تجريبي
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    );
                  })()
                ) : (
                  <div className="p-6 bg-brand-dark rounded-xl border border-dashed border-gray-800 text-center space-y-3">
                    <p className="text-xs text-gray-300">
                      لم يتم تشغيل فحص رقيب الذكي لهذه السلة حتى الآن. اضغط على الزر أدناه لتلقين رقيب بالذكاء الاصطناعي وصياغة العرض الأمثل.
                    </p>
                    <button
                      onClick={() => handleAnalyzeCart(selectedCart)}
                      disabled={analyzingId === selectedCart.id}
                      className="bg-[#0ea5e9] hover:bg-[#0284c7] text-brand-dark font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 justify-center mx-auto cursor-pointer shadow-md transition-all w-full"
                    >
                      {analyzingId === selectedCart.id ? (
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-brand-dark animate-bounce" />
                          تشغيل فحص وتحليل رقيب الذكي
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
