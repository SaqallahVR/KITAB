import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = React.useState("login");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setError("");
      setPassword("");
      setConfirmPassword("");
      setMode("login");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register" && password !== confirmPassword) {
        throw new Error("كلمتا المرور غير متطابقتين.");
      }

      if (mode === "register") {
        await base44.auth.register({ fullName, email, password });
      } else {
        await base44.auth.login({ email, password });
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl" dir="rtl">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-5 top-5 text-sm text-slate-500 hover:text-slate-700"
        >
          إغلاق
        </button>

        <div className="px-8 py-10">
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
