import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, GraduationCap, Calendar, Clock, BookMarked, 
  Play, CheckCircle2, Loader2 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {
        base44.auth.redirectToLogin(window.location.href);
      })
      .finally(() => setLoading(false));
  }, []);

  const { data: subscriptions } = useQuery({
    queryKey: ['my-subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ 
      user_email: user.email,
      payment_status: 'completed'
    }),
    initialData: [],
    enabled: !!user,
  });

  const { data: bookings } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ 
      user_email: user.email 
    }, '-created_date'),
    initialData: [],
    enabled: !!user,
  });

  const { data: allCourses } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list(),
    initialData: [],
    enabled: !!user,
  });

  const subscribedCourses = subscriptions.map(sub => {
    return allCourses.find(c => c.id === sub.course_id);
  }).filter(Boolean);

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'قيد المراجعة',
      confirmed: 'مؤكد',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Profile Header */}
        <Card className="border-none shadow-xl mb-8 bg-gradient-to-br from-[#1A1A1A] to-[#2A2520] text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-2xl flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-black mb-2">{user?.full_name}</h1>
                <p className="text-gray-300 text-lg">{user?.email}</p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">
                    <GraduationCap className="w-4 h-4 ml-1" />
                    {subscriptions.length} دورة
                  </Badge>
                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">
                    <BookMarked className="w-4 h-4 ml-1" />
                    {bookings.length} حجز
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="w-full bg-white shadow-md mb-8">
            <TabsTrigger value="courses" className="flex-1 gap-2">
              <GraduationCap className="w-4 h-4" />
              دوراتي
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 gap-2">
              <Calendar className="w-4 h-4" />
              جلسات الإرشاد
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            {subscribedCourses.length === 0 ? (
              <Card className="border-none shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">لا توجد دورات مسجلة</h3>
                <p className="text-gray-600 mb-6">ابدأ رحلتك التعليمية واشترك في دوراتنا المتميزة</p>
                <Link to={createPageUrl("Courses")}>
                  <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F]">
                    استكشف الدورات
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscribedCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 border-none">
                    <div className="relative h-40 bg-gradient-to-br from-[#D4AF37]/20 to-[#B8941F]/20">
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <GraduationCap className="w-16 h-16 text-[#D4AF37]/40" />
                        </div>
                      )}
                      <Badge className="absolute top-3 right-3 bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3 ml-1" />
                        مسجل
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Link to={createPageUrl("CourseDetails") + "?id=" + course.id}>
                        <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F]">
                          <Play className="ml-2 w-4 h-4" />
                          متابعة التعلم
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            {bookings.length === 0 ? (
              <Card className="border-none shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookMarked className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">لا توجد جلسات محجوزة</h3>
                <p className="text-gray-600 mb-6">احجز جلسة إرشاد مع أحد كتّابنا المتميزين</p>
                <Link to={createPageUrl("Mentorship")}>
                  <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F]">
                    استكشف الكتّاب
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-[#1A1A1A]">
                              {booking.writer_name}
                            </h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusLabel(booking.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#D4AF37]" />
                              <span>
                                {booking.session_date 
                                  ? format(new Date(booking.session_date), 'd MMMM yyyy', { locale: ar })
                                  : 'لم يحدد بعد'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#D4AF37]" />
                              <span>
                                {booking.session_date 
                                  ? format(new Date(booking.session_date), 'HH:mm', { locale: ar })
                                  : 'لم يحدد بعد'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookMarked className="w-4 h-4 text-[#D4AF37]" />
                              <span>{booking.sessions_count} جلسات متبقية</span>
                            </div>
                          </div>

                          {booking.notes && (
                            <div className="mt-4 p-3 bg-[#F5F1E8] rounded-lg">
                              <p className="text-sm text-gray-700">{booking.notes}</p>
                            </div>
                          )}
                        </div>

                        <Link to={createPageUrl("WriterProfile") + "?id=" + booking.writer_id}>
                          <Button variant="outline" size="sm">
                            عرض الكاتب
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}