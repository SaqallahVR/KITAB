import React, { useState, useEffect } from "react";
import { kitabApi } from "@/api/kitabApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/ui/stat-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap, FileText, Plus, Edit, Trash2, Save, Loader2
} from "lucide-react";
import useAuthGuard from "@/hooks/useAuthGuard";

export default function InstructorDashboard() {
  const { user, loading } = useAuthGuard({ roles: ["instructor"] });
  const [courseDialog, setCourseDialog] = useState({ open: false, data: null });
  const [lessonDialog, setLessonDialog] = useState({ open: false, data: null });

  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ["instructor-courses", user?.full_name],
    queryFn: () => kitabApi.entities.Course.filter({ instructor: user.full_name }),
    initialData: [],
    enabled: !!user,
  });

  const { data: allLessons } = useQuery({
    queryKey: ["instructor-lessons"],
    queryFn: () => kitabApi.entities.Lesson.list("order"),
    initialData: [],
    enabled: !!user && courses.length > 0,
  });

  const myLessons = allLessons.filter((lesson) =>
    courses.some((course) => course.id === lesson.course_id)
  );

  // Course Mutations
  const createCourseMutation = useMutation({
    mutationFn: (data) => kitabApi.entities.Course.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      setCourseDialog({ open: false, data: null });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }) => kitabApi.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      setCourseDialog({ open: false, data: null });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id) => kitabApi.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
    },
  });

  // Lesson Mutations
  const createLessonMutation = useMutation({
    mutationFn: (data) => kitabApi.entities.Lesson.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-lessons"] });
      setLessonDialog({ open: false, data: null });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }) => kitabApi.entities.Lesson.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-lessons"] });
      setLessonDialog({ open: false, data: null });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id) => kitabApi.entities.Lesson.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-lessons"] });
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!user || user.role !== "instructor") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#1A1A1A] mb-2">
            لوحة المدرب
          </h1>
          <p className="text-xl text-gray-600">إدارة الدورات والدروس</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard label="دوراتي" value={courses.length} Icon={GraduationCap} />
          <StatCard label="الدروس" value={myLessons.length} Icon={FileText} />
        </div>

        <Tabs defaultValue="courses">
          <TabsList className="w-full bg-white shadow-md mb-8">
            <TabsTrigger value="courses" className="flex-1">الدورات</TabsTrigger>
            <TabsTrigger value="lessons" className="flex-1">الدروس</TabsTrigger>
          </TabsList>

          {/* Courses */}
          <TabsContent value="courses">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>دوراتي ({courses.length})</CardTitle>
                  <Button
                    onClick={() => setCourseDialog({ open: true, data: null })}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F]"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة دورة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="p-4 bg-[#F5F1E8] rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[#1A1A1A]">{course.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={course.type === "free" ? "bg-green-100 text-green-800" : "bg-[#D4AF37]/20 text-[#D4AF37]"}>
                              {course.type === "free" ? "مجاني" : course.type === "paid" ? "مدفوع" : "مختلط"}
                            </Badge>
                            {course.price > 0 && (
                              <Badge variant="outline">{course.price} ر.س</Badge>
                            )}
                            <Badge className={course.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {course.published ? "منشور" : "مخفي"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCourseDialog({ open: true, data: course })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => {
                              if (confirm(`هل تريد حذف ${course.title}؟`)) {
                                deleteCourseMutation.mutate(course.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lessons */}
          <TabsContent value="lessons">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>الدروس ({myLessons.length})</CardTitle>
                  <Button
                    onClick={() => setLessonDialog({ open: true, data: null })}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F]"
                    disabled={courses.length === 0}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة درس
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    أضف دورة أولاً لتتمكن من إضافة الدروس
                  </p>
                ) : (
                  <div className="space-y-4">
                    {myLessons.map((lesson) => {
                      const course = courses.find((c) => c.id === lesson.course_id);
                      return (
                        <div key={lesson.id} className="p-4 bg-[#F5F1E8] rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {course?.title}
                                </Badge>
                                <Badge className="text-xs bg-[#D4AF37]/20 text-[#D4AF37]">
                                  الترتيب: {lesson.order}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-bold text-[#1A1A1A]">{lesson.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge>
                                  {lesson.type === "video" ? "فيديو" : lesson.type === "exercise" ? "تمرين" : "مباشر"}
                                </Badge>
                                {lesson.is_free && (
                                  <Badge className="bg-green-100 text-green-800">مجاني</Badge>
                                )}
                                {lesson.duration && (
                                  <Badge variant="outline">{lesson.duration}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLessonDialog({ open: true, data: lesson })}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm(`هل تريد حذف ${lesson.title}؟`)) {
                                    deleteLessonMutation.mutate(lesson.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Course Dialog */}
        <CourseDialog
          dialog={courseDialog}
          setDialog={setCourseDialog}
          user={user}
          onCreate={(data) => createCourseMutation.mutate(data)}
          onUpdate={(id, data) => updateCourseMutation.mutate({ id, data })}
        />

        {/* Lesson Dialog */}
        <LessonDialog
          dialog={lessonDialog}
          setDialog={setLessonDialog}
          courses={courses}
          onCreate={(data) => createLessonMutation.mutate(data)}
          onUpdate={(id, data) => updateLessonMutation.mutate({ id, data })}
        />
      </div>
    </div>
  );
}


function CourseDialog({ dialog, setDialog, user, onCreate, onUpdate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "free",
    price: 0,
    level: "beginner",
    duration: "",
    requirements: "",
    category: "",
    published: true,
  });

  useEffect(() => {
    if (dialog.data) {
      setFormData({ ...dialog.data });
    } else {
      setFormData({
        title: "",
        description: "",
        type: "free",
        price: 0,
        level: "beginner",
        duration: "",
        requirements: "",
        category: "",
        published: true,
      });
    }
  }, [dialog.data, dialog.open]);

  const handleSave = () => {
    const data = { ...formData, instructor: user.full_name };
    if (dialog.data) {
      onUpdate(formData.id, data);
    } else {
      onCreate(data);
    }
  };

  return (
    <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialog.data ? "تعديل الدورة" : "إضافة دورة جديدة"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">عنوان الدورة *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">الوصف</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">النوع</label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">مجاني</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="mixed">مختلط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">السعر (ر.س)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">المستوى</label>
              <Select
                value={formData.level}
                onValueChange={(val) => setFormData({ ...formData, level: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">مبتدئ</SelectItem>
                  <SelectItem value="intermediate">متوسط</SelectItem>
                  <SelectItem value="advanced">متقدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">المدة</label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="مثال: 4 أسابيع"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">التصنيف</label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">المتطلبات</label>
            <Textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">الحالة</label>
            <Select
              value={formData.published ? "true" : "false"}
              onValueChange={(val) => setFormData({ ...formData, published: val === "true" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">منشور</SelectItem>
                <SelectItem value="false">مخفي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B8941F]"
            >
              <Save className="ml-2 w-4 h-4" />
              حفظ
            </Button>
            <Button
              variant="outline"
              onClick={() => setDialog({ open: false, data: null })}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LessonDialog({ dialog, setDialog, courses, onCreate, onUpdate }) {
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    type: "video",
    video_url: "",
    content: "",
    is_free: false,
    order: 1,
    duration: "",
  });

  useEffect(() => {
    if (dialog.data) {
      setFormData({ ...dialog.data });
    } else {
      setFormData({
        course_id: courses[0]?.id || "",
        title: "",
        description: "",
        type: "video",
        video_url: "",
        content: "",
        is_free: false,
        order: 1,
        duration: "",
      });
    }
  }, [dialog.data, dialog.open, courses]);

  const handleSave = () => {
    if (dialog.data) {
      onUpdate(formData.id, formData);
    } else {
      onCreate(formData);
    }
  };

  return (
    <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialog.data ? "تعديل الدرس" : "إضافة درس جديد"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">الدورة *</label>
            <Select
              value={formData.course_id}
              onValueChange={(val) => setFormData({ ...formData, course_id: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">عنوان الدرس *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">الوصف</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">النوع</label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">فيديو</SelectItem>
                  <SelectItem value="exercise">تمرين</SelectItem>
                  <SelectItem value="live">مباشر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">الترتيب *</label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">رابط الفيديو</label>
            <Input
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">المحتوى</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">المدة</label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="مثال: 30 دقيقة"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">مجاني</label>
              <Select
                value={formData.is_free ? "true" : "false"}
                onValueChange={(val) => setFormData({ ...formData, is_free: val === "true" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">نعم</SelectItem>
                  <SelectItem value="false">لا</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B8941F]"
            >
              <Save className="ml-2 w-4 h-4" />
              حفظ
            </Button>
            <Button
              variant="outline"
              onClick={() => setDialog({ open: false, data: null })}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
