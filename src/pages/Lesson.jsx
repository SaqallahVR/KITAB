import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, CheckCircle2, Play, FileText, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function Lesson() {
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: lesson, isLoading: loadingLesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId,
  });

  const { data: course } = useQuery({
    queryKey: ['course', lesson?.course_id],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: lesson.course_id });
      return courses[0];
    },
    enabled: !!lesson?.course_id,
  });

  const { data: allLessons } = useQuery({
    queryKey: ['lessons', lesson?.course_id],
    queryFn: () => base44.entities.Lesson.filter({ course_id: lesson.course_id }, 'order'),
    initialData: [],
    enabled: !!lesson?.course_id,
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', lesson?.course_id, user?.email],
    queryFn: async () => {
      if (!user) return null;
      const subs = await base44.entities.Subscription.filter({
        course_id: lesson.course_id,
        user_email: user.email,
        payment_status: 'completed'
      });
      return subs[0];
    },
    enabled: !!lesson?.course_id && !!user,
  });

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  
  const isEnrolled = !!subscription;
  const canAccess = lesson?.is_free || course?.type === 'free' || isEnrolled;

  const getVideoEmbed = (url) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.includes("youtube.com/watch")) {
      const id = new URL(trimmed).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : trimmed;
    }
    if (trimmed.includes("youtu.be/")) {
      const id = trimmed.split("youtu.be/")[1]?.split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}` : trimmed;
    }
    if (trimmed.includes("vimeo.com/")) {
      const id = trimmed.split("vimeo.com/")[1]?.split("?")[0];
      return id ? `https://player.vimeo.com/video/${id}` : trimmed;
    }
    return trimmed;
  };

  const isDirectVideo = (url) => {
    return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);
  };

  const videoUrl = getVideoEmbed(lesson?.video_url);

  if (loadingLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>الدرس غير موجود</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] flex items-center justify-center">
        <Card className="max-w-md border-none shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-black text-[#1A1A1A] mb-4">محتوى مقفل</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              هذا الدرس متاح فقط للمشتركين في الدورة
            </p>
            <Link to={createPageUrl("CourseDetails") + "?id=" + lesson.course_id}>
              <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37]">
                العودة للدورة
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to={createPageUrl("Courses")} className="hover:text-[#D4AF37]">
            الدورات
          </Link>
          <span>/</span>
          <Link 
            to={createPageUrl("CourseDetails") + "?id=" + lesson.course_id}
            className="hover:text-[#D4AF37]"
          >
            {course?.title}
          </Link>
          <span>/</span>
          <span className="text-[#1A1A1A] font-medium">{lesson.title}</span>
        </div>

        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">
              {lesson.type === 'video' ? 'فيديو' : 'تمرين'}
            </Badge>
            {lesson.is_free && (
              <Badge className="bg-green-100 text-green-800">مجاني</Badge>
            )}
          </div>
          <h1 className="text-4xl font-black text-[#1A1A1A] mb-2">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-lg text-gray-600">{lesson.description}</p>
          )}
        </div>

        {/* Video Player or Content */}
        <Card className="border-none shadow-xl mb-8">
          <CardContent className="p-0">
            {lesson.type === 'video' && videoUrl ? (
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                {isDirectVideo(videoUrl) ? (
                  <video
                    className="absolute inset-0 w-full h-full"
                    controls
                    src={videoUrl}
                  />
                ) : (
                  <iframe
                    src={videoUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={lesson.title}
                  />
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-gradient-to-br from-[#F5F1E8] to-white">
                <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">محتوى الدرس</h3>
                <p className="text-gray-600">سيتم إضافة محتوى الفيديو قريباً</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lesson Content */}
        {lesson.content && (
          <Card className="border-none shadow-lg mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#D4AF37]" />
                محتوى الدرس
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {lesson.content}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          {previousLesson ? (
            <Link to={createPageUrl("Lesson") + "?id=" + previousLesson.id} className="flex-1">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
                <ArrowRight className="w-5 h-5" />
                <div className="text-right">
                  <div className="text-xs text-gray-500">السابق</div>
                  <div className="font-bold">{previousLesson.title}</div>
                </div>
              </Button>
            </Link>
          ) : (
            <div className="flex-1"></div>
          )}

          <Link to={createPageUrl("CourseDetails") + "?id=" + lesson.course_id}>
            <Button variant="outline" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              محتوى الدورة
            </Button>
          </Link>

          {nextLesson ? (
            <Link to={createPageUrl("Lesson") + "?id=" + nextLesson.id} className="flex-1">
              <Button className="w-full justify-end gap-2 h-auto py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8941F]">
                <div className="text-left">
                  <div className="text-xs">التالي</div>
                  <div className="font-bold">{nextLesson.title}</div>
                </div>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <div className="flex-1"></div>
          )}
        </div>
      </div>
    </div>
  );
}
