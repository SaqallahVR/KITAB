import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, User, LogOut, GraduationCap, BookMarked } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LoginModal from "@/components/auth/LoginModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [loginMode, setLoginMode] = React.useState("login");
  const [returnTo, setReturnTo] = React.useState(null);

  React.useEffect(() => {
    const refreshUser = () => base44.auth.me().then(setUser).catch(() => setUser(null));
    refreshUser();

    const handleLoginRequest = (event) => {
      setReturnTo(event.detail?.returnTo || null);
      setLoginMode("login");
      setLoginOpen(true);
    };

    window.addEventListener("auth:login-request", handleLoginRequest);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("auth:login-request", handleLoginRequest);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    base44.auth.logout().finally(() => setUser(null));
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap');
        * { font-family: 'Tajawal', sans-serif; }
        :root {
          --primary: #D4AF37;
          --primary-dark: #B8941F;
          --beige: #FAF9F6;
          --dark: #1A1A1A;
          --gray: #6B6B6B;
        }
      `}</style>

      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#1A1A1A]">كتاب</h1>
                <p className="text-xs text-[#6B6B6B] -mt-1">منصة التعليم والإرشاد الأدبي</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link to={createPageUrl("Home")}>
                <Button
                  variant="ghost"
                  className={`px-6 ${
                    isActive(createPageUrl("Home"))
                      ? "text-[#D4AF37] bg-[#FAF9F6]"
                      : "text-[#1A1A1A] hover:bg-[#FAF9F6]"
                  }`}
                >
                  الرئيسية
                </Button>
              </Link>

              <Link to={createPageUrl("Courses")}>
                <Button
                  variant="ghost"
                  className={`px-6 gap-2 ${
                    isActive(createPageUrl("Courses"))
                      ? "text-[#D4AF37] bg-[#FAF9F6]"
                      : "text-[#1A1A1A] hover:bg-[#FAF9F6]"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  الدورات
                </Button>
              </Link>

              <Link to={createPageUrl("Mentorship")}>
                <Button
                  variant="ghost"
                  className={`px-6 gap-2 ${
                    isActive(createPageUrl("Mentorship"))
                      ? "text-[#D4AF37] bg-[#FAF9F6]"
                      : "text-[#1A1A1A] hover:bg-[#FAF9F6]"
                  }`}
                >
                  <BookMarked className="w-4 h-4" />
                  الإرشاد الأدبي
                </Button>
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2 bg-[#D4AF37] text-white hover:bg-[#B8941F]">
                      <User className="w-4 h-4" />
                      <span>{user.full_name}</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48">
                    <Link to={createPageUrl("Profile")}>
                      <DropdownMenuItem>
                        <User className="w-4 h-4 ml-2" />
                        الملف الشخصي
                      </DropdownMenuItem>
                    </Link>

                    <Link to={createPageUrl("MySubscriptions")}>
                      <DropdownMenuItem>
                        <GraduationCap className="w-4 h-4 ml-2" />
                        دوراتي
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 ml-2" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setLoginMode("register");
                      setLoginOpen(true);
                    }}
                    variant="outline"
                    className="border-[#D4AF37] text-[#1A1A1A] hover:bg-[#FAF9F6]"
                  >
                    انضم الينا
                  </Button>
                  <Button
                    onClick={() => {
                      setLoginMode("login");
                      setLoginOpen(true);
                    }}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-white shadow-lg"
                  >
                    تسجيل الدخول
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20">{children}</main>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        initialMode={loginMode}
        onSuccess={(payload) => {
          base44.auth.me().then(setUser).catch(() => setUser(null));
          const target = payload?.returnTo || returnTo;
          if (target) window.location.assign(target);
        }}
      />

      <footer className="bg-[#1A1A1A] text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
          <div className="grid md:grid-cols-3 gap-8 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">كتاب</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                منصة تعليمية متخصصة في الكتابة الإبداعية والأدب، نقدم دورات احترافية وإرشاد أدبي من كتّاب متميزين.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#D4AF37]">روابط سريعة</h4>
              <div className="space-y-2">
                <Link to={createPageUrl("Courses")} className="block text-gray-400 hover:text-[#D4AF37] transition-colors">
                  الدورات التعليمية
                </Link>
                <Link to={createPageUrl("Mentorship")} className="block text-gray-400 hover:text-[#D4AF37] transition-colors">
                  الإرشاد الأدبي
                </Link>
                <Link to={createPageUrl("Profile")} className="block text-gray-400 hover:text-[#D4AF37] transition-colors">
                  ملفي الشخصي
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#D4AF37]">تواصل معنا</h4>
              <p className="text-gray-400">للاستفسارات والدعم الفني</p>
              <p className="text-gray-400 mt-2">info@ketab.com</p>
            </div>
          </div>

  
        </div>
      </footer>
      <footer
  className=""
  style={{ background: "rgba(0, 0, 0, 0.78)" }}
>
  <div className="w-full px-6 py-3" dir="ltr">
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <a
        href="https://vr-house.net/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="VR House website"
        className="flex items-center"
      >
        <img
          src="/VR-House_logo.png"
          alt="VR House Logo"
          className="h-[21.5px] w-auto object-contain"
          style={{
            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.3))",
          }}
        />
      </a>

      <span className="text-white text-[10.5pt] leading-tight">
        © 2025 VR House – All Rights Reserved
      </span>
    </div>
  </div>
</footer>
    </div>
  );
}
