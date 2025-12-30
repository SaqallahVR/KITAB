import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookMarked, Star, Award, Calendar, Clock, CheckCircle2,
  MessageCircle, ArrowLeft
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WriterProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const writerId = urlParams.get('id');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: writer, isLoading: loadingWriter } = useQuery({
    queryKey: ['writer', writerId],
    queryFn: async () => {
      const writers = await base44.entities.Writer.filter({ id: writerId });
      return writers[0];
    },
    enabled: !!writerId,
  });

  const { data: packages, isLoading: loadingPackages } = useQuery({
    queryKey: ['packages', writerId],
    queryFn: () => base44.entities.MentorshipPackage.filter({ writer_id: writerId }, 'sessions_count'),
    initialData: [],
    enabled: !!writerId,
  });

  const { data: myBookings } = useQuery({
    queryKey: ['my-bookings', writerId, user?.email],
    queryFn: () => base44.entities.Booking.filter({
      writer_id: writerId,
      user_email: user?.email
    }),
    initialData: [],
    enabled: !!writerId && !!user,
  });

  const handleBookPackage = (pkg) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    
    // Navigate to booking page
    window.location.href = createPageUrl("BookingPage") + 
      "?writer_id=" + writerId + 
      "&package_id=" + pkg.id;
  };

  if (loadingWriter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Skeleton className="h-96 w-full mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!writer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>الكاتب غير موجود</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2520] text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 mb-4">
                <BookMarked className="w-4 h-4 ml-1" />
                {writer.specialty}
              </Badge>
              
              <h1 className="text-5xl font-black mb-4 leading-tight">
                {writer.name}
              </h1>
              
              {writer.experience && (
                <p className="text-xl text-[#D4AF37] mb-6 font-medium">
                  {writer.experience} خبرة في المجال الأدبي
                </p>
              )}
              
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                {writer.bio}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-lg px-8"
                  onClick={() => {
                    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Calendar className="ml-2 w-5 h-5" />
                  حجز جلسة
                </Button>
                {myBookings.length > 0 && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 text-base">
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                    لديك {myBookings.length} حجز مع هذا الكاتب
                  </Badge>
                )}
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-3xl blur-3xl"></div>
                {writer.image_url ? (
                  <img 
                    src={writer.image_url} 
                    alt={writer.name}
                    className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                  />
                ) : (
                  <div className="relative bg-gradient-to-br from-[#D4AF37]/20 to-[#B8941F]/20 rounded-3xl h-[500px] flex items-center justify-center">
                    <div className="w-48 h-48 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center">
                      <span className="text-8xl font-black text-white">
                        {writer.name?.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      {writer.achievements && (
        <section className="py-12 bg-white border-b">
          <div className="max-w-7xl mx-auto px-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-[#F5F1E8] to-white">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">الإنجازات والجوائز</h3>
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                      {writer.achievements}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Packages Section */}
      <section id="packages" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#1A1A1A] mb-4">باقات الإرشاد</h2>
            <p className="text-xl text-gray-600">اختر الباقة المناسبة لاحتياجاتك</p>
          </div>

          {loadingPackages ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <Card className="p-12 text-center border-none shadow-lg">
              <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">لا توجد باقات متاحة حالياً</h3>
              <p className="text-gray-600">سيتم إضافة باقات قريباً</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <Card 
                  key={pkg.id} 
                  className={`overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 border-none ${
                    index === 1 ? 'ring-4 ring-[#D4AF37] relative' : ''
                  }`}
                >
                  {index === 1 && (
                    <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white text-center py-2 text-sm font-bold">
                      الأكثر طلباً
                    </div>
                  )}
                  
                  <CardHeader className={index === 1 ? 'pt-14' : ''}>
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-2">
                        {pkg.name || `باقة ${pkg.sessions_count} جلسات`}
                      </CardTitle>
                      {pkg.session_duration && (
                        <p className="text-sm text-gray-600">
                          {pkg.session_duration} لكل جلسة
                        </p>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <div className="text-5xl font-black text-[#D4AF37] mb-2">
                        {pkg.price}
                        <span className="text-2xl mr-1">ر.س</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {(pkg.price / pkg.sessions_count).toFixed(0)} ر.س للجلسة الواحدة
                      </p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {pkg.description && (
                      <p className="text-gray-700 leading-relaxed text-center mb-4">
                        {pkg.description}
                      </p>
                    )}
                    
                    {pkg.benefits && pkg.benefits.length > 0 ? (
                      <div className="space-y-3 mb-6">
                        {pkg.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                          <span className="text-gray-700">{pkg.sessions_count} جلسات فردية</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                          <span className="text-gray-700">متابعة شخصية</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                          <span className="text-gray-700">تقييم وتوجيه مباشر</span>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      className={`w-full text-lg py-6 ${
                        index === 1 
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] shadow-lg' 
                          : 'bg-[#1A1A1A] hover:bg-[#2A2520]'
                      }`}
                      onClick={() => handleBookPackage(pkg)}
                    >
                      <Calendar className="ml-2 w-5 h-5" />
                      احجز الآن
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#1A1A1A] to-[#2A2520] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">ابدأ رحلتك مع {writer.name}</h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            احجز جلستك الأولى الآن واحصل على إرشاد احترافي لتطوير مهاراتك الكتابية
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-lg px-10 py-6"
            onClick={() => {
              document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Calendar className="ml-2 w-5 h-5" />
            اختر باقتك الآن
          </Button>
        </div>
      </section>
    </div>
  );
}