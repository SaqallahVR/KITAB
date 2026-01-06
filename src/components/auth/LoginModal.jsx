import React from "react";
import { kitabApi } from "@/api/kitabApiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function LoginModal({ open, onClose, onSuccess, initialMode = "login" }) {
  const [mode, setMode] = React.useState("login");
  const [fullName, setFullName] = React.useState("");
  const [role, setRole] = React.useState("student");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [registrationDone, setRegistrationDone] = React.useState(false);
  const [writerName, setWriterName] = React.useState("");
  const [writerNameTouched, setWriterNameTouched] = React.useState(false);
  const [writerBio, setWriterBio] = React.useState("");
  const [writerSpecialty, setWriterSpecialty] = React.useState("");
  const [writerExperience, setWriterExperience] = React.useState("");
  const [writerAchievements, setWriterAchievements] = React.useState("");
  const [writerImage, setWriterImage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const wasOpen = React.useRef(false);

  React.useEffect(() => {
    if (open && !wasOpen.current) {
      setError("");
      setPassword("");
      setConfirmPassword("");
      setMode(initialMode);
      setRole("student");
      setRegistrationDone(false);
      setWriterName("");
      setWriterNameTouched(false);
      setWriterBio("");
      setWriterSpecialty("");
      setWriterExperience("");
      setWriterAchievements("");
      setWriterImage(null);
    } else if (!open) {
      setError("");
      setPassword("");
      setConfirmPassword("");
    }
    wasOpen.current = open;
  }, [open, initialMode]);

  React.useEffect(() => {
    if (mode === "login") {
      setError("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [mode]);

  React.useEffect(() => {
    if (role === "writer" && !writerNameTouched && fullName) {
      setWriterName(fullName);
    }
  }, [role, fullName, writerNameTouched]);


  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register" && password !== confirmPassword) {
        throw new Error("كلمتا المرور غير متطابقتين.");
      }

      if (mode === "register" && role === "writer") {
        if (!writerName || !writerBio || !writerSpecialty || !writerImage) {
          throw new Error("يرجى تعبئة بيانات الكاتب المطلوبة وإرفاق الصورة.");
        }
      }

      if (mode === "register" && !registrationDone) {
        await kitabApi.auth.register({ fullName, email, password, role });
        setRegistrationDone(true);
      } else if (mode === "login") {
        await kitabApi.auth.login({ email, password });
      }

      if (mode === "register" && role === "writer") {
        const formData = new FormData();
        formData.append("name", writerName);
        formData.append("bio", writerBio);
        formData.append("specialty", writerSpecialty);
        formData.append("email", email);
        if (writerExperience) formData.append("experience", writerExperience);
        if (writerAchievements) formData.append("achievements", writerAchievements);
        if (writerImage) formData.append("image_file", writerImage);
        formData.append("active", "true");

        const writer = await kitabApi.entities.Writer.createForm(formData);
        onSuccess?.({ returnTo: `/writer-profile?id=${writer.id}` });
      } else {
        onSuccess?.();
      }
      onClose?.();
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex justify-start bg-white/95 px-8 pt-6 pb-2 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            إغلاق
          </button>
        </div>

        <div className="px-8 pb-10">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white shadow-inner flex items-center justify-center">
              <img src="/kitab.svg" alt="Kitab" className="h-12 w-12" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1a2433]">مرحباً بك في كتاب</h2>
              <p className="mt-1 text-sm text-slate-500">
                {mode === "register" ? "أنشئ حسابك للمتابعة" : "سجّل الدخول للمتابعة"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">الاسم الكامل</label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="فهد أحمد"
                  className="h-12 rounded-xl border-slate-200 bg-white"
                  required
                />
              </div>
            )}
            {mode === "register" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">
                  انضم ككاتب أو مدرّب
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "student", label: "طالب" },
                    { value: "writer", label: "كاتب" },
                    { value: "instructor", label: "مدرّب" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`h-11 rounded-xl border text-sm font-semibold transition-all ${
                        role === option.value
                          ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#1A1A1A]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  اختر الدور المناسب ثم أكمل بياناتك الأساسية للتسجيل.
                </p>
              </div>
            )}
            {mode === "register" && role === "writer" && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                <h3 className="text-sm font-bold text-[#1A1A1A]">بيانات الكاتب</h3>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">اسم الكاتب</label>
                  <Input
                    type="text"
                    value={writerName}
                    onChange={(event) => {
                      setWriterName(event.target.value);
                      setWriterNameTouched(true);
                    }}
                    placeholder="الاسم الذي سيظهر للطلاب"
                    className="h-11 rounded-xl border-slate-200 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">السيرة المختصرة</label>
                  <Textarea
                    value={writerBio}
                    onChange={(event) => setWriterBio(event.target.value)}
                    placeholder="عرّف بنفسك وخبرتك الكتابية"
                    className="rounded-xl border-slate-200 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">التخصص</label>
                  <Input
                    type="text"
                    value={writerSpecialty}
                    onChange={(event) => setWriterSpecialty(event.target.value)}
                    placeholder="مثال: كتابة الرواية، القصة القصيرة"
                    className="h-11 rounded-xl border-slate-200 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">الخبرة</label>
                  <Input
                    type="text"
                    value={writerExperience}
                    onChange={(event) => setWriterExperience(event.target.value)}
                    placeholder="مثال: 5 سنوات في الكتابة الإبداعية"
                    className="h-11 rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">الإنجازات</label>
                  <Textarea
                    value={writerAchievements}
                    onChange={(event) => setWriterAchievements(event.target.value)}
                    placeholder="جوائز أو كتب منشورة"
                    className="rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">صورة الكاتب</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setWriterImage(event.target.files?.[0] || null)}
                    className="h-11 rounded-xl border-slate-200 bg-white"
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">البريد الإلكتروني</label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 rounded-xl border-slate-200 bg-white pl-10 text-left"
                  dir="ltr"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  ✉
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">كلمة المرور</label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-slate-200 bg-white pl-10 text-left"
                  dir="ltr"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔒
                </span>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">تأكيد كلمة المرور</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-slate-200 bg-white text-left"
                  dir="ltr"
                  required
                />
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#d4af37] py-6 text-white hover:bg-[#b8941f]"
            >
              {loading
                ? mode === "register"
                  ? "جارٍ إنشاء الحساب..."
                  : "جارٍ تسجيل الدخول..."
                : mode === "register"
                ? "إنشاء حساب"
                : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
            <button type="button" className="hover:text-slate-700">
              نسيت كلمة المرور؟
            </button>
            {mode === "register" ? (
              <button
                type="button"
                className="hover:text-slate-700"
                onClick={() => setMode("login")}
              >
                لديك حساب؟ <span className="font-semibold">تسجيل الدخول</span>
              </button>
            ) : (
              <button
                type="button"
                className="hover:text-slate-700"
                onClick={() => setMode("register")}
              >
                ليس لديك حساب؟ <span className="font-semibold">إنشاء حساب</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
