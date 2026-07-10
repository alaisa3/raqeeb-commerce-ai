import React from "react";
import { Lock, Shield, Eye, FileText, ArrowRight, Heart } from "lucide-react";

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4 animate-fade-in text-slate-800">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer bg-emerald-50 hover:bg-emerald-100/80 px-4 py-2.5 rounded-xl border border-emerald-100 w-fit"
      >
        <ArrowRight className="w-4 h-4" />
        العودة للرئيسية
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 md:p-12 text-center space-y-4 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-emerald-500 to-sky-500" />
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">سياسة الخصوصية</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
          نحن في منصة <strong className="text-emerald-600 font-bold">رقيب التجارة</strong> نلتزم بأعلى معايير الأمان وحماية خصوصية بيانات متجرك وعملائك. نوضح في هذه الصفحة كيف نجمع البيانات، نحميها، ونعالجها.
        </p>
        <div className="text-[11px] text-slate-400 font-mono">آخر تحديث: ٦ يوليو ٢٠٢٦</div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Section 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg border border-sky-100">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">١. البيانات التي نجمعها</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            عند ربط متجرك بمنصة <strong>رقيب التجارة</strong> من خلال بوابة مطوري سلة (Salla API)، فإننا نصل حصرياً إلى البيانات التشغيلية واللوجستية الضرورية لتوفير الخدمة:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 pr-2">
            <li><strong>بيانات المتجر:</strong> اسم المتجر، البريد الإلكتروني، والعملة لتهيئة لوحة التحكم.</li>
            <li><strong>بيانات الشحنات والطلبات:</strong> رقم الطلب، تاريخ الطلب، حالة الشحن الحالية، واسم شركة الشحن (مثل أرامكس، سمسا، ناقل).</li>
            <li><strong>بيانات العملاء اللوجستية:</strong> اسم المستلم، رقم الهاتف (لإرسال تنبيهات الواتساب/SMS اللبقة)، ومدينة التوصيل.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">٢. كيف نستخدم بياناتك؟</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            هدفنا الأساسي هو <span className="font-semibold text-slate-900">"ندعمك لتنمو تجارتك"</span>. نستخدم هذه البيانات في الأغراض التالية فقط:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 pr-2">
            <li>رصد وتتبع حركة الشحنات المتأخرة والراكدة لدى شركات الشحن وتنبيهك بها استباقياً.</li>
            <li>تحليل طلبات المرتجعات وبناء قواعد ذكية لقبولها أو رفضها وفق سياسة متجرك المحددة.</li>
            <li>صياغة رسائل اعتذار وتنبيه ذكية بالذكاء الاصطناعي (Gemini API) وإرسالها لعملائك لطمأنتهم.</li>
            <li>توليد تقارير ومؤشرات بيانية دقيقة تظهر كفاءة شركات الشحن اللوجستية لمتجرك.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">٣. حماية البيانات ومشاركتها</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            نحن نضع حماية بيانات متجرك وعملائك على رأس أولوياتنا:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 pr-2">
            <li><strong>تشفير كامل:</strong> يتم نقل جميع البيانات عبر بروتوكولات آمنة ومشفرة (HTTPS/SSL) وتخزينها في بيئات خادم سحابية محاطة بأعلى مستويات الجدار الناري.</li>
            <li><strong>عدم البيع أو المشاركة:</strong> لا نقوم نهائياً ببيع، تأجير، أو مشاركة بيانات عملائك أو مبيعات متجرك مع أي جهة خارجية لأغراض تسويقية.</li>
            <li><strong>تكامل آمن:</strong> تتم قنوات الاتصال بالذكاء الاصطناعي (Gemini) عبر خوادم خلفية آمنة دون كشف أي مفاتيح برمجية للمتصفحات.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">٤. إدارة حسابك وحقوقك</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            بصفتك تاجرًا متحكمًا ببياناتك، تمنحك منصة <strong>رقيب التجارة</strong> كامل الصلاحيات لإدارة وحذف معلوماتك:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 pr-2">
            <li>يمكنك فصل الربط المباشر بمتجر سلة بلمسة زر واحدة من لوحة التحكم في أي وقت.</li>
            <li>تستطيع تعديل رقم الواتساب، قوالب الرسائل، وسياسة الإرجاع بشكل فوري من صفحة الإعدادات.</li>
            <li>عند طلبك حذف الحساب، نقوم بإزالة كافة البيانات التشغيلية المزامنة لمتجرك من قواعد بياناتنا بشكل نهائي.</li>
          </ul>
        </div>

        {/* Brand Signoff */}
        <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6 text-center space-y-2">
          <p className="text-sm font-bold text-emerald-800 flex items-center justify-center gap-1">
            منصة رقيب التجارة الذكية <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" /> نعمل على تمكين المتاجر السعودية وإثراء تجربة المتسوقين
          </p>
          <p className="text-xs text-slate-500">
            إذا كان لديك أي استفسار حول معالجة البيانات، يسعدنا تواصلك على البريد الإلكتروني: <a href="mailto:support@raqeeb.sa" className="text-emerald-600 font-semibold hover:underline">support@raqeeb.sa</a>
          </p>
        </div>
      </div>
    </div>
  );
}
