import React, { useState, useEffect } from "react";
import { kitabApi } from "@/api/kitabApiClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, CheckCircle2, GraduationCap, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MySubscriptions() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kitabApi.auth.me()
      .then(setUser)
      .catch(() => {
        kitabApi.auth.redirectToLogin(window.location.href);
      })
      .finally(() => setLoading(false));
  }, []);

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['my-subscriptions', user?.email],
    queryFn: () => kitabApi.entities.Subscription.filter({ 
      user_email: user.email,
      payment_status: 'completed'
    }, '-created_date'),
    initialData: [],
    enabled: !!user,
  });

  const { data: allCourses } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => kitabApi.entities.Course.list(),
    initialData: [],
    enabled: !!user,
  });

  const subscribedCourses = subscriptions.map(sub => {
    return allCourses.find(c => c.id === sub.course_id);
  }).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 px-4 py-2 rounded-full mb-4">
            <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm text-[#B8941F] font-medium">دوراتي</span>
          </div>
          <h1 className="text-5xl font-black text-[#1A1A1A] mb-4">الدورات المسجلة</h1>
          <p className="text-xl text-gray-600">
            تابع تقدمك في الدورات التي اشتركت بها
          </p>
        </div>

        {/* Subscriptions */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : subscribedCourses.length === 0 ? (
          <Card className="border-none shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-[#D4AF37]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">لا توجد دورات مسجلة</h3>
            <p className="text-gray-600 mb-6">ابدأ رحلتك التعليمية واشترك في دوراتنا المتميزة</p>
            <Link to={createPageUrl("Courses")}>
              <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37]">
                <GraduationCap className="ml-2 w-5 h-5" />
                استكشف الدورات
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscribedCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 border-none bg-white group">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#D4AF37]/20 to-[#B8941F]/20">
                  {course.image_url ? (
                    <img 
                      src={course.image_url} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap className="w-20 h-20 text-[#D4AF37]/40" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      مسجل
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.instructor}</span>
                    </div>
                  </div>
                  
                  <Link to={createPageUrl("CourseDetails") + "?id=" + course.id}>
                    <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] group-hover:shadow-lg">
                      <Play className="ml-2 w-4 h-4" />
                      متابعة التعلم
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}