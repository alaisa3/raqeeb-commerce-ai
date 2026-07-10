import React from "react";
import { FileText, ArrowRight, ShieldCheck, Scale, Handshake, ShieldAlert, Heart } from "lucide-react";

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
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
          <Scale className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">شروط الاستخدام</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
          يسعدنا انضمامك إلى منصة <strong className="text-emerald-600 font-bold">رقيب التجارة</strong>. تحدد هذه الصفحة الاتفاقية القانونية وشروط استخدام خدماتنا اللوجستية والذكية لمتجرك بسلة.
        </p>
        <div className="text-[11px] text-slate-400 font-mono">آخر تحديث: ٦ يوليو ٢٠٢٦</div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Section 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <Handshake className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">١. قبول الشروط والخدمة</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            بإنشاء حساب أو ربط متجرك بسلة مع منصة <strong>رقيب التجارة</strong>، فإنك توافق بالكامل على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي بند منها، فيرجى عدم استخدام المنصة وفصل ربط متجرك فوراً.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg border border-sky-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">٢. حساب التاجر والتكامل مع سلة</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            تعتمد خدماتنا بشكل مباشر على الربط التقني المرخص والمصادق عليه عبر بروتوكولات سلة الرسمية:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 pr-2">
            <li>يلتزم التاجر بتوفير بيانات صحيحة أثناء التسجيل وربط متجره.</li>
            <li>التاجر هو المسؤول الأول عن حماية مفاتيح الربط وتفاصيل الولوج لحسابه في المنصة.</li>
            <li>المنصة تقدم وضع البيانات التجريبية (Demo Mode) بشكل استرشادي ولا يترتب عليه أي مسؤولية تشغيلية حقيقية.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">٣. شروط المرتجعات وقنوات التواصل</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            تسعى منصة <strong>رقيب التجارة</strong> لتمكين متجرك من صياغة قرارات المرتجعات وتنبيهات الشحنات بذكاء:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 pr-2">
            <li><strong>تنبيهات العملاء:</strong> تقع مسؤولية التحقق من صحة نصوص رسائل الواتساب أو الـ SMS المقترحة قبل إرسالها على عاتق التاجر. المنصة غير مسؤولة عن سوء تفسير المحتوى أو اعتراض العميل عليه.</li>
            <li><strong>سياسة الإرجاع:</strong> تعتمد قرارات القبول والرفض الآلية للمرتجعات المفتوحة أو المغلقة بالكامل على المدخلات والضوابط التي يحددها التاجر بصفحة الإعدادات، ويكون التاجر مسؤولاً عن أي نزاع ينشأ مع المستهلك النهائي.</li>
            <li><strong>أمن الحسابات التشغيلية:</strong> ننسق معك لإرسال الرسائل بلمسة زر عبر تطبيق واتساب أو API تجريبي لضمان أمان حساباتك وتفادي حظر الأرقام.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">٤. حدود المسؤولية والضمانات</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            منصة <strong>رقيب التجارة</strong> هي أداة تقنية مساعدة لرفع الكفاءة التشغيلية والخدمية للمتجر:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 pr-2">
            <li>نحن نسعى لضمان استقرار الخدمة بنسبة 99.9٪ ولكننا لا نضمن عدم انقطاع الخدمات بسبب أعطال خارجة عن إرادتنا أو تحديثات مفاجئة من منصة سلة أو شركات الشحن.</li>
            <li>لا نتحمل أي مسؤولية عن خسائر مالية، تراجع المبيعات، أو عقوبات وغرامات تفرضها الجهات الرقابية بسبب تأخر الشحنات الفعلي، حيث أن دورنا هو تتبع ورصد المشاكل وتسهيل تلافيها فقط.</li>
          </ul>
        </div>

        {/* Brand Signoff */}
        <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6 text-center space-y-2">
          <p className="text-sm font-bold text-emerald-800 flex items-center justify-center gap-1">
            منصة رقيب التجارة الذكية <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" /> نهدف لبناء علاقة ثقة مستدامة بين متجرك وعملائه
          </p>
          <p className="text-xs text-slate-500">
            لأي استفسارات قانونية أو فنية تتعلق بشروط الخدمة، يرجى التواصل معنا: <a href="mailto:legal@raqeeb.sa" className="text-emerald-600 font-semibold hover:underline">legal@raqeeb.sa</a>
          </p>
        </div>
      </div>
    </div>
  );
}
