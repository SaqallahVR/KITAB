// src/api/base44Client.js

// Mock data (بديل مؤقت عن Django API)
const MOCK_DB = {
  Course: [
  {
    id: "c1",
    published: true,
    title: "أساسيات الكتابة الإبداعية",
    description: "ابدأ من الصفر وتعلم بناء الفكرة والشخصيات والحبكة.",
    type: "free", // free | paid | mixed
    level: "beginner", // beginner | intermediate | advanced
    duration: "3 ساعات",
    instructor: "أ. نورة",
    price: 0,
    image_url: "",
    created_date: "2025-12-01",
  },
  {
    id: "c2",
    published: true,
    title: "تقنيات السرد وبناء الحبكة",
    description: "كيف تبني حبكة قوية وتكتب مشاهد مؤثرة بدون ملل.",
    type: "paid",
    level: "intermediate",
    duration: "6 ساعات",
    instructor: "أ. خالد",
    price: 149,
    image_url: "",
    created_date: "2025-12-10",
  },
  {
    id: "c3",
    published: true,
    title: "تطوير الأسلوب واللغة",
    description: "تمارين عملية لتطوير الأسلوب ورفع جودة النص.",
    type: "mixed",
    level: "advanced",
    duration: "8 ساعات",
    instructor: "أ. ريم",
    price: 199,
    image_url: "",
    created_date: "2025-12-20",
  },
  ],
  Writer: [
    {
      id: "w1",
      name: "د. سارة",
      active: true,
      specialty: "الكتابة الإبداعية",
      bio: "كاتبة وروائية بخبرة 10 سنوات.",
      image_url: "",
      email: "sara@ketab.com",
      created_date: "2025-11-15",
    },
    {
      id: "w2",
      name: "أ. خالد",
      active: true,
      specialty: "تقنيات السرد",
      bio: "مدرب كتابة ومحرر أدبي.",
      image_url: "",
      email: "khaled@ketab.com",
      created_date: "2025-11-20",
    },
  ],
  Subscription: [
    {
      id: "s1",
      user_email: "student@example.com",
      course_id: "c1",
      status: "active",
      created_date: "2025-12-12",
    },
    {
      id: "s2",
      user_email: "student2@example.com",
      course_id: "c2",
      status: "active",
      created_date: "2025-12-18",
    },
  ],
  Lesson: [
    {
      id: "l1",
      course_id: "c1",
      title: "مقدمة في الكتابة",
      content: "محتوى الدرس الأول.",
      order: 1,
    },
    {
      id: "l2",
      course_id: "c1",
      title: "بناء الفكرة",
      content: "محتوى الدرس الثاني.",
      order: 2,
    },
  ],
  MentorshipPackage: [
    {
      id: "p1",
      writer_id: "w1",
      name: "جلسة واحدة",
      sessions_count: 1,
      price: 200,
      description: "جلسة إرشاد فردية لمدة ساعة.",
    },
    {
      id: "p2",
      writer_id: "w1",
      name: "3 جلسات",
      sessions_count: 3,
      price: 500,
      description: "3 جلسات إرشاد فردية.",
    },
  ],
  AvailableSlot: [
    {
      id: "as1",
      writer_id: "w1",
      date: "2025-01-05",
      time: "18:00",
      is_available: true,
    },
    {
      id: "as2",
      writer_id: "w1",
      date: "2025-01-06",
      time: "20:00",
      is_available: true,
    },
  ],
  Booking: [],
};

// Helper: simple filter by object match { published: true }
function matchesWhere(item, where = {}) {
  return Object.entries(where).every(([k, v]) => item?.[k] === v);
}

// Helper: sort by "-created_date" or "created_date"
function sortBy(list, sortKey) {
  if (!sortKey) return list;
  const desc = sortKey.startsWith("-");
  const key = desc ? sortKey.slice(1) : sortKey;

  return [...list].sort((a, b) => {
    const av = a?.[key] ?? "";
    const bv = b?.[key] ?? "";
    // date strings compare OK as ISO, but we’ll be safe:
    const ad = new Date(av).getTime() || 0;
    const bd = new Date(bv).getTime() || 0;
    return desc ? bd - ad : ad - bd;
  });
}

function generateId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function createEntityApi(entityKey) {
  return {
    async list() {
      return [...MOCK_DB[entityKey]];
    },
    async filter(where = {}, sortKey) {
      const filtered = MOCK_DB[entityKey].filter((item) => matchesWhere(item, where));
      return sortBy(filtered, sortKey);
    },
    async create(data) {
      const item = { id: data.id || generateId(entityKey.toLowerCase()), ...data };
      MOCK_DB[entityKey].push(item);
      return item;
    },
    async update(id, updates) {
      const idx = MOCK_DB[entityKey].findIndex((item) => item.id === id);
      if (idx === -1) return null;
      MOCK_DB[entityKey][idx] = { ...MOCK_DB[entityKey][idx], ...updates };
      return MOCK_DB[entityKey][idx];
    },
  };
}

export const base44 = {
  auth: {
    async me() {
      return null; // later: real auth
    },
    async logout() {
      console.log("Logged out");
    },
    redirectToLogin() {
      alert("Login placeholder");
    },
  },

  // ✅ entities mock (بديل مؤقت لين Django)
  entities: {
    Course: createEntityApi("Course"),
    Writer: createEntityApi("Writer"),
    Subscription: createEntityApi("Subscription"),
    Lesson: createEntityApi("Lesson"),
    MentorshipPackage: createEntityApi("MentorshipPackage"),
    AvailableSlot: createEntityApi("AvailableSlot"),
    Booking: createEntityApi("Booking"),
  },

  integrations: {
    Core: {
      async SendEmail(payload) {
        console.log("Mock email sent", payload);
        return true;
      },
    },
  },
};

// (اختياري) لو حبيت تستخدم default import في بعض الملفات
export default base44;
