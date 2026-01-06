import React, { useState } from "react";
import { kitabApi } from "@/api/kitabApiClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, Star, Play, Lock, CheckCircle2, GraduationCap, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => kitabApi.entities.Course.filter({ published: true }, '-created_date'),
    initialData: [],
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || course.type === typeFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesType && matchesLevel;
  });

  const getTypeLabel = (type) => {
    const labels = {
      free: "مجاني",
      paid: "مدفوع",
      mixed: "مختلط"
    };
    return labels[type] || type;
  };

  const getLevelLabel = (level) => {
    const labels = {
      beginner: "مبتدئ",
      intermediate: "متوسط",
      advanced: "متقدم"
    };
    return labels[level] || level;
  };

  const getTypeColor = (type) => {
    const colors = {
      free: "bg-green-100 text-green-800 border-green-200",
      paid: "bg-[#D4AF37]/20 text-[#B8941F] border-[#D4AF37]/30",
      mixed: "bg-orange-100 text-orange-800 border-orange-200"
    };
    return colors[type] || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 px-4 py-2 rounded-full mb-4">
            <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm text-[#B8941F] font-medium">مكتبة الدورات</span>
          </div>
          <h1 className="text-5xl font-black text-[#1A1A1A] mb-4">الدورات التعليمية</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اختر من بين مجموعة متنوعة من الدورات المتخصصة في الكتابة والأدب
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-none shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="ابحث عن دورة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">الكل</TabsTrigger>
                  <TabsTrigger value="free" className="flex-1">مجاني</TabsTrigger>
                  <TabsTrigger value="paid" className="flex-1">مدفوع</TabsTrigger>
                  <TabsTrigger value="mixed" className="flex-1">مختلط</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs value={levelFilter} onValueChange={setLevelFilter}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">كل المستويات</TabsTrigger>
                  <TabsTrigger value="beginner" className="flex-1">مبتدئ</TabsTrigger>
                  <TabsTrigger value="intermediate" className="flex-1">متوسط</TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">متقدم</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="p-12 text-center border-none shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">لم يتم العثور على دورات</h3>
            <p className="text-gray-600">جرّب البحث بكلمات مختلفة أو غيّر الفلاتر</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
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
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className={`${getTypeColor(course.type)} border`}>
                      {course.type === 'free' && <CheckCircle2 className="w-3 h-3 ml-1" />}
                      {course.type === 'paid' && <Lock className="w-3 h-3 ml-1" />}
                      {getTypeLabel(course.type)}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-xl text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration || 'غير محدد'}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getLevelLabel(course.level)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{course.instructor?.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{course.instructor}</span>
                  </div>
                  
                  <div className="text-2xl font-black text-[#D4AF37]">
                    {course.type === "free" ? "0 ر.س" : `${course.price} ر.س`}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Link to={createPageUrl("CourseDetails") + "?id=" + course.id} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] group-hover:shadow-lg">
                      <Play className="ml-2 w-4 h-4" />
                      عرض التفاصيل
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}