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
  Play, Lock, CheckCircle2, Clock, Star, BookOpen, 
  User, Video, FileText, Calendar, ArrowRight, Loader2 
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: lessons, isLoading: loadingLessons } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order'),
    initialData: [],
    enabled: !!courseId,
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', courseId, user?.email],
    queryFn: async () => {
      if (!user) return null;
      const subs = await base44.entities.Subscription.filter({
        course_id: courseId,
        user_email: user.email,
        payment_status: 'completed'
      });
      return subs[0];
    },
    enabled: !!courseId && !!user,
  });

  const isEnrolled = !!subscription;
  const canAccess = course?.type === 'free' || isEnrolled;

  const handleEnroll = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setIsEnrolling(true);
    try {
      await base44.entities.Subscription.create({
        user_email: user.email,
        course_id: course.id,
        course_title: course.title,
        payment_status: course.type === 'free' ? 'completed' : 'pending',
        payment_amount: course.price || 0,
        payment_date: new Date().toISOString().split('T')[0]
      });
      window.location.reload();
    } catch (error) {
      console.error('Error enrolling:', error);
    }
    setIsEnrolling(false);
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>الدورة غير موجودة</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getTypeLabel = (type) => {
    const labels = { free: "مجاني", paid: "مدفوع", mixed: "مختلط" };
    return labels[type] || type;
  };

  const getLevelLabel = (level) => {
    const labels = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" };
    return labels[level] || level;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2520] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">
                  {getTypeLabel(course.type)}
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white">
                  {getLevelLabel(course.level)}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#D4AF37]" />
                  <span className="font-medium">{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  <span>{course.duration || 'غير محدد'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                  <span>{lessons.length} درس</span>
                </div>
              </div>

              {isEnrolled && (
                <Alert className="bg-green-500/20 border-green-500/30 text-white">
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                  <AlertDescription>أنت مسجل في هذه الدورة</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-2xl blur-2xl"></div>
              {course.image_url ? (
                <img 
                  src={course.image_url} 
                  alt={course.title}
                  className="relative rounded-2xl shadow-2xl w-full h-80 object-cover"
                />
              ) : (
                <div className="relative bg-gradient-to-br from-[#D4AF37]/20 to-[#B8941F]/20 rounded-2xl h-80 flex items-center justify-center">
                  <BookOpen className="w-32 h-32 text-[#D4AF37]/40" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full bg-white shadow-sm">
                <TabsTrigger value="content" className="flex-1">المحتوى</TabsTrigger>
                <TabsTrigger value="description" className="flex-1">الوصف</TabsTrigger>
                <TabsTrigger value="requirements" className="flex-1">المتطلبات</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-[#D4AF37]" />
                      محتوى الدورة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loadingLessons ? (
                        Array(5).fill(0).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))
                      ) : lessons.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">لا توجد دروس متاحة حالياً</p>
                      ) : (
                        lessons.map((lesson, index) => {
                          const isLocked = !lesson.is_free && !canAccess;
                          return (
                            <Link
                              key={lesson.id}
                              to={isLocked ? '#' : createPageUrl("Lesson") + "?id=" + lesson.id}
                              className={`block ${isLocked ? 'cursor-not-allowed' : ''}`}
                            >
                              <div className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                                isLocked 
                                  ? 'bg-gray-50 border-gray-200' 
                                  : 'bg-white hover:bg-[#F5F1E8] hover:border-[#D4AF37] hover:shadow-md'
                              }`}>
                                <div className="flex items-center gap-4 flex-1">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    isLocked 
                                      ? 'bg-gray-200' 
                                      : 'bg-gradient-to-br from-[#D4AF37] to-[#B8941F]'
                                  }`}>
                                    {isLocked ? (
                                      <Lock className="w-5 h-5 text-gray-500" />
                                    ) : lesson.type === 'video' ? (
                                      <Play className="w-5 h-5 text-white" />
                                    ) : (
                                      <FileText className="w-5 h-5 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-500">
                                        الدرس {index + 1}
                                      </span>
                                      {lesson.is_free && (
                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                          مجاني
                                        </Badge>
                                      )}
                                    </div>
                                    <h4 className="font-bold text-[#1A1A1A] mt-1">
                                      {lesson.title}
                                    </h4>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {lesson.duration && (
                                    <span className="text-sm text-gray-600">{lesson.duration}</span>
                                  )}
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="description" className="mt-6">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {course.description || 'لا يوجد وصف متاح'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="mt-6">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {course.requirements || 'لا توجد متطلبات خاصة'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="border-none shadow-xl sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-black text-[#D4AF37] mb-2">
                    {course.type === "free" ? "0 ر.س" : `${course.price} ر.س`}
                  </div>
                  <p className="text-sm text-gray-600">سعر الدورة</p>
                </div>

                {!isEnrolled ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-lg py-6 shadow-lg"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? (
                      <>
                        <Loader2 className="ml-2 w-5 h-5 animate-spin" />
                        جاري التسجيل...
                      </>
                    ) : (
                      <>
                        {course.type === 'free' ? 'التسجيل المجاني' : 'شراء الدورة'}
                      </>
                    )}
                  </Button>
                ) : (
                  <Link to={createPageUrl("Lesson") + "?id=" + lessons[0]?.id}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                      <Play className="ml-2 w-5 h-5" />
                      متابعة التعلم
                    </Button>
                  </Link>
                )}

                <div className="mt-6 pt-6 border-t space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F5F1E8] rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">عدد الدروس</p>
                      <p className="font-bold text-[#1A1A1A]">{lessons.length} درس</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F5F1E8] rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المدة</p>
                      <p className="font-bold text-[#1A1A1A]">{course.duration || 'غير محدد'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F5F1E8] rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المدرب</p>
                      <p className="font-bold text-[#1A1A1A]">{course.instructor}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
