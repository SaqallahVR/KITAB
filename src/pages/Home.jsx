import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Users, Video, Award, Star, GraduationCap, BookMarked, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Home() {
  const [stats, setStats] = React.useState({
    courses: 0,
    writers: 0,
    students: 0
  });

  React.useEffect(() => {
    Promise.all([
      base44.entities.Course.list(),
      base44.entities.Writer.list(),
      base44.entities.Subscription.list()
    ]).then(([courses, writers, subscriptions]) => {
      setStats({
        courses: courses.filter(c => c.published).length,
        writers: writers.filter(w => w.active).length,
        students: new Set(subscriptions.map(s => s.user_email)).size
      });
    });
  }, []);

  const features = [
    {
      icon: Video,
      title: "دورات متكاملة",
      description: "محتوى تعليمي احترافي بالفيديو والتمارين التطبيقية"
    },
    {
      icon: Users,
      title: "إرشاد شخصي",
      description: "جلسات فردية مع كتّاب ومرشدين متخصصين"
    },
    {
      icon: Award,
      title: "شهادات معتمدة",
      description: "احصل على شهادة إتمام لكل دورة تنهيها"
    },
    {
      icon: BookOpen,
      title: "محتوى متنوع",
      description: "من الكتابة الإبداعية إلى النقد الأدبي"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A2520] to-[#1A1A1A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#D4AF37] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-[#D4AF37]/30">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm text-[#D4AF37] font-medium">منصة التعليم الأدبي الأولى</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                رحلتك الأدبية
                <span className="block text-[#D4AF37]">تبدأ هنا</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                تعلم الكتابة الإبداعية، الرواية، الشعر، والمقالة من خبراء متخصصين. احصل على إرشاد شخصي وطوّر موهبتك الأدبية.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl("Courses")}>
                  <Button size="lg" className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-white text-lg px-8 py-6 shadow-2xl shadow-[#D4AF37]/20">
                    <GraduationCap className="ml-2 w-5 h-5" />
                    استكشف الدورات
                  </Button>
                </Link>
                <Link to={createPageUrl("Mentorship")}>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white/30 hover:bg-white/10 backdrop-blur-sm">
                    <BookMarked className="ml-2 w-5 h-5" />
                    الإرشاد الأدبي
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-3xl blur-2xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80" 
                  alt="كتب"
                  className="relative rounded-3xl shadow-2xl w-full object-cover h-[500px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-black text-[#D4AF37] mb-2">{stats.courses}+</div>
              <p className="text-gray-600 font-medium">دورة تعليمية</p>
            </div>
            <div className="text-center border-r border-l border-gray-200">
              <div className="text-5xl font-black text-[#D4AF37] mb-2">{stats.writers}+</div>
              <p className="text-gray-600 font-medium">كاتب ومرشد</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-[#D4AF37] mb-2">{stats.students}+</div>
              <p className="text-gray-600 font-medium">طالب متفاعل</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F5F1E8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#1A1A1A] mb-4">لماذا كتاب؟</h2>
            <p className="text-xl text-gray-600">منصة شاملة لتطوير مهاراتك الأدبية</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#1A1A1A] to-[#2A2520] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">ابدأ رحلتك الأدبية اليوم</h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            انضم لآلاف الكتّاب والمبدعين وطوّر موهبتك مع أفضل المدربين والمرشدين
          </p>
          <Link to={createPageUrl("Courses")}>
            <Button size="lg" className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-white text-lg px-10 py-6 shadow-2xl shadow-[#D4AF37]/20">
              <ArrowLeft className="ml-2 w-5 h-5" />
              ابدأ الآن مجاناً
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}