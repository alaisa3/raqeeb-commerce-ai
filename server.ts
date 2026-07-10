import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini if key is provided
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Error launching Gemini API:", err);
  }
}

// LowDB-like simple JSON persistence layer
const DB_FILE = path.join(process.cwd(), "database.json");

interface DBStructure {
  users: any[];
  stores: any[];
  orders: any[];
  orderAnalysis: any[];
  returns: any[];
  messageTemplates: any[];
  settings: Record<string, any>;
  tasks: any[];
  customerAlerts?: any[];
  abandonedCarts?: any[];
}

function getInitialDB(): DBStructure {
  return {
    users: [
      {
        id: "demo-user-id",
        email: "alaisa3@gmail.com",
        password: "password123",
        fullName: "عبدالله العتيبي",
        createdAt: new Date().toISOString(),
      },
    ],
    stores: [
      {
        id: "demo-store-id",
        userId: "demo-user-id",
        sallaMerchantId: "123456789",
        storeName: "رواسي العطور",
        storeUrl: "https://salla.sa/rawasy-perfumes",
        platform: "demo",
        whatsapp: "966501234567",
        email: "store@rawasy.sa",
        accessToken: "demo_access_token",
        refreshToken: "demo_refresh_token",
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30).toISOString(),
        connectedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ],
    orders: [],
    orderAnalysis: [],
    returns: [],
    messageTemplates: [
      {
        id: "t1",
        storeId: null,
        category: "delay",
        title: "اعتذار عن تأخر الشحنة",
        body: "مرحبًا {customer_name}، نعتذر لك عن تأخر تحديث طلبك رقم {order_number}. تم رفع متابعة عاجلة مع شركة الشحن {carrier}، وسنوافيك بأي تحديث قريبًا لمشوار شحنتك إلى {city}. شكرًا لتفهمك وصبرك معنا.",
        tone: "رسمية",
        createdAt: new Date().toISOString(),
      },
      {
        id: "t2",
        storeId: null,
        category: "delay",
        title: "تنبيه ودي بتأخير الشحنة",
        body: "هلا بك {customer_name} 🌸 طلبك رقم {order_number} جاهز وحركناه، بس حسينا إنه تأخر شوي مع {carrier}. لا تشيل هم، تواصلنا معهم الحين وبنتابع شحنتك لـ {city} خطوة بخطوة وبنطمنك أول بأول!",
        tone: "ودية",
        createdAt: new Date().toISOString(),
      },
      {
        id: "t3",
        storeId: null,
        category: "delay",
        title: "تنبيه سريع بالتأخير",
        body: "طلبك رقم {order_number} متأخر عند {carrier} إلى {city}. تواصلنا معهم للمتابعة السريعة وسنطلعك على التحديث.",
        tone: "مختصرة",
        createdAt: new Date().toISOString(),
      },
      {
        id: "t4",
        storeId: null,
        category: "carrier",
        title: "تصعيد لشركة الشحن",
        body: "السلام عليكم، نرجو تزويدنا بتحديث عاجل للشحنة الخاصة بالطلب رقم {order_number} المتجهة إلى مدينة {customer_city}. الشحنة متأخرة ولم يتم تحديث حالتها منذ فترة والعميل يطالب بالإفادة الفورية.",
        tone: "رسمية",
        createdAt: new Date().toISOString(),
      },
      {
        id: "t5",
        storeId: null,
        category: "feedback",
        title: "تأكيد واستطلاع رضا",
        body: "مرحبًا {customer_name}، نسعد بتأكيد سلامة وصول طلبك رقم {order_number} إلى {city}. نتمنى أن تكون تجربتك رائعة معنا ويسعدنا تقييمك لمنتجات {store_name}.",
        tone: "ودية",
        createdAt: new Date().toISOString(),
      },
      {
        id: "t6",
        storeId: null,
        category: "return",
        title: "موافقة مبدئية على الإرجاع",
        body: "أهلاً {customer_name}، بخصوص طلب الإرجاع الخاص بك للطلب {order_number}، تفضل بالموافقة المبدئية وسنقوم بإرسال بوليصة الإرجاع عبر {carrier} خلال 24 ساعة. يرجى تسليم المنتج كما هو.",
        tone: "رسمية",
        createdAt: new Date().toISOString(),
      },
    ],
    settings: {
      returnDays: 7,
      openedReturnable: false,
      expectedDays: 3,
      whatsappNumber: "",
      whatsappConnected: false,
      ws_send_delay: true,
      ws_send_return_create: true,
      ws_send_return_approve: true,
      ws_send_return_reject: true,
      ws_send_return_photos: true,
      ws_send_status_update: true,
      rule_max_one_24h: true,
      rule_no_after_10pm: true,
      rule_require_phone: true,
      rule_not_if_completed: true,
      defaultTone: "ودية",
      enableEmailAlerts: true,
      enableSMSAlerts: true,
      alertDelayThresholdHours: 24,
      emailTemplateBody: "شريكنا العزيز {customer_name}، شحنتك رقم {order_number} المتجهة إلى {customer_city} مع الناقل {carrier} قد تتأخر قليلاً عن الموعد المعتاد بـ 24 ساعة. نعمل جاهدين لتسليمها بأسرع وقت.",
      smsTemplateBody: "عميلنا العزيز {customer_name}، نعتذر عن تأخر شحنتك مع {carrier} رقم {order_number}. نعمل على تصعيدها وتسليمها لك عاجلاً.",
    },
    tasks: [],
    customerAlerts: [
      {
        id: "alert-wa-1",
        orderId: "ord-1",
        orderNumber: "10982",
        customerName: "سليمان الفوزان",
        recipient: "966539887711",
        type: "whatsapp",
        channel: "واتساب التلقائي",
        status: "sent",
        sentAt: "2026-06-23T10:15:00.000Z",
        message: "مرحبًا سليمان الفوزان، نعتذر لك عن تأخر تحديث طلبك رقم 10982. تم رفع متابعة عاجلة مع شركة الشحن أرامكس، وسنوافيك بأي تحديث قريبًا. شكرًا لتفهمك."
      },
      {
        id: "alert-wa-2",
        orderId: "ord-2",
        orderNumber: "10983",
        customerName: "سارة القحطاني",
        recipient: "966551234567",
        type: "whatsapp",
        channel: "واتساب التلقائي",
        status: "failed",
        sentAt: "2026-06-23T11:22:00.000Z",
        message: "مرحبًا سارة القحطاني، تم استلام طلب الإرجاع الخاص بالطلب رقم 10983. سنراجعه حسب سياسة المتجر ونبلغك بالنتيجة قريبًا.",
        failureReason: "الرقم غير متصل بـ واتساب"
      },
      {
        id: "alert-wa-3",
        orderId: "ord-4",
        orderNumber: "10985",
        customerName: "فاطمة الدوسري",
        recipient: "966567788990",
        type: "whatsapp",
        channel: "واتساب التلقائي",
        status: "pending",
        sentAt: "2026-06-23T12:00:00.000Z",
        message: "مرحبًا فاطمة الدوسري، تم قبول طلب الإرجاع الخاص بالطلب رقم 10985 مبدئيًا. سيتم تأكيد القرار النهائي بعد وصول المنتج وفحص حالته."
      }
    ],
    abandonedCarts: getInitialAbandonedCarts()
  };
}

function getInitialAbandonedCarts() {
  const getPastTime = (hoursAgo: number) => {
    return new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
  };
  return [
    {
      id: "cart-1",
      cartNumber: "CRT-8910",
      customerName: "عبدالرحمن الدوسري",
      customerPhone: "966505123456",
      cartValue: 480,
      abandonedAt: getPastTime(2),
      status: "abandoned",
      priority: "high",
      products: "طقم عطور الهيل والزعفران الملكي (٢ حبة)",
      couponCode: "",
      analysis: ""
    },
    {
      id: "cart-2",
      cartNumber: "CRT-8911",
      customerName: "خلود السديري",
      customerPhone: "966554789012",
      cartValue: 290,
      abandonedAt: getPastTime(5),
      status: "abandoned",
      priority: "medium",
      products: "مبخرة ذكية متنقلة + كسر عود مروكي طبيعي",
      couponCode: "",
      analysis: ""
    },
    {
      id: "cart-3",
      cartNumber: "CRT-8912",
      customerName: "فيصل الحربي",
      customerPhone: "966542135768",
      cartValue: 650,
      abandonedAt: getPastTime(26),
      status: "recovered",
      priority: "high",
      products: "عطر مسك روز فاخر + مجموعة زيوت عطرية مركزة",
      couponCode: "RAQEEB15",
      analysis: "تم التواصل عبر واتساب وتقديم كود الخصم RAQEEB15 وتم إتمام الشراء بنجاح."
    },
    {
      id: "cart-4",
      cartNumber: "CRT-8913",
      customerName: "منى القحطاني",
      customerPhone: "966567112233",
      cartValue: 180,
      abandonedAt: getPastTime(48),
      status: "abandoned",
      priority: "low",
      products: "مجموعة معطرات غرف لافندر وصندل منعش",
      couponCode: "",
      analysis: ""
    }
  ];
}

function loadDB(): DBStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (!parsed.customerAlerts) parsed.customerAlerts = [];
      if (!parsed.abandonedCarts) parsed.abandonedCarts = getInitialAbandonedCarts();
      if (!parsed.settings) parsed.settings = {};
      if (parsed.settings.enableEmailAlerts === undefined) parsed.settings.enableEmailAlerts = true;
      if (parsed.settings.enableSMSAlerts === undefined) parsed.settings.enableSMSAlerts = true;
      if (parsed.settings.alertDelayThresholdHours === undefined) parsed.settings.alertDelayThresholdHours = 24;
      if (!parsed.settings.emailTemplateBody) {
        parsed.settings.emailTemplateBody = "شريكنا العزيز {customer_name}، شحنتك رقم {order_number} المتجهة إلى {customer_city} مع الناقل {carrier} قد تتأخر قليلاً عن الموعد المعتاد بـ 24 ساعة. نعمل جاهدين لتسليمها بأسرع وقت.";
      }
      if (!parsed.settings.smsTemplateBody) {
        parsed.settings.smsTemplateBody = "عميلنا العزيز {customer_name}، نعتذر عن تأخر شحنتك مع {carrier} رقم {order_number}. نعمل على تصعيدها وتسليمها لك عاجلاً.";
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error reading database file, returning initial DB:", e);
  }
  const initial = getInitialDB();
  saveDB(initial);
  return initial;
}

function saveDB(db: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to database.json:", err);
  }
}

// Seed mock / demo orders if orders table is empty
function seedDemoOrdersIfNeeded(db: DBStructure) {
  if (db.orders && db.orders.length > 0) return;

  const now = new Date();
  const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(now.getDate() - daysAgo);
    return d.toISOString();
  };

  const sampleOrders = [
    {
      id: "ord-1",
      storeId: "demo-store-id",
      sallaOrderId: "sol-88910",
      orderNumber: "10982",
      customerName: "سليمان الفوزان",
      customerPhone: "966539887711",
      customerCity: "الرياض",
      carrier: "أرامكس",
      orderDate: getPastDate(6).substring(0, 10),
      status: "متأخر",
      lastUpdate: getPastDate(5),
      total: 420.0,
      returnRequested: false,
      followupStatus: "new",
      createdAt: getPastDate(6),
      updatedAt: getPastDate(5),
    },
    {
      id: "ord-2",
      storeId: "demo-store-id",
      sallaOrderId: "sol-88911",
      orderNumber: "10983",
      customerName: "سارة القحطاني",
      customerPhone: "966551234567",
      customerCity: "جدة",
      carrier: "سمسا",
      orderDate: getPastDate(2).substring(0, 10),
      status: "تم الشحن",
      lastUpdate: getPastDate(1),
      total: 280.0,
      returnRequested: false,
      followupStatus: "new",
      createdAt: getPastDate(2),
      updatedAt: getPastDate(1),
    },
    {
      id: "ord-3",
      storeId: "demo-store-id",
      sallaOrderId: "sol-88912",
      orderNumber: "10984",
      customerName: "خالد الحربي",
      customerPhone: "", // intentional missing phone
      customerCity: "تبوك",
      carrier: "ناقل",
      orderDate: getPastDate(5).substring(0, 10),
      status: "متأخر",
      lastUpdate: getPastDate(4),
      total: 650.0,
      returnRequested: false,
      followupStatus: "investigating",
      createdAt: getPastDate(5),
      updatedAt: getPastDate(4),
    },
    {
      id: "ord-4",
      storeId: "demo-store-id",
      sallaOrderId: "sol-88913",
      orderNumber: "10985",
      customerName: "فاطمة الدوسري",
      customerPhone: "966567788990",
      customerCity: "أبها",
      carrier: "SPL",
      orderDate: getPastDate(4).substring(0, 10),
      status: "قيد التجهيز",
      lastUpdate: getPastDate(4),
      total: 150.0,
      returnRequested: true,
      followupStatus: "new",
      createdAt: getPastDate(4),
      updatedAt: getPastDate(4),
    },
    {
      id: "ord-5",
      storeId: "demo-store-id",
      sallaOrderId: "sol-88914",
      orderNumber: "10986",
      customerName: "عبدالرحمن البقمي",
      customerPhone: "966548765432",
      customerCity: "المدينة",
      carrier: "DHL",
      orderDate: getPastDate(1).substring(0, 10),
      status: "مكتمل",
      lastUpdate: getPastDate(0),
      total: 890.0,
      returnRequested: false,
      followupStatus: "resolved",
      createdAt: getPastDate(1),
      updatedAt: getPastDate(0),
    },
  ];

  db.orders = sampleOrders;

  // Generate analyses for them
  sampleOrders.forEach((o) => {
    const analysis = analyzeOrder(o, db.settings, db.orders);
    db.orderAnalysis.push({
      id: "an-" + o.id,
      orderId: o.id,
      ...analysis,
      createdAt: new Date().toISOString(),
    });

    // Create tasks if phone is missing
    if (!o.customerPhone) {
      db.tasks.push({
        id: "tsk-" + o.id + "-phone",
        storeId: "demo-store-id",
        taskType: "update_phone",
        title: `تحديث جهة الاتصال للطلب #${o.orderNumber}`,
        description: `العميل ${o.customerName} ليس لديه رقم جوال مسجل. نرجو التواصل لتسجيل رقم الواتساب لتلقي تنبيهات الشحن.`,
        priority: "medium",
        status: "open",
        relatedOrderId: o.id,
        createdAt: new Date().toISOString(),
      });
    }

    // Create returns request if returnRequested = true
    if (o.returnRequested) {
      db.returns.push({
        id: "ret-" + o.id,
        storeId: "demo-store-id",
        orderId: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        reason: "المنتج غير مطابق للتوقعات ورائحته تختلف",
        productCondition: "سليم ومغلف",
        opened: false,
        decision: "قبول مبدئي",
        decisionReason: "المنتج سليم ولم يتم فتحه وضمن مدة الإرجاع المسموحة (7 أيام).",
        customerMessage: "مرحبًا فاطمة الدوسري، يسعدنا إفادتك بالموافقة على طلب إرجاع طلبك رقم 10985. سنقوم بإرسال بوليصة شحن مجانية عبر SPL لإرجاع المنتج.",
        status: "open",
        createdAt: new Date().toISOString(),
      });
    }
  });

  saveDB(db);
}

// Rule-based analysis engine
function analyzeOrder(order: any, settings: any, allOrders: any[] = []): {
  riskLevel: "منخفض" | "متوسط" | "مرتفع";
  reason: string;
  recommendedAction: string;
  customerMessage: string;
  carrierMessage: string;
  internalNote: string;
} {
  let riskLevel: "منخفض" | "متوسط" | "مرتفع" = "منخفض";
  let reason = "الطلب يسير بشكل طبيعي.";
  let recommendedAction = "لا يتطلب إجراء حالياً.";
  let internalNote = "تم التحليل آليًا بواسطة ولاء الذكي.";

  const orderDate = new Date(order.orderDate);
  const lastUpdateDate = new Date(order.lastUpdate);
  const now = new Date();
  
  const diffTimeMs = now.getTime() - lastUpdateDate.getTime();
  const diffDays = Math.ceil(diffTimeMs / (1000 * 60 * 60 * 24));

  // Cities categorizations
  const remoteCities = ["تبوك", "حائل", "أبها", "القصيم"];
  const isRemote = remoteCities.includes(order.customerCity);

  // Check carrier repeated delays (e.g. if > 1 order with this carrier is delayed)
  const carrierDelaysCount = allOrders.filter(
    (o) => o.carrier === order.carrier && o.status === "متأخر"
  ).length;

  if (order.status === "متأخر") {
    riskLevel = "مرتفع";
    reason = `الشحنة متأخرة مع شركة الشحن (${order.carrier}) لأكثر من ${diffDays} أيام دون تسليم للعميل في ${order.customerCity}.`;
    recommendedAction = "إرسال رسالة تنبيه للعميل مع تصعيد شكوى لشركة الشحن.";
    internalNote = `شركة الشحن ${order.carrier} تتأخر بشكل متكرر في هذه المنطقة. تم تحديد المخاطر كمرتفعة لأولوية المتابعة.`;
  } else if (diffDays >= 5 && order.status !== "مكتمل" && order.status !== "مرتجع") {
    riskLevel = "مرتفع";
    reason = `لم يحدث أي تحديث على مسار الشحنة منذ ٥ أيام أو أكثر (آخر تحديث منذ ${diffDays} أيام).`;
    recommendedAction = "مخاطبة الدعم الفني لشركة الشحن لاستبيان حالة الطرد.";
    internalNote = "احتمالية فقدان الطرد أو توقفه بمستودع الفرز الرئيسي.";
  } else if (order.returnRequested === true) {
    riskLevel = "متوسط";
    reason = "طلب العميل إرجاع شحنة أو منتج للطلب.";
    recommendedAction = "مراجعة سبب الإرجاع وحالة المنتج لاتخاذ قرار القبول/الرفض.";
    internalNote = "العميل يرغب في الإرجاع. يرجى مراجعة نافذة المرتجعات لإصدار البوليصة العكسية.";
  } else if (diffDays >= 3 && order.status !== "مكتمل" && order.status !== "مرتجع") {
    riskLevel = "متوسط";
    reason = `الشحنة معلقة بدون تحديث منذ ${diffDays} مـن الأيام.`;
    recommendedAction = "مراقبة مسار الشحنة اليوم، وفي حال استمرار التعليق يتم الاتصال بشركة الشحن.";
    internalNote = "تأخير معتاد بالفرز الأولي لكن يفضل الانتباه لتجنب الشكاوى.";
  } else if (isRemote && diffDays >= 2 && order.status !== "مكتمل" && order.status !== "مرتجع") {
    riskLevel = "متوسط";
    reason = `مدينة العميل بعيدة نسبياً (${order.customerCity}) والشحنة لم تتحدث منذ يومين.`;
    recommendedAction = "تجهيز تحديث مسبق للعميل لطمأنته.";
    internalNote = "المناطق النائية تستغرق وقتاً أطول بالتسليم والفرز النهائي.";
  } else if (carrierDelaysCount >= 2 && order.status === "تم الشحن") {
    riskLevel = "متوسط";
    reason = `الطلب يسير ببطء بسبب تراكم شحنات متأخرة سابقة مع نفس الناقل (${order.carrier}).`;
    recommendedAction = "متابعة الطلب وتجهيز بدائل شحن أفضل مستقبلاً.";
  } else if (order.status === "مكتمل") {
    riskLevel = "منخفض";
    reason = "تم تسليم الطلب بنجاح للعميل.";
    recommendedAction = "لا يوجد إجراء مطلوب. يمكن إرسال طلب تقييم وتأكيد رضا.";
  }

  // Pre-generate standard messages
  const customerMessage = `مرحبًا ${order.customerName}، نعتذر لك عن تأخر تحديث طلبك رقم ${order.orderNumber}. تم رفع متابعة عاجلة مع شركة الشحن ${order.carrier}، وسنوافيك بأي تحديث قريبًا لمشوار شحنتك إلى ${order.customerCity}. شكرًا لتفهمك وصبرك معنا.`;
  const carrierMessage = `السلام عليكم، نرجو تزويدنا بتحديث عاجل للشحنة الخاصة بالطلب رقم ${order.orderNumber} المتجهة إلى مدينة ${order.customerCity}. الشحنة متأخرة ولم يتم تحديث حالتها منذ فترة والعميل يطالب بالإفادة الفورية.`;

  return {
    riskLevel,
    reason,
    recommendedAction,
    customerMessage,
    carrierMessage,
    internalNote,
  };
}

// Database initial triggers
const db = loadDB();
seedDemoOrdersIfNeeded(db);

// Helper for handling unauthorized or standard session API
function getCurrentStore(req: express.Request) {
  // Return the first or default store
  const db = loadDB();
  return db.stores[0] || null;
}

//---------------------------------------------------------
// Auth APIs
//---------------------------------------------------------
app.post("/api/auth/register", (req, res) => {
  const { email, password, fullName, storeName } = req.body;
  if (!email || !password || !fullName || !storeName) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة" });
  }

  const db = loadDB();
  const exists = db.users.find((u) => u.email === email);
  if (exists) {
    return res.status(400).json({ error: "البريد الإلكتروني مسجل بالفعل" });
  }

  const userId = `usr-${Date.now()}`;
  const storeId = `str-${Date.now()}`;

  const newUser = {
    id: userId,
    email,
    password,
    fullName,
    createdAt: new Date().toISOString(),
  };

  const newStore = {
    id: storeId,
    userId: userId,
    sallaMerchantId: null,
    storeName,
    storeUrl: `https://salla.sa/${storeName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    platform: "demo" as const,
    whatsapp: null,
    email: email,
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
    connectedAt: null,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.stores.push(newStore);
  saveDB(db);

  res.json({ success: true, user: { id: userId, email, fullName }, storeId });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = loadDB();
  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(400).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }
  const store = db.stores.find((s) => s.userId === user.id) || db.stores[0];
  res.json({ success: true, user: { id: user.id, email: user.email, fullName: user.fullName }, store });
});

app.get("/api/auth/me", (req, res) => {
  // Simulated authenticated user
  const db = loadDB();
  const user = db.users[0];
  const store = db.stores.find((s) => s.userId === user.id) || db.stores[0];
  res.json({ user, store });
});

//---------------------------------------------------------
// Salla Sync Actions (demo until real token exchange is added)
//---------------------------------------------------------
app.post("/api/salla/sync-orders", async (req, res) => {
  const db = loadDB();
  
  // Simulate fetching new/fresh orders from Salla or reloading base set
  // Let's reload order counts and add 2 random new orders
  const store = getCurrentStore(req);
  if (!store) {
    return res.status(400).json({ error: "المتجر غير موجود" });
  }

  const saudiCities = ["الرياض", "جدة", "الدمام", "تبوك", "حائل", "أبها", "المدينة", "مكة", "القصيم"];
  const carriers = ["سمسا", "أرامكس", "ناقل", "SPL", "DHL"];
  const orderNumber = Math.floor(10987 + Math.random() * 500).toString();
  const randomCity = saudiCities[Math.floor(Math.random() * saudiCities.length)];
  const randomCarrier = carriers[Math.floor(Math.random() * carriers.length)];

  const newOrder = {
    id: `ord-${Date.now()}`,
    storeId: store.id,
    sallaOrderId: `sol-${Math.floor(Math.random() * 90000 + 10000)}`,
    orderNumber: orderNumber,
    customerName: ["سلطان الشمري", "محمد العلي", "مها العنزي", "نورة المقرن"][Math.floor(Math.random() * 4)],
    customerPhone: "9665" + Math.floor(10000000 + Math.random() * 90000000),
    customerCity: randomCity,
    carrier: randomCarrier,
    orderDate: new Date().toISOString().substring(0, 10),
    status: ["متأخر", "تم الشحن", "قيد التجهيز"][Math.floor(Math.random() * 3)],
    lastUpdate: new Date(Date.now() - (Math.random() * 4 + 1) * 3600 * 1000 * 24).toISOString(),
    total: Math.floor(150 + Math.random() * 800),
    returnRequested: Math.random() > 0.8,
    followupStatus: "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);

  // Compute analysis
  const analysis = analyzeOrder(newOrder, db.settings, db.orders);
  db.orderAnalysis.push({
    id: "an-" + newOrder.id,
    orderId: newOrder.id,
    ...analysis,
    createdAt: new Date().toISOString(),
  });

  // Re-analyze all older orders to ensure consistency
  db.orders.forEach((o) => {
    const existingIdx = db.orderAnalysis.findIndex((a) => a.orderId === o.id);
    const updatedAnalysis = analyzeOrder(o, db.settings, db.orders);
    if (existingIdx > -1) {
      db.orderAnalysis[existingIdx] = {
        ...db.orderAnalysis[existingIdx],
        ...updatedAnalysis,
      };
    } else {
      db.orderAnalysis.push({
        id: "an-" + o.id,
        orderId: o.id,
        ...updatedAnalysis,
        createdAt: new Date().toISOString(),
      });
    }
  });

  await triggerDelayedNotifications(db);
  saveDB(db);
  res.json({ success: true, count: db.orders.length, added: newOrder });
});

//---------------------------------------------------------
// Orders & Analytics
//---------------------------------------------------------
app.get("/api/orders", (req, res) => {
  const db = loadDB();
  // Include analysis data in order object
  const populatedOrders = db.orders.map((o) => {
    const analysis = db.orderAnalysis.find((a) => a.orderId === o.id);
    return { ...o, analysis };
  });
  res.json(populatedOrders);
});

app.get("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "الطلب غير موجود" });
  }
  const analysis = db.orderAnalysis.find((a) => a.orderId === id);
  const returns = db.returns.find((r) => r.orderId === id);
  const tasks = db.tasks.filter((t) => t.relatedOrderId === id);
  res.json({ ...order, analysis, returns, tasks });
});

app.post("/api/orders/update-followup", (req, res) => {
  const { orderId, status } = req.body;
  const db = loadDB();
  const order = db.orders.find((o) => o.id === orderId);
  if (order) {
    order.followupStatus = status;
    order.updatedAt = new Date().toISOString();
    
    // Add custom task log
    db.tasks.push({
      id: "tsk-" + Date.now(),
      storeId: order.storeId,
      taskType: "other",
      title: `تحديث حالة متابعة الطلب #${order.orderNumber}`,
      description: `تم تغيير حالة المتابعة يدويًا إلى: ${status === "investigating" ? "قيد التحقيق" : status === "resolved" ? "تم الحل والمتابعة" : "تم التصعيد"}`,
      priority: "low",
      status: "completed",
      relatedOrderId: order.id,
      createdAt: new Date().toISOString(),
    });

    saveDB(db);
    return res.json({ success: true, order });
  }
  res.status(404).json({ error: "الطلب غير موجود" });
});

app.post("/api/orders/analyze", (req, res) => {
  const { orderId } = req.body;
  const db = loadDB();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "الطلب غير موجود" });
  }

  const analysis = analyzeOrder(order, db.settings, db.orders);
  const existingIdx = db.orderAnalysis.findIndex((a) => a.orderId === orderId);
  if (existingIdx > -1) {
    db.orderAnalysis[existingIdx] = {
      ...db.orderAnalysis[existingIdx],
      ...analysis,
    };
  } else {
    db.orderAnalysis.push({
      id: "an-" + order.id,
      orderId: order.id,
      ...analysis,
      createdAt: new Date().toISOString(),
    });
  }
  saveDB(db);
  res.json({ success: true, analysis });
});

//---------------------------------------------------------
// Generating Customized Msg Templates (Optionally with Gemini API)
//---------------------------------------------------------
app.post("/api/messages/generate", async (req, res) => {
  const { orderId, category, tone, templateBody } = req.body;
  const db = loadDB();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(440).json({ error: "الطلب غير موجود" });
  }

  // Fallback / standard replacements
  let text = templateBody || "";
  if (!text) {
    const template = db.messageTemplates.find((t) => t.category === category && t.tone === tone);
    text = template ? template.body : "مرحبًا {customer_name}، نود إطلاعك بتحديث طلبك رقم {order_number}.";
  }

  const placeholders = {
    "{customer_name}": order.customerName,
    "{order_number}": order.orderNumber,
    "{carrier}": order.carrier,
    "{customer_city}": order.customerCity,
    "{city}": order.customerCity,
    "{last_update}": new Date(order.lastUpdate).toLocaleDateString("ar-SA"),
    "{store_name}": db.stores[0]?.storeName || "متجرنا",
  };

  let replacedText = text;
  Object.entries(placeholdersRefined(placeholders)).forEach(([key, val]) => {
    replacedText = replacedText.replace(new RegExp(escapeRegExp(key), "g"), val || "");
  });

  // Use Gemini to optimize the tone if Gemini is active
  if (ai) {
    try {
      const gPrompt = `أنت مساعد عمليات ذكي سعودي لمتاجر سلة (Walaa Commerce AI). 
قم بصياغة رسالة واتساب رائعة واحترافية باللغة العربية الفصحى المبسطة أو اللهجة السعودية البيضاء المحببة بناءً على هذه المسودة:
"${replacedText}"

الأسلوب المطلوب للرسالة: ${tone === "رسمية" ? "رسمية ومهذبة للغاية مع الاعتذار" : tone === "ودية" ? "ودية ولطيفة ومطمئنة وبها ايموجي لطيفه" : "مختصرة جداً ومباشرة وسريعة الصياغة"}

ملاحظات هامة جداً:
1. حافظ على صحة المتغيرات (مثل اسم العميل ورقم الطلب والمدينة والناقل المعوض بالمسودة).
2. لا تكتب أي شرح أو مقدمة، فقط أعد لي نص الرسالة جاهزة للنسخ لتطبيق واتساب مباشرة.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: gPrompt,
      });

      if (response.text) {
        return res.json({ text: response.text.trim(), isAI: true });
      }
    } catch (e) {
      console.warn("Gemini prompt fallback (503 or transient error):", e?.message || e);
    }
  }

  res.json({ text: replacedText, isAI: false });
});

function placeholdersRefined(p: Record<string, string>) {
  return p;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Get/Edit templates
app.get("/api/messages/templates", (req, res) => {
  const db = loadDB();
  res.json(db.messageTemplates);
});

app.post("/api/messages/templates", (req, res) => {
  const { id, body, title } = req.body;
  const db = loadDB();
  const template = db.messageTemplates.find((t) => t.id === id);
  if (template) {
    template.body = body;
    if (title) template.title = title;
    saveDB(db);
    return res.json({ success: true, template });
  }
  res.status(404).json({ error: "القالب غير موجود" });
});

//---------------------------------------------------------
// Returns Operations
//---------------------------------------------------------
app.get("/api/returns", (req, res) => {
  const db = loadDB();
  res.json(db.returns);
});

app.post("/api/returns", (req, res) => {
  const { orderNumber, reason, productCondition, opened, notes } = req.body;
  const db = loadDB();

  const o = db.orders.find((ord) => ord.orderNumber === orderNumber);
  if (!o) {
    return res.status(404).json({ error: "عذراً، لم نجد طلب بهذا الرقم في السجلات." });
  }

  // Set order return requested status
  o.returnRequested = true;
  o.status = "مرتجع";
  o.updatedAt = new Date().toISOString();

  // Run automated decision rules
  let decision: "قبول مبدئي" | "رفض مبدئي" | "يحتاج مراجعة" = "يحتاج مراجعة";
  let decisionReason = "يجب التحقق من حالة المنتج بواسطة إدارة المتجر.";
  let customerMsg = `مرحبًا ${o.customerName}، لقد تلقينا طلب إرجاع طلبك رقم ${orderNumber}. طلبك حالياً تحت المراجعة الفنية وسنتصل بك قريبًا.`;

  if (productCondition === "سليم ومغلف" && !opened) {
    decision = "قبول مبدئي";
    decisionReason = "المنتج سليم، في حالته الأصلية المغلقة، وضمن المهلة القانونية لسياسة إرجاع المتجر.";
    customerMsg = `مرحبًا ${o.customerName}، يسعدنا إفادتك بالموافقة المبدئية على إرجاع طلبك رقم ${orderNumber}. سنقوم بإرسال بوليصة شحن عكسية لك لمتابعة الاستلام عبر ${o.carrier}.`;
  } else if (opened && !db.settings.openedReturnable) {
    decision = "رفض مبدئي";
    decisionReason = "تم فتح غلاف المنتج الخارجي، وسياسة المتجر تمنع إرجاع المنتجات المفتوحة لأسباب صحية وتجميلية.";
    customerMsg = `مرحبًا ${o.customerName}، نأسف لإبلاغك بأن طلب إرجاع طلبك رقم ${orderNumber} لا يمكن قبوله نظرًا لفتح غلاف المنتج مما يتعارض مع سياسة الإرجاع.`;
  }

  const newReturn = {
    id: "ret-" + Date.now(),
    storeId: o.storeId,
    orderId: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    reason,
    productCondition,
    opened,
    decision,
    decisionReason,
    customerMessage: customerMsg,
    status: "open" as const,
    createdAt: new Date().toISOString(),
  };

  db.returns.unshift(newReturn);

  // Sync / rebuild audit tasks
  db.tasks.push({
    id: "tsk-ret-" + Date.now(),
    storeId: o.storeId,
    taskType: "review_return",
    title: `مراجعة مرتجع طلب #${o.orderNumber}`,
    description: `طلب إرجاع جديد للعميل ${o.customerName} بسبب: ${reason}. القرار المقترح: ${decision}`,
    priority: decision === "يحتاج مراجعة" ? "high" : "low",
    status: "open",
    relatedOrderId: o.id,
    createdAt: new Date().toISOString(),
  });

  saveDB(db);
  res.json({ success: true, returnRequest: newReturn });
});

// Update return status
app.post("/api/returns/update-status", (req, res) => {
  const { returnId, status, decision } = req.body;
  const db = loadDB();
  const ret = db.returns.find((r) => r.id === returnId);
  if (ret) {
    ret.status = status;
    if (decision) ret.decision = decision;
    saveDB(db);
    return res.json({ success: true, returnRequest: ret });
  }
  res.status(404).json({ error: "الطلب غير موجود" });
});

//---------------------------------------------------------
// Settings Api
//---------------------------------------------------------
app.get("/api/settings", (req, res) => {
  const db = loadDB();
  res.json(db.settings);
});

app.post("/api/settings", (req, res) => {
  const db = loadDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json({ success: true, settings: db.settings });
});

//---------------------------------------------------------
// Salla OAuth & Webhook endpoints
//---------------------------------------------------------
app.get("/api/salla/connect", (req, res) => {
  // Salla Partners "Easy Mode" uses the installation URL, not the custom OAuth redirect URL.
  // The access token is delivered later to /api/webhooks/salla through the app.store.authorize event.
  const appId = process.env.SALLA_APP_ID || process.env.SALLA_APPLICATION_ID;

  if (appId) {
    return res.redirect(`https://s.salla.sa/apps/install/${encodeURIComponent(appId)}`);
  }

  // Fallback for local Custom Mode testing only. Published Salla apps should keep Easy Mode.
  const clientId = process.env.SALLA_CLIENT_ID;
  const redirectUri = process.env.SALLA_REDIRECT_URI;

  if (clientId && redirectUri) {
    const sallaAuthUrl = `https://accounts.salla.sa/oauth2/auth?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=offline_access&state=raqeeb-demo`;
    return res.redirect(sallaAuthUrl);
  }

  return res.status(400).send(`
    <div style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; direction: rtl; background-color: #0b192f; color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <h2 style="color: #ef4444; margin-bottom: 20px;">عذرًا، تهيئة الربط غير مكتملة</h2>
      <p style="font-size: 16px; color: #cbd5e1; max-width: 650px; line-height: 1.8; margin: 0 auto 20px auto;">
        تطبيق سلة مضبوط الآن على النمط السهل. أضف متغير البيئة SALLA_APP_ID في Render بقيمة رقم التطبيق من بوابة شركاء سلة،
        ثم أعد النشر. بعد ذلك سيحولك زر الربط إلى رابط تثبيت التطبيق داخل سلة.
      </p>
      <code style="direction:ltr; background: rgba(255,255,255,0.08); color:#10b981; padding:10px 14px; border-radius:8px;">SALLA_APP_ID=1352380080</code>
    </div>
  `);
});

app.get("/api/salla/callback", (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`
      <div style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; direction: rtl; background-color: #0b192f; color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h2 style="color: #ef4444; margin-bottom: 20px;">فشل الربط مع سلة</h2>
        <p style="font-size: 16px; color: #cbd5e1; max-width: 600px; line-height: 1.8; margin: 0 auto 20px auto;">
          حدث خطأ أثناء محاولة الحصول على الصلاحيات من منصة سلة: <br/>
          <span style="font-family: monospace; color: #f43f5e; background-color: rgba(244, 63, 94, 0.1); padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 10px;">
            ${error_description || error}
          </span>
        </p>
        <button onclick="window.close()" style="margin-top: 20px; background-color: #10b981; color: #0b192f; border: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; cursor: pointer;">إغلاق</button>
      </div>
    `);
  }

  if (!code) {
    return res.status(400).send("مؤشر مفقود: لم يتم استلام رمز الموافقة (code) من سلة.");
  }

  // TODO / FUTURE DEVELOPMENT:
  // Here, we would exchange the 'code' for an access_token and refresh_token
  // using Salla's token endpoint: POST https://accounts.salla.sa/oauth2/token
  // with SALLA_CLIENT_ID and SALLA_CLIENT_SECRET.
  // SALLA_CLIENT_SECRET must never be hardcoded or embedded directly inside the code repository.
  
  res.send(`
    <div style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; direction: rtl; background-color: #0b192f; color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <div style="background-color: #10b981; color: #0b192f; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 25px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);">✓</div>
      <h2 style="color: #10b981; margin-bottom: 15px;">تم الربط التجريبي بنجاح!</h2>
      <p style="font-size: 16px; color: #cbd5e1; max-width: 600px; line-height: 1.8; margin: 0 auto 20px auto;">
        تم استقبال موافقة سلة بنجاح (رمز الموافقة المستلم: <span style="font-family: monospace; color: #10b981; font-weight: bold;">${code}</span>).<br/>
        التطبيق يعمل الآن بوضع العرض (Demo Mode)، وسيتم لاحقًا استبدال الرمز برمز الوصول الفعلي (access_token) لتفعيل المزامنة المباشرة التلقائية لبيانات السلات المتروكة والطلبات.
      </p>
      <button onclick="window.close()" style="margin-top: 25px; background-color: #10b981; color: #0b192f; border: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.3s;">إغلاق الصفحة والعودة لرقيب</button>
    </div>
  `);
});

app.post("/api/webhooks/salla", (req, res) => {
  const event = req.body?.event || req.body?.action || req.body?.event_type || "unknown_event";
  console.log(`[Salla Webhook] Received Event Type: ${event}`);

  // Demo-safe webhook persistence. Later this should map events to orders, shipments, returns, and carts.
  const db = loadDB();
  const anyDb = db as any;
  if (!anyDb.webhookEvents) anyDb.webhookEvents = [];
  anyDb.webhookEvents.unshift({
    id: "webhook-" + Date.now(),
    provider: "salla",
    eventType: event,
    payload: req.body || {},
    processed: true,
    createdAt: new Date().toISOString(),
  });
  saveDB(db);

  res.json({ status: "ok", received: true, event });
});

app.get("/api/salla/status", (req, res) => {
  res.json({ connected: false, mode: "easy_demo", appIdConfigured: Boolean(process.env.SALLA_APP_ID || process.env.SALLA_APPLICATION_ID) });
});

//---------------------------------------------------------
// Manual CSV upload imports
//---------------------------------------------------------
app.post("/api/upload", (req, res) => {
  const { orders } = req.body; // Expect array of raw parsed orders
  if (!orders || !Array.isArray(orders)) {
    return res.status(400).json({ error: "تنسيق البيانات المرفوعة غير صحيح" });
  }

  const db = loadDB();
  const store = getCurrentStore(req);
  if (!store) {
    return res.status(400).json({ error: "المتجر غير متصل" });
  }

  let importedCount = 0;
  orders.forEach((row: any) => {
    // Generate order from row safely
    const num = row.order_number || row.order_id || Math.floor(10000 + Math.random() * 90000).toString();
    const existingOrder = db.orders.find((o) => o.orderNumber === num.toString());
    
    if (existingOrder) return; // skip duplicates

    const newOrd = {
      id: "ord-csv-" + Math.floor(Math.random() * 99999) + "-" + Date.now(),
      storeId: store.id,
      sallaOrderId: row.salla_order_id || null,
      orderNumber: num.toString(),
      customerName: row.customer_name || "عميل غير مسمى",
      customerPhone: row.phone || row.customer_phone || "",
      customerCity: row.city || row.customer_city || "الرياض",
      carrier: row.carrier || "سمسا",
      orderDate: row.order_date || new Date().toISOString().substring(0, 10),
      status: row.status || "تم الشحن",
      lastUpdate: row.last_update || new Date().toISOString(),
      total: parseFloat(row.total) || 150.0,
      returnRequested: String(row.return_requested).toLowerCase() === "true",
      followupStatus: "new" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrd);

    // Compute analysis
    const analysis = analyzeOrder(newOrd, db.settings, db.orders);
    db.orderAnalysis.push({
      id: "an-" + newOrd.id,
      orderId: newOrd.id,
      ...analysis,
      createdAt: new Date().toISOString(),
    });

    importedCount++;
  });

  saveDB(db);
  res.json({ success: true, count: importedCount });
});

//---------------------------------------------------------
// Tasks Api
//---------------------------------------------------------
app.get("/api/tasks", (req, res) => {
  const db = loadDB();
  res.json(db.tasks);
});

app.post("/api/tasks/toggle", (req, res) => {
  const { taskId } = req.body;
  const db = loadDB();
  const t = db.tasks.find((task) => task.id === taskId);
  if (t) {
    t.status = t.status === "completed" ? "open" : "completed";
    saveDB(db);
    return res.json({ success: true, task: t });
  }
  res.status(404).json({ error: "المهمة غير موجودة" });
});

// Load Demo Trigger API
app.post("/api/demo/load", async (req, res) => {
  const db = getInitialDB();
  db.orders = [];
  db.orderAnalysis = [];
  db.returns = [];
  db.tasks = [];
  db.customerAlerts = [];
  seedDemoOrdersIfNeeded(db);
  await triggerDelayedNotifications(db);
  res.json({ success: true, message: "تمت إعادة تهيئة البيانات التجريبية بنجاح وتلقيم التنبيهات التلقائية" });
});

//---------------------------------------------------------
// Customer Alerts & Delayed Notifications Engine
//---------------------------------------------------------
async function triggerDelayedNotifications(db: DBStructure): Promise<number> {
  if (!db.customerAlerts) {
    db.customerAlerts = [];
  }

  const settings = db.settings;
  const enableEmail = settings.enableEmailAlerts !== false;
  const enableSMS = settings.enableSMSAlerts !== false;
  const thresholdHours = parseFloat(settings.alertDelayThresholdHours) || 24;

  const now = new Date();
  let triggeredCount = 0;

  for (const order of db.orders) {
    // Only process for delayed orders
    if (order.status !== "متأخر") continue;

    const baseDate = order.lastUpdate ? new Date(order.lastUpdate) : new Date(order.orderDate);
    const diffMs = now.getTime() - baseDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // If delayed after threshold (e.g. 24 hours)
    if (diffHours >= thresholdHours) {
      // 1. Send Email Alert if enabled & not yet sent
      if (enableEmail) {
        const alreadyEmail = db.customerAlerts.some(
          (a) => a.orderId === order.id && a.type === "email"
        );
        if (!alreadyEmail) {
          let message = settings.emailTemplateBody || "شريكنا العزيز {customer_name}، شحنتك رقم {order_number} المتجهة إلى {customer_city} مع الناقل {carrier} قد تتأخر قليلاً عن الموعد المعتاد بـ 24 ساعة. نعمل جاهدين لتسليمها بأسرع وقت.";
          message = message
            .replace(/{customer_name}/g, order.customerName)
            .replace(/{order_number}/g, order.orderNumber)
            .replace(/{customer_city}/g, order.customerCity || "مدينتك")
            .replace(/{city}/g, order.customerCity || "مدينتك")
            .replace(/{carrier}/g, order.carrier || "شركة الشحن");

          // Optional: utilize Gemini API to craft a more elegant notification message
          if (ai) {
            try {
              const gPrompt = `أنت مساعد ولاء الذكي للبريد والاتصالات. قم بصياغة بريد إلكتروني أنيق للغاية واحترافي يعتذر من العميل على تأخر شحنته لأكثر من 24 ساعة:
اسم العميل: ${order.customerName}
رقم الطلب: ${order.orderNumber}
المدينة: ${order.customerCity}
الناقل: ${order.carrier}
المسودة: "${message}"
اكتب لي نص البريد الإلكتروني باللغة العربية الفصحى المبسطة أو لهجة سعودية بيضاء محببة مباشرة بدون أي كلام إضافي أو شروحات أو مقدمات.`;
              const response = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: gPrompt,
              });
              if (response.text) {
                message = response.text.trim();
              }
            } catch (err) {
              console.warn("Gemini prompt for auto-email-alert fallback:", err?.message || err);
            }
          }

          db.customerAlerts.unshift({
            id: `alert-email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            recipient: order.customerPhone ? `${order.customerName} (البريد الإلكتروني)` : "بريد العميل الافتراضي",
            type: "email",
            channel: "البريد الإلكتروني",
            status: "sent",
            sentAt: new Date().toISOString(),
            message,
            carrier: order.carrier,
            city: order.customerCity,
          });

          // Create a task record for audit-trail
          db.tasks.push({
            id: "tsk-alert-" + Date.now() + "-email",
            storeId: order.storeId,
            taskType: "other",
            title: `تنبيه بريد تلقائي للطلب #${order.orderNumber}`,
            description: `تنبيه تلقائي عبر البريد الإلكتروني للعميل ${order.customerName} لتأخر الشحنة لأكثر من ${thresholdHours} ساعة.`,
            priority: "low",
            status: "completed",
            relatedOrderId: order.id,
            createdAt: new Date().toISOString(),
          });

          triggeredCount++;
        }
      }

      // 2. Send SMS Alert if enabled & has phone & not yet sent
      if (enableSMS && order.customerPhone) {
        const alreadySMS = db.customerAlerts.some(
          (a) => a.orderId === order.id && a.type === "sms"
        );
        if (!alreadySMS) {
          let message = settings.smsTemplateBody || "عميلنا العزيز {customer_name}، نعتذر عن تأخر شحنتك مع {carrier} رقم {order_number}. نعمل على تصعيدها وتسليمها لك عاجلاً.";
          message = message
            .replace(/{customer_name}/g, order.customerName)
            .replace(/{order_number}/g, order.orderNumber)
            .replace(/{customer_city}/g, order.customerCity || "مدينتك")
            .replace(/{city}/g, order.customerCity || "مدينتك")
            .replace(/{carrier}/g, order.carrier || "شركة الشحن");

          // Optional: utilize Gemini API to craft polite SMS
          if (ai) {
            try {
              const gPrompt = `أنت مساعد ولاء الذكي للاتصالات. قم بصياغة رسالة SMS سعودية قصيرة وودية للغاية (شاملة ايموجيات مطمئنة) تعتذر من العميل على تأخر شحنته لأكثر من 24 ساعة:
اسم العميل: ${order.customerName}
رقم الطلب: ${order.orderNumber}
المدينة: ${order.customerCity}
الناقل: ${order.carrier}
المسودة: "${message}"
اكتب لي نص الرسالة المباشرة لنسخها فوراً، لا تكتب أي كلام إضافي أو شروحات جانبية.`;
              const response = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: gPrompt,
              });
              if (response.text) {
                message = response.text.trim();
              }
            } catch (err) {
              console.warn("Gemini prompt for auto-sms-alert fallback:", err?.message || err);
            }
          }

          db.customerAlerts.unshift({
            id: `alert-sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            recipient: order.customerPhone,
            type: "sms",
            channel: "SMS",
            status: "sent",
            sentAt: new Date().toISOString(),
            message,
            carrier: order.carrier,
            city: order.customerCity,
          });

          db.tasks.push({
            id: "tsk-alert-" + Date.now() + "-sms",
            storeId: order.storeId,
            taskType: "other",
            title: `تنبيه SMS تلقائي للطلب #${order.orderNumber}`,
            description: `تنبيه تلقائي عبر رسالة نصية SMS للعميل ${order.customerName} لتأخر الشحنة لأكثر من ${thresholdHours} ساعة.`,
            priority: "low",
            status: "completed",
            relatedOrderId: order.id,
            createdAt: new Date().toISOString(),
          });

          triggeredCount++;
        }
      }
    }
  }

  if (triggeredCount > 0) {
    saveDB(db);
  }
  return triggeredCount;
}

// GET sent customer alerts
app.get("/api/customer-alerts", (req, res) => {
  const db = loadDB();
  res.json(db.customerAlerts || []);
});

// POST to add/log a WhatsApp/SMS/Email customer alert
app.post("/api/customer-alerts", (req, res) => {
  const db = loadDB();
  if (!db.customerAlerts) db.customerAlerts = [];
  const alert = {
    id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sentAt: new Date().toISOString(),
    ...req.body
  };
  db.customerAlerts.unshift(alert);
  saveDB(db);
  res.json({ success: true, alert });
});

// POST to manually trigger/scan delayed notifications
app.post("/api/customer-alerts/trigger", async (req, res) => {
  const db = loadDB();
  try {
    const count = await triggerDelayedNotifications(db);
    res.json({ success: true, triggeredCount: count, message: `جاري فحص الشحنات المتأخرة... تم إرسال وتوليد ${count} تنبيهات عملاء جديدة بعد انقضاء 24 ساعة بمساعدة Gemini.` });
  } catch (err: any) {
    res.status(500).json({ error: "فشل استدعاء محرك تنبيهات العملاء المجدولة", feedback: err.message });
  }
});

// POST to send a single test alert directly (email/sms)
app.post("/api/customer-alerts/send-test", async (req, res) => {
  const { orderId, type } = req.body;
  const db = loadDB();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "الطلب غير موجود" });
  }

  const settings = db.settings;
  const isSMS = type === 'sms';
  const recipient = isSMS ? (order.customerPhone || "966501234567") : `${order.customerName} (بريد تجريبي)`;
  
  let templateText = isSMS 
    ? (settings.smsTemplateBody || "عميلنا العزيز {customer_name}، نعتذر عن تأخر شحنتك مع {carrier} رقم {order_number}. نعمل على تصعيدها وتسليمها لك عاجلاً.")
    : (settings.emailTemplateBody || "شريكنا العزيز {customer_name}، شحنتك رقم {order_number} المتجهة إلى {customer_city} مع الناقل {carrier} قد تتأخر قليلاً عن الموعد المعتاد بـ 24 ساعة. نعمل جاهدين لتسليمها بأسرع وقت.");

  let message = templateText
    .replace(/{customer_name}/g, order.customerName)
    .replace(/{order_number}/g, order.orderNumber)
    .replace(/{customer_city}/g, order.customerCity || "مدينتك")
    .replace(/{city}/g, order.customerCity || "مدينتك")
    .replace(/{carrier}/g, order.carrier || "شركة الشحن");

  if (ai) {
    try {
      const gPrompt = isSMS 
        ? `أنت مساعد ولاء الذكي لخدمة العملاء. قم بصياغة تنبيه SMS اعتذاري لطيف مع ايموجي لمشكلة تأخر شحنة في متجر سلة:
العميل: ${order.customerName}
الرقم: ${order.orderNumber}
الناقل: ${order.carrier}
المسودة: "${message}"
اكتب لي الرسالة لنسخها فوراً، لا تكتب أي كلام إضافي أو شروحات.`
        : `أنت مساعد ولاء الذكي لخدمة وصياغة البريد. قم بصياغة بريد إلكتروني أنيق واحترافي يعتذر لعميل متجر سلة لمشكلة تأخر شحنته أكثر من 24 ساعة:
العميل: ${order.customerName}
الرقم: ${order.orderNumber}
المدينة: ${order.customerCity}
الناقل: ${order.carrier}
المسودة: "${message}"
اكتب لي نص البريد الإلكتروني بالعربية الفصحى لنسخه فوراً، لا تكتب أي كلام إضافي أو شروحات.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: gPrompt,
      });
      if (response.text) {
        message = response.text.trim();
      }
    } catch (e) {
      console.warn("Gemini test alert prompt fallback:", e?.message || e);
    }
  }

  if (!db.customerAlerts) db.customerAlerts = [];
  
  const newAlert = {
    id: `alert-test-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    recipient,
    type,
    channel: isSMS ? "SMS" : "البريد الإلكتروني",
    status: "sent",
    sentAt: new Date().toISOString(),
    message,
    carrier: order.carrier,
    city: order.customerCity,
    isTest: true
  };

  db.customerAlerts.unshift(newAlert);
  
  // Add task audit trail
  db.tasks.push({
    id: "tsk-alert-test-" + Date.now(),
    storeId: order.storeId,
    taskType: "other",
    title: `إرسال تنبيه تجريبي ومحاكاة (${isSMS ? 'SMS' : 'بريد'}) للطلب #${order.orderNumber}`,
    description: `أمر يدوي من لوحة التحكم لإرسال ومحاكاة تنبيه العميل ${order.customerName} عبر ${isSMS ? 'SMS' : 'البريد الإلكتروني'}.`,
    priority: "low",
    status: "completed",
    relatedOrderId: order.id,
    createdAt: new Date().toISOString(),
  });

  saveDB(db);
  res.json({ success: true, alert: newAlert });
});

//---------------------------------------------------------
// Abandoned Carts APIs
//---------------------------------------------------------
app.get("/api/abandoned-carts", (req, res) => {
  const db = loadDB();
  res.json(db.abandonedCarts || []);
});

app.post("/api/abandoned-carts/:id/recover", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  if (!db.abandonedCarts) db.abandonedCarts = [];
  
  const cart = db.abandonedCarts.find(c => c.id === id);
  if (cart) {
    cart.status = "recovered";
    
    // Log audit trail
    db.tasks.push({
      id: "tsk-cart-rec-" + Date.now(),
      storeId: db.stores[0]?.id || "demo-store-id",
      taskType: "other",
      title: `استرجاع سلة متروكة لـ ${cart.customerName}`,
      description: `تم وضع علامة "تم استرجاع السلة" يدويًا للعميل بقيمة ${cart.cartValue} ريال.`,
      priority: "medium",
      status: "completed",
      createdAt: new Date().toISOString()
    });
    
    saveDB(db);
    return res.json({ success: true, cart });
  }
  res.status(404).json({ error: "السلة غير موجودة" });
});

app.post("/api/abandoned-carts/:id/coupon", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  if (!db.abandonedCarts) db.abandonedCarts = [];
  
  const cart = db.abandonedCarts.find(c => c.id === id);
  if (cart) {
    // Generate code
    const discount = cart.cartValue > 300 ? 15 : 10;
    const code = `RAQEEB${discount}`;
    cart.couponCode = code;
    
    // Log audit trail
    db.tasks.push({
      id: "tsk-cart-coup-" + Date.now(),
      storeId: db.stores[0]?.id || "demo-store-id",
      taskType: "other",
      title: `كوبون خصم سلة لـ ${cart.customerName}`,
      description: `تم إنشاء كوبون خصم مخصص ${code} (خصم ${discount}%) لاستعادة السلة المتروكة رقم ${cart.cartNumber}.`,
      priority: "low",
      status: "completed",
      createdAt: new Date().toISOString()
    });
    
    saveDB(db);
    return res.json({ success: true, cart, code });
  }
  res.status(404).json({ error: "السلة غير موجودة" });
});

app.post("/api/abandoned-carts/:id/send-whatsapp", (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const db = loadDB();
  if (!db.abandonedCarts) db.abandonedCarts = [];
  if (!db.customerAlerts) db.customerAlerts = [];
  
  const cart = db.abandonedCarts.find(c => c.id === id);
  if (cart) {
    cart.status = "communicated";
    
    // Add to alerts
    const alert = {
      id: `alert-wa-cart-${Date.now()}`,
      orderId: cart.id,
      orderNumber: cart.cartNumber,
      customerName: cart.customerName,
      recipient: cart.customerPhone,
      type: "whatsapp",
      channel: "واتساب التلقائي",
      status: "sent",
      sentAt: new Date().toISOString(),
      message: message || `مرحبًا ${cart.customerName}، لاحظنا أنك تركت منتجات رائعة في سلتك. نوفر لك خصم خاص لإتمام الشراء!`
    };
    db.customerAlerts.unshift(alert);
    
    // Log audit trail
    db.tasks.push({
      id: "tsk-cart-wa-" + Date.now(),
      storeId: db.stores[0]?.id || "demo-store-id",
      taskType: "other",
      title: `تنبيه سلة متروكة عبر واتساب لـ ${cart.customerName}`,
      description: `تم إرسال ومحاكاة رسالة واتساب لاستعادة السلة المتروكة رقم ${cart.cartNumber}.`,
      priority: "high",
      status: "completed",
      createdAt: new Date().toISOString()
    });
    
    saveDB(db);
    return res.json({ success: true, cart, alert });
  }
  res.status(404).json({ error: "السلة غير موجودة" });
});

app.post("/api/abandoned-carts/:id/analyze", async (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  if (!db.abandonedCarts) db.abandonedCarts = [];
  
  const cart = db.abandonedCarts.find(c => c.id === id);
  if (!cart) {
    return res.status(404).json({ error: "السلة غير موجودة" });
  }

  // Set default analysis text if API fails
  let advice = `يُنصح بتقديم خصم فوري بنسبة 10% إلى 15% للعميل لتحفيزه على إتمام الدفع. المنتجات التي تركها هي "${cart.products}" وهي ذات طلب مرتفع حالياً.`;
  let draftedMsg = `أهلاً بك يا ${cart.customerName} 🌸\nيسعدنا تواصلك مع متجرنا! لاحظنا أنك نسيت بعض القطع الفاخرة في سلتك:\n- ${cart.products}\n\nحرصاً منا على رضاك، حجزنا لك المنتجات وسوينا لك كوبون خصم خاص: [${cart.couponCode || "RAQEEB10"}]\nتقدر تنسخ الكوبون وتكمل طلبك بسهولة من متجرنا.\n\nتمنياتنا لك بيوم سعيد! ✨`;

  if (ai) {
    try {
      const gPrompt = `أنت مساعد رقيب التجارة الذكي (Raqeeb Commerce AI) المتخصص في استعادة السلات المتروكة لمتاجر سلة السعودية.
قم بتحليل السلة المتروكة التالية واقترح نصيحة سريعة ومختصرة للتاجر (كيفية إقناع العميل) ثم صغ رسالة واتساب غاية في اللطف والمرح والذكاء باللهجة السعودية البيضاء المحببة (مع ايموجيات جذابة) لإقناع العميل بالعودة لإنهاء الشراء.

معلومات السلة:
اسم العميل: ${cart.customerName}
المنتجات في السلة: ${cart.products}
قيمة السلة الإجمالية: ${cart.cartValue} ريال سعودي
الأولوية: ${cart.priority}
كوبون الخصم النشط: ${cart.couponCode || "لا يوجد كوبون حالياً، صغ له كوبون RAQEEB10 لتبهر العميل"}

الرجاء تقسيم الإجابة إلى قسمين واضحين كالتالي:
[ADVICE]
اكتب هنا نصيحة ذكية وجذابة موجهة لتاجر المتجر حول سبب ترك العميل لهذه المنتجات بالذات وتوصية استباقية لاستعادتها.
[MESSAGE]
اكتب هنا فقط نص الرسالة اللطيف والجاهز للإرسال للعميل عبر واتساب مباشرة لنسخه بلمسة زر واحدة.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: gPrompt,
      });

      if (response.text) {
        const fullText = response.text.trim();
        const adviceMatch = fullText.match(/\\[ADVICE\\]([\\s\\S]*?)(?:\\[MESSAGE\\]|$)/i) || fullText.match(/\[ADVICE\]([\s\S]*?)(?:\[MESSAGE\]|$)/i);
        const messageMatch = fullText.match(/\\[MESSAGE\\]([\\s\\S]*)$/i) || fullText.match(/\[MESSAGE\]([\s\S]*)$/i);
        
        if (adviceMatch && adviceMatch[1]) {
          advice = adviceMatch[1].trim();
        }
        if (messageMatch && messageMatch[1]) {
          draftedMsg = messageMatch[1].trim();
        } else if (!adviceMatch) {
          // Fallback parsing
          const split = fullText.split("\n\n");
          if (split.length >= 2) {
            advice = split[0];
            draftedMsg = split.slice(1).join("\n\n");
          }
        }
      }
    } catch (err: any) {
      console.warn("Gemini prompt for abandoned cart analysis failed, using fallback:", err?.message || err);
    }
  }

  cart.analysis = JSON.stringify({ advice, draftedMsg });
  saveDB(db);
  res.json({ success: true, advice, draftedMsg, cart });
});

// Vite pipeline integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Raqeeb Commerce Backend server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
