import React from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";

interface WhatsAppAutomationProps {
  settings: any;
  setSettings: (s: any) => void;
  wsInputNumber: string;
  setWsInputNumber: (num: string) => void;
  formatSaudiPhoneNumber: (phone: string) => string;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  addLog: (msg: string) => void;
  alerts: any[];
  handleResetDemoData: () => void;
}

export default function WhatsAppAutomation({
  settings,
  setSettings,
  wsInputNumber,
  setWsInputNumber,
  formatSaudiPhoneNumber,
  showToast,
  addLog,
  alerts,
  handleResetDemoData,
}: WhatsAppAutomationProps) {
  return (
    <div className="space-y-6">
      
      {/* TRIAL/DEMO NOTIFICATION BANNER */}
      <div className="bg-[#112d24]/50 border border-[#1b503e]/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-emerald text-right">
            <MessageCircle className="w-5 h-5" />
            <h4 className="font-bold text-sm">بيئة المطور التجريبية وقسم واتساب التلقائي الذكي</h4>
          </div>
          <p className="text-xs text-gray-300 leading-normal text-right">
            هذه البيئة التفاعلية تحاكي بالكامل الاتصال السحابي بـ <span className="font-bold text-brand-emerald">WhatsApp Business API</span>. عند تفعيل الرقم تجده يعمل ضمن نطاق Sandbox تجريبي لرسائل العملاء لضمان الاستقرار والتجربة اللحظية.
          </p>
        </div>
        <button
          onClick={handleResetDemoData}
          className="shrink-0 bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark font-extrabold text-[11px] px-3.5 py-2 rounded-xl transition-all cursor-pointer"
        >
          استعادة بيانات السجل التلقائي الافتراضية
        </button>
      </div>

      {/* CONNECTION STATUS & USAGE CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
        
        {/* Connection card */}
        <div className="lg:col-span-4 bg-brand-navy p-6 rounded-2xl border border-gray-800 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brand-emerald" />
                <h3 className="font-bold text-white text-sm">حالة واتساب</h3>
              </div>
              {settings.whatsappConnected ? (
                <span className="bg-brand-emerald/10 text-brand-emerald text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 border border-brand-emerald/20">
                  <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
                  متصل تجريبيًا
                </span>
              ) : (
                <span className="bg-red-500/10 text-red-400 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 border border-red-500/20">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  غير متصل
                </span>
              )}
            </div>

            {!settings.whatsappConnected ? (
              <div className="space-y-4 text-xs">
                <p className="text-gray-400 leading-relaxed text-[11px]">
                  اربط رقم واتساب متجرك الآن لتلقين عملائك رسائل تأكيد الشحنات وحالة المرتجعات تلقائياً.
                </p>
                <div className="space-y-2">
                  <label className="block font-bold text-gray-300">رقم واتساب المتجر (العميل)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={wsInputNumber}
                      onChange={(e) => setWsInputNumber(e.target.value)}
                      placeholder="مثال: 05xxxxxxxx"
                      className="w-full bg-brand-dark border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-emerald font-mono placeholder:text-gray-600 text-right"
                    />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const clean = formatSaudiPhoneNumber(wsInputNumber);
                    if (!clean || clean.length < 9) {
                      showToast("رقم الجوال غير صالح لحساب سلة", "error");
                      return;
                    }
                    const newSettings = {
                      ...settings,
                      whatsappNumber: clean,
                      whatsappConnected: true
                    };
                    try {
                      const res = await fetch("/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newSettings)
                      });
                      if (res.ok) {
                        setSettings(newSettings);
                        showToast("تم ربط رقم واتساب المتجر بنجاح لوضع التجريبي!");
                        addLog(`[ربط واتساب] تم ربط وتجربة الرقم ${clean} بنجاح بالمنصة`);
                      }
                    } catch (e) {
                      showToast("خطأ بالخادم", "error");
                    }
                  }}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-brand-dark hover:scale-[1.01] transition-all font-extrabold py-3 rounded-xl cursor-pointer"
                >
                  ربط رقم واتساب المتجر
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-right">
                <div className="p-3 bg-brand-dark rounded-xl border border-gray-800 space-y-1">
                  <span className="text-[10px] text-gray-500 block">الرقم المتصل حالياً بالـ API:</span>
                  <span className="font-mono text-white text-sm font-bold block">+{settings.whatsappNumber}</span>
                </div>
                
                <p className="text-[11px] text-gray-400 leading-normal">
                  إذا أردت تغيير الرقم المرتبط، يمكنك فصله وإلغاء تهيئته وإعادة ربط رقم مختلف فوراً.
                </p>

                <button
                  onClick={async () => {
                    const newSettings = {
                      ...settings,
                      whatsappNumber: "",
                      whatsappConnected: false
                    };
                    try {
                      const res = await fetch("/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newSettings)
                      });
                      if (res.ok) {
                        setSettings(newSettings);
                        setWsInputNumber("");
                        showToast("تم إلغاء ربط رقم الواتساب وفصل القنوات");
                        addLog("[ربط واتساب] تم إلغاء ربط رقم هاتف المتجر");
                      }
                    } catch (e) {
                      showToast("خطأ بالخادم", "error");
                    }
                  }}
                  className="w-full bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/40 py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء ربط وتغيير الرقم المتصل
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] text-gray-500 italic leading-relaxed text-right border-t border-gray-800/60 pt-3">
            🔒 ملاحظة: هذه نسخة تجريبية، وسيتم ربط الإرسال الرسمي عبر WhatsApp Business API لاحقًا بالتنسيق المباشر.
          </div>
        </div>

        {/* Line chart of last 30 days WhatsApp usage */}
        <div className="lg:col-span-8 bg-brand-navy p-6 rounded-2xl border border-gray-800 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div>
                <h3 className="font-bold text-white text-sm">حجم استخدام الرسائل المعتمد مقابل المتبقي</h3>
                <span className="text-[11px] text-gray-400">منحنى مراسلات الـ 30 يوماً الماضية تتبعاً للباقة والرسائل المكتملة</span>
              </div>
              <span className="bg-cyan-950 text-[#a5f3fc] border border-cyan-800/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold">باقة النمو الربعية</span>
            </div>

            <div className="h-[200px] mt-4 text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { Day: "يوم 1", sent: 12, remaining: 1988 },
                    { Day: "يوم 5", sent: 48, remaining: 1952 },
                    { Day: "يوم 10", sent: 82, remaining: 1918 },
                    { Day: "يوم 15", sent: 128, remaining: 1872 },
                    { Day: "يوم 20", sent: 185, remaining: 1815 },
                    { Day: "يوم 25", sent: 242, remaining: 1758 },
                    { Day: "يوم 30", sent: 278, remaining: 1722 },
                  ]}
                  margin={{ top: 10, right: -15, left: -20, bottom: 0 }}
                  className="text-right"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#112240" />
                  <XAxis dataKey="Day" stroke="#4b5563" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0a192f", borderColor: "#1f2937", borderRadius: "12px", color: "white" }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line name="الرسائل المرسلة من الباقة" type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line name="الرصيد المتبقي بالباقة" type="monotone" dataKey="remaining" stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Usage progress display */}
          <div className="bg-[#0b131e] p-3 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-gray-300">معدل الاستهلاك الإجمالي لرسائل هذا الشهر:</p>
              <div className="flex items-center gap-2">
                <div className="w-56 bg-brand-dark h-2 rounded-full overflow-hidden border border-gray-800">
                  <div className="bg-brand-emerald h-full rounded-full" style={{ width: `${(128 / 2000) * 100}%` }}></div>
                </div>
                <span className="font-bold text-white">128 من 2000 رسالة</span>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 text-left">أيام التجديد التلقائي المتبقية للقالب: 18 يومًا</span>
          </div>
        </div>

      </div>

      {/* AUTOMATIC operational Message settings & SAFETY RULES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
        
        {/* Column Line 1: Auto operations switches */}
        <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
            <MessageCircle className="w-5 h-5 text-brand-emerald" />
            <h3 className="font-bold text-white text-sm">الإرسال التلقائي لمسارات الشحن</h3>
          </div>
          
          <p className="text-xs text-gray-400 leading-normal">
            فعل مفاتيح الإرسال الذكية لطلب رقيب إطلاق رسالة واتساب آلية مطمئنة للعميل فور تحقيق شروط المسار أدناه:
          </p>

          <div className="space-y-3.5 text-xs">
            {[
              { key: "ws_send_delay", label: "إرسال رسالة آلية عند تأخر الشحنة اللوجستي" },
              { key: "ws_send_return_create", label: "إرسال رسالة ترحيبية عند إنشاء طلب إرجاع" },
              { key: "ws_send_return_approve", label: "إرسال رسالة قبول الإرجاع المبدئي وفهرسة القرار" },
              { key: "ws_send_return_reject", label: "إرسال رسالة اعتذار مفسر عند رفض الإرجاع مبدئيًا" },
              { key: "ws_send_return_photos", label: "إرسال رسالة تذكيرية عند الحاجة لطلب صور إضافية من العميل" },
              { key: "ws_send_status_update", label: "إرسال رسالة تحديث حالات الطلبات لشركة شحن سلة" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between p-2.5 hover:bg-brand-dark/30 rounded-xl border border-transparent hover:border-gray-800 cursor-pointer transition-all">
                <span className="text-gray-200">{item.label}</span>
                <input
                  type="checkbox"
                  checked={!!settings[item.key]}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings,
                      [item.key]: e.target.checked
                    };
                    setSettings(newSettings);
                    fetch("/api/settings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newSettings)
                    }).then(() => showToast("تم حفظ تفضيلات الإرسال بنجاح"));
                  }}
                  className="w-4 h-4 rounded border-gray-800 bg-brand-dark text-brand-emerald focus:ring-0 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Column Line 2: Protection / Safety constraints */}
        <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-white text-sm">قواعد الحماية وصحة المراسلات</h3>
            </div>
            
            <p className="text-xs text-gray-400 leading-normal">
              لحماية متجرك من تكرار الرسائل المزعجة (Spam) والحفاظ على سمعة الرقم المرتبط بـ Meta، يفعل رقيب قيود الأمان لضمان سلامة مراسلات العملاء تلقائياً:
            </p>

            <div className="space-y-3.5 text-xs">
              {[
                { key: "rule_max_one_24h", label: "الحد الأقصى رسالة واحدة فقط لكل طلب شحنة خلال 24 ساعة (نشط)" },
                { key: "rule_no_after_10pm", label: "عدم إرسال أي رسائل ووقف الجدولة تلقائياً بعد الساعة 10:00 مساءً" },
                { key: "rule_require_phone", label: "إلغاء ووقف البناء فوراً إذا كان هاتف العميل غير صحيح أو مفقود" },
                { key: "rule_not_if_completed", label: "عدم المبادرة بالإرسال التلقائي إذا كانت حالة الشحنة تم تسليمها" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-2.5 bg-brand-dark/20 hover:bg-brand-dark/40 rounded-xl border border-gray-800/60 cursor-pointer transition-all">
                  <span className="text-gray-300">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={!!settings[item.key]}
                    onChange={(e) => {
                      const newSettings = {
                        ...settings,
                        [item.key]: e.target.checked
                      };
                      setSettings(newSettings);
                      fetch("/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newSettings)
                      }).then(() => showToast("تم تحديث قواعد الأمان لحسابك"));
                    }}
                    className="w-4 h-4 rounded border-gray-800 bg-brand-dark text-brand-emerald focus:ring-0 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Package types view */}
          <div className="grid grid-cols-3 gap-2.5 text-center pt-4 border-t border-gray-800/60 mt-4">
            <div className="p-2 bg-brand-dark rounded-xl border border-gray-800 space-y-0.5 opacity-60">
              <p className="font-bold text-white text-[11px] mb-0.5">الباقة المبتدئة</p>
              <p className="text-[10px] text-gray-500">500 رسالة / ش</p>
            </div>
            <div className="p-2 bg-[#112d24]/20 rounded-xl border border-[#1b503e]/40 space-y-0.5 relative">
              <span className="absolute top-[-8px] left-[50%] translate-x-[-50%] bg-brand-emerald text-brand-dark text-[7px] px-1.5 rounded font-extrabold scale-90 whitespace-nowrap">الباقة النشطة</span>
              <p className="font-bold text-brand-emerald text-[11px] mb-0.5">باقة النمو</p>
              <p className="text-[10px] text-gray-400">2,000 رسالة / ش</p>
            </div>
            <div className="p-2 bg-brand-dark rounded-xl border border-gray-800 space-y-0.5 opacity-60">
              <p className="font-bold text-white text-[11px] mb-0.5">الباقة المهنية</p>
              <p className="text-[10px] text-gray-500">6,000 رسالة / ش</p>
            </div>
          </div>
        </div>

      </div>

      {/* EDITABLE WHATSAPP CUSTOM TEMPLATES SECTION */}
      <div className="bg-brand-navy p-6 rounded-2xl border border-gray-800 space-y-4 text-right">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-800 justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-brand-emerald" />
            <h3 className="font-bold text-white text-sm">قوالب رسائل واتساب التلقائية التشغيلية للمتجر</h3>
          </div>
          <span className="text-[10px] text-gray-500">المتغيرات لتضمينها بالنصوص: {'{customer_name}'}، {'{order_number}'}، {'{carrier}'}، {'{customer_city}'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              key: "tpl_delay",
              title: "قالب تأخر الشحنة اللوجستية",
              default: "مرحبًا {customer_name}، نعتذر لك عن تأخر تحديث طلبك رقم {order_number}. تم رفع متابعة عاجلة مع شركة الشحن {carrier}، وسنوافيك بأي تحديث قريبًا. شكرًا لتفهمك."
            },
            {
              key: "tpl_return_create",
              title: "قالب استلام طلب الإرجاع للتسجيل",
              default: "مرحبًا {customer_name}، تم استلام طلب الإرجاع الخاص بالطلب رقم {order_number}. سنراجعه حسب سياسة المتجر ونبلغك بالنتيجة قريبًا."
            },
            {
              key: "tpl_return_approve",
              title: "قالب قبول طلب الإرجاع مبدئيًا",
              default: "مرحبًا {customer_name}، تم قبول طلب الإرجاع الخاص بالطلب رقم {order_number} مبدئيًا. سيتم تأكيد القرار النهائي بعد وصول المنتج وفحص حالته."
            },
            {
              key: "tpl_return_reject",
              title: "قالب رفض طلب الإرجاع مفسرا",
              default: "مرحبًا {customer_name}، نعتذر منك، لا يمكن قبول طلب الإرجاع للطلب رقم {order_number} حسب سياسة المتجر. يمكنك التواصل معنا إذا كنت تحتاج توضيحًا إضافيًا."
            },
            {
              key: "tpl_return_photos",
              title: "قالب طلب صور إضافية من العميل",
              default: "مرحبًا {customer_name}، لإكمال مراجعة طلب الإرجاع رقم {order_number}، نرجو إرسال صور واضحة للمنتج وحالته."
            },
          ].map((tpl) => {
            const currentText = settings[tpl.key] !== undefined ? settings[tpl.key] : tpl.default;
            return (
              <div key={tpl.key} className="bg-brand-dark/40 p-5 rounded-xl border border-gray-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800/50">
                    <span className="font-bold text-white text-xs">{tpl.title}</span>
                    <span className="text-[9px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2 py-0.5 rounded-md">واتساب نشط</span>
                  </div>
                  <textarea
                    className="w-full bg-[#050b12] border border-gray-800 rounded-lg p-2.5 text-xs text-gray-200 leading-relaxed focus:outline-none focus:border-brand-emerald"
                    rows={3.5}
                    value={currentText}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        [tpl.key]: e.target.value
                      });
                    }}
                  />
                </div>
                <button
                  onClick={async () => {
                    const textVal = settings[tpl.key] !== undefined ? settings[tpl.key] : tpl.default;
                    const newSettings = {
                      ...settings,
                      [tpl.key]: textVal
                    };
                    try {
                      const res = await fetch("/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newSettings)
                      });
                      if (res.ok) {
                        setSettings(newSettings);
                        showToast("تم تحديث وحفظ تفضيلات القالب بنجاح!");
                      }
                    } catch (e) {
                      showToast("خطأ بالخادم", "error");
                    }
                  }}
                  className="w-full bg-[#112240] hover:bg-brand-emerald hover:text-brand-dark text-gray-300 transition-all font-bold py-2 rounded-lg text-xs cursor-pointer text-center"
                >
                  حفظ وقوننة نص القالب
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHATSAPP SENDS MESSAGE LOGS (filtered from customerAlerts) */}
      <div className="bg-brand-navy rounded-2xl border border-gray-800 overflow-hidden text-right">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0d1624]">
          <div>
            <h3 className="font-bold text-white">سجل إشعارات ورسائل واتساب التلقائية</h3>
            <p className="text-[11px] text-gray-500 mt-1">تتبع كافة الإرساليات والمسودات الفورية المرسلة تلقائياً بمساعدة محرك الذكاء والربط</p>
          </div>
          <span className="text-xs bg-[#112240] border border-gray-800 px-3.5 py-1.5 rounded-xl text-gray-400">سجلات الإرسال: {alerts.filter(a => a.type === 'whatsapp').length} سجل</span>
        </div>

        <div className="overflow-x-auto text-sm">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs bg-brand-dark/20">
                <th className="py-4 px-4 font-semibold">تاريخ الإرسال</th>
                <th className="py-4 px-4 font-semibold">رقم طلب الشحنة</th>
                <th className="py-4 px-4 font-semibold">اسم العميل</th>
                <th className="py-4 px-4 font-semibold">اسم القناة ومسار الإرسال</th>
                <th className="py-4 px-4 font-semibold">المستقبل هاتف</th>
                <th className="py-4 px-4 font-semibold">نص الرسالة المرسل</th>
                <th className="py-4 px-4 font-semibold text-center">حالة الإرسال</th>
                <th className="py-4 px-4 font-semibold">تفاصيل / سبب الفشل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40 text-xs text-gray-300">
              {alerts.filter(a => a.type === 'whatsapp').length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    لم يتم إطلاق أي رسائل واتساب تجريبية بعد. اذهب لقسم "الشحنات المتأخرة" أو "المرتجعات" واطلق رسالة تجريبية لتراها هنا لحظيًا 🚀
                  </td>
                </tr>
              ) : (
                alerts.filter(a => a.type === 'whatsapp').map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-800/10 transition-colors">
                    <td className="py-4 px-4 font-mono text-gray-400">
                      {new Date(alert.sentAt || alert.createdAt || Date.now()).toLocaleString("ar-SA")}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">#{alert.orderNumber || "غير متوفر"}</td>
                    <td className="py-4 px-4 text-white font-semibold">{alert.customerName}</td>
                    <td className="py-4 px-4 text-brand-emerald">{alert.channel || "واتساب التلقائي"}</td>
                    <td className="py-4 px-4 font-mono">+{alert.recipient}</td>
                    <td className="py-4 px-4 max-w-xs truncate text-[11px]" title={alert.message}>
                      {alert.message}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-extrabold ${
                        alert.status === "sent" ? "bg-green-500/10 text-brand-emerald border border-brand-emerald/20" :
                        alert.status === "failed" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>{
                        alert.status === "sent" ? "تم الإرسال" :
                        alert.status === "failed" ? "فشل" :
                        "بانتظار الإرسال"
                      }</span>
                    </td>
                    <td className="py-4 px-4 text-xs text-red-400">
                      {alert.failureReason || <span className="text-gray-550">-</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
