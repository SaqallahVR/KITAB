import React, { useState, useEffect } from "react";
import { kitabApi } from "@/api/kitabApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, BookOpen, Calendar, Edit, Trash2, Plus, Save, X, Loader2,
  GraduationCap, PackagePlus, FileText
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("writers");
  const [editDialog, setEditDialog] = useState({ open: false, type: null, data: null });

  const queryClient = useQueryClient();

  useEffect(() => {
    kitabApi.auth.me()
      .then((userData) => {
        if (userData.role !== 'manager') {
          window.location.href = '/';
          return;
        }
        setUser(userData);
      })
      .catch(() => {
        kitabApi.auth.redirectToLogin(window.location.href);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch all data
  const { data: writers } = useQuery({
    queryKey: ['admin-writers'],
    queryFn: () => kitabApi.entities.Writer.list(),
    initialData: [],
    enabled: !!user,
  });

  const { data: courses } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => kitabApi.entities.Course.list(),
    initialData: [],
    enabled: !!user,
  });

  const { data: lessons } = useQuery({
    queryKey: ['admin-lessons'],
    queryFn: () => kitabApi.entities.Lesson.list(),
    initialData: [],
    enabled: !!user,
  });

  const { data: packages } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => kitabApi.entities.MentorshipPackage.list(),
    initialData: [],
    enabled: !!user,
  });

  const { data: bookings } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => kitabApi.entities.Booking.list('-created_date'),
    initialData: [],
    enabled: !!user,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => kitabApi.entities.Subscription.list('-created_date'),
    initialData: [],
    enabled: !!user,
  });

  // Generic mutations
  const updateMutation = useMutation({
    mutationFn: ({ entity, id, data }) => {
      switch(entity) {
        case 'Writer': return kitabApi.entities.Writer.update(id, data);
        case 'Course': return kitabApi.entities.Course.update(id, data);
        case 'Lesson': return kitabApi.entities.Lesson.update(id, data);
        case 'MentorshipPackage': return kitabApi.entities.MentorshipPackage.update(id, data);
        case 'Booking': return kitabApi.entities.Booking.update(id, data);
        case 'Subscription': return kitabApi.entities.Subscription.update(id, data);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`admin-${variables.entity.toLowerCase()}s`] });
      setEditDialog({ open: false, type: null, data: null });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ entity, id }) => {
      switch(entity) {
        case 'Writer': return kitabApi.entities.Writer.delete(id);
        case 'Course': return kitabApi.entities.Course.delete(id);
        case 'Lesson': return kitabApi.entities.Lesson.delete(id);
        case 'MentorshipPackage': return kitabApi.entities.MentorshipPackage.delete(id);
        case 'Booking': return kitabApi.entities.Booking.delete(id);
        case 'Subscription': return kitabApi.entities.Subscription.delete(id);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`admin-${variables.entity.toLowerCase()}s`] });
    },
  });

  const handleEdit = (type, data) => {
    setEditDialog({ open: true, type, data: { ...data } });
  };

  const handleDelete = (entity, id, name) => {
    if (confirm(`هل أنت متأكد من حذف ${name}؟`)) {
      deleteMutation.mutate({ entity, id });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!user || user.role !== 'manager') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#1A1A1A] mb-2">
            لوحة التحكم - الإدارة
          </h1>
          <p className="text-xl text-gray-600">إدارة جميع بيانات المنصة</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="border-none shadow-md bg-gradient-to-b from-white to-[#FFFBF2]">
            <CardContent className="p-6 pt-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#B8941F]" />
              </div>
              <p className="text-2xl font-black">{writers.length}</p>
              <p className="text-xs text-gray-600 mt-2">كتّاب</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-b from-white to-[#F5F1FF]">
            <CardContent className="p-6 pt-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#5B6EE1]/15 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-[#5B6EE1]" />
              </div>
              <p className="text-2xl font-black">{courses.length}</p>
              <p className="text-xs text-gray-600 mt-2">دورات</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-b from-white to-[#F2FBF6]">
            <CardContent className="p-6 pt-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#2BAF6A]/15 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#2BAF6A]" />
              </div>
              <p className="text-2xl font-black">{lessons.length}</p>
              <p className="text-xs text-gray-600 mt-2">دروس</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-b from-white to-[#FFF6F0]">
            <CardContent className="p-6 pt-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#E78B3A]/15 flex items-center justify-center">
                <PackagePlus className="w-6 h-6 text-[#E78B3A]" />
              </div>
              <p className="text-2xl font-black">{packages.length}</p>
              <p className="text-xs text-gray-600 mt-2">باقات</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-b from-white to-[#F2F7FF]">
            <CardContent className="p-6 pt-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#3A7BD5]/15 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#3A7BD5]" />
              </div>
              <p className="text-2xl font-black">{bookings.length}</p>
              <p className="text-xs text-gray-600 mt-2">حجوزات</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-b from-white to-[#F7F2FF]">
            <CardContent className="p-6 pt-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#8E5AD7]/15 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#8E5AD7]" />
              </div>
              <p className="text-2xl font-black">{subscriptions.length}</p>
              <p className="text-xs text-gray-600 mt-2">اشتراكات</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-white shadow-md mb-8 grid grid-cols-7">
            <TabsTrigger value="writers-management">إدارة الكتّاب</TabsTrigger>
            <TabsTrigger value="writers">الكتّاب</TabsTrigger>
            <TabsTrigger value="courses">الدورات</TabsTrigger>
            <TabsTrigger value="lessons">الدروس</TabsTrigger>
            <TabsTrigger value="packages">الباقات</TabsTrigger>
            <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
            <TabsTrigger value="subscriptions">الاشتراكات</TabsTrigger>
          </TabsList>

          {/* Writers Management */}
          <TabsContent value="writers-management">
            <div className="space-y-6">
              {writers.map((writer) => {
                const writerPackages = packages.filter(p => p.writer_id === writer.id);
                const writerBookings = bookings.filter(b => b.writer_id === writer.id);

                return (
                  <Card key={writer.id} className="border-none shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {writer.image_url ? (
                            <img
                              src={writer.image_url}
                              alt={writer.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center">
                              <span className="text-2xl font-black text-white">
                                {writer.name?.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-2xl">{writer.name}</CardTitle>
                            <p className="text-gray-600">{writer.specialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={writer.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {writer.active ? 'نشط' : 'متوقف'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit('Writer', writer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Packages */}
                        <div>
                          <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <PackagePlus className="w-5 h-5 text-[#D4AF37]" />
                            الباقات ({writerPackages.length})
                          </h4>
                          {writerPackages.length === 0 ? (
                            <p className="text-sm text-gray-500">لا توجد باقات</p>
                          ) : (
                            <div className="space-y-2">
                              {writerPackages.map(pkg => (
                                <div key={pkg.id} className="p-3 bg-[#F5F1E8] rounded-lg">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{pkg.name || `${pkg.sessions_count} جلسات`}</p>
                                      <p className="text-xs text-gray-600">{pkg.price} ر.س</p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEdit('MentorshipPackage', pkg)}
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-600"
                                        onClick={() => handleDelete('MentorshipPackage', pkg.id, pkg.name)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bookings */}
                        <div>
                          <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#D4AF37]" />
                            الحجوزات ({writerBookings.length})
                          </h4>
                          {writerBookings.length === 0 ? (
                            <p className="text-sm text-gray-500">لا توجد حجوزات</p>
                          ) : (
                            <div className="space-y-2">
                              {writerBookings.slice(0, 3).map(booking => (
                                <div key={booking.id} className="p-3 bg-[#F5F1E8] rounded-lg">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{booking.user_name}</p>
                                      <p className="text-xs text-gray-600">{booking.sessions_count} جلسات</p>
                                      <Badge className={
                                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800 text-xs mt-1' :
                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 text-xs mt-1' :
                                        'bg-gray-100 text-gray-800 text-xs mt-1'
                                      }>
                                        {booking.status === 'confirmed' ? 'مؤكد' :
                                         booking.status === 'pending' ? 'قيد المراجعة' : booking.status}
                                      </Badge>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEdit('Booking', booking)}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {writerBookings.length > 3 && (
                                <p className="text-xs text-gray-500 text-center">
                                  و {writerBookings.length - 3} حجوزات أخرى
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Writers */}
          <TabsContent value="writers">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>الكتّاب ({writers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>التخصص</TableHead>
                        <TableHead>البريد</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {writers.map((writer) => (
                        <TableRow key={writer.id}>
                          <TableCell className="font-medium">{writer.name}</TableCell>
                          <TableCell>{writer.specialty}</TableCell>
                          <TableCell>{writer.email}</TableCell>
                          <TableCell>
                            <Badge className={writer.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {writer.active ? 'نشط' : 'متوقف'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit('Writer', writer)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleDelete('Writer', writer.id, writer.name)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses */}
          <TabsContent value="courses">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>الدورات ({courses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العنوان</TableHead>
                        <TableHead>المدرب</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>{course.instructor}</TableCell>
                          <TableCell>
                            <Badge>
                              {course.type === 'free' ? 'مجاني' : course.type === 'paid' ? 'مدفوع' : 'مختلط'}
                            </Badge>
                          </TableCell>
                          <TableCell>{course.price || 0} ر.س</TableCell>
                          <TableCell>
                            <Badge className={course.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {course.published ? 'منشور' : 'مخفي'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit('Course', course)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleDelete('Course', course.id, course.title)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lessons */}
          <TabsContent value="lessons">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>الدروس ({lessons.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العنوان</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>الترتيب</TableHead>
                        <TableHead>مجاني</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessons.map((lesson) => (
                        <TableRow key={lesson.id}>
                          <TableCell className="font-medium">{lesson.title}</TableCell>
                          <TableCell>
                            <Badge>
                              {lesson.type === 'video' ? 'فيديو' : lesson.type === 'exercise' ? 'تمرين' : 'مباشر'}
                            </Badge>
                          </TableCell>
                          <TableCell>{lesson.order}</TableCell>
                          <TableCell>
                            <Badge className={lesson.is_free ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {lesson.is_free ? 'نعم' : 'لا'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit('Lesson', lesson)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleDelete('Lesson', lesson.id, lesson.title)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages */}
          <TabsContent value="packages">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>باقات الإرشاد ({packages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم الباقة</TableHead>
                        <TableHead>الكاتب</TableHead>
                        <TableHead>عدد الجلسات</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.map((pkg) => (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">{pkg.name || '-'}</TableCell>
                          <TableCell>{pkg.writer_name}</TableCell>
                          <TableCell>{pkg.sessions_count}</TableCell>
                          <TableCell>{pkg.price} ر.س</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit('MentorshipPackage', pkg)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleDelete('MentorshipPackage', pkg.id, pkg.name || 'الباقة')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>الحجوزات ({bookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الطالب</TableHead>
                        <TableHead>الكاتب</TableHead>
                        <TableHead>عدد الجلسات</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.user_name}</TableCell>
                          <TableCell>{booking.writer_name}</TableCell>
                          <TableCell>{booking.sessions_count}</TableCell>
                          <TableCell>
                            <Badge className={
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {booking.status === 'pending' ? 'قيد المراجعة' :
                               booking.status === 'confirmed' ? 'مؤكد' :
                               booking.status === 'completed' ? 'مكتمل' : 'ملغي'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit('Booking', booking)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleDelete('Booking', booking.id, booking.user_name)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions */}
          <TabsContent value="subscriptions">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>الاشتراكات ({subscriptions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المستخدم</TableHead>
                        <TableHead>الدورة</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>حالة الدفع</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.user_email}</TableCell>
                          <TableCell>{sub.course_title}</TableCell>
                          <TableCell>{sub.payment_amount || 0} ر.س</TableCell>
                          <TableCell>
                            <Badge className={
                              sub.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                              sub.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {sub.payment_status === 'completed' ? 'مكتمل' :
                               sub.payment_status === 'pending' ? 'قيد الانتظار' : 'فشل'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit('Subscription', sub)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleDelete('Subscription', sub.id, sub.user_email)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <EditDialog
          dialog={editDialog}
          setDialog={setEditDialog}
          onSave={(entity, id, data) => updateMutation.mutate({ entity, id, data })}
        />
      </div>
    </div>
  );
}

function EditDialog({ dialog, setDialog, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (dialog.data) {
      setFormData({ ...dialog.data });
    }
  }, [dialog.data]);

  if (!dialog.open || !dialog.type) return null;

  const handleSave = () => {
    onSave(dialog.type, formData.id, formData);
  };

  const renderFields = () => {
    switch (dialog.type) {
      case 'Writer':
        return (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">الاسم</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">التخصص</label>
              <Input
                value={formData.specialty || ''}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">البريد</label>
              <Input
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">النبذة</label>
              <Textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">الحالة</label>
              <Select
                value={formData.active ? 'true' : 'false'}
                onValueChange={(val) => setFormData({ ...formData, active: val === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">نشط</SelectItem>
                  <SelectItem value="false">متوقف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'Course':
        return (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">العنوان</label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">المدرب</label>
              <Input
                value={formData.instructor || ''}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">النوع</label>
              <Select
                value={formData.type || 'free'}
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
              <label className="text-sm font-medium mb-2 block">السعر</label>
              <Input
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">منشور</label>
              <Select
                value={formData.published ? 'true' : 'false'}
                onValueChange={(val) => setFormData({ ...formData, published: val === 'true' })}
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
          </>
        );

      case 'Booking':
        return (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">الحالة</label>
              <Select
                value={formData.status || 'pending'}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">عدد الجلسات المتبقية</label>
              <Input
                type="number"
                value={formData.sessions_count || 0}
                onChange={(e) => setFormData({ ...formData, sessions_count: parseInt(e.target.value) })}
              />
            </div>
          </>
        );

      case 'Subscription':
        return (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">حالة الدفع</label>
              <Select
                value={formData.payment_status || 'pending'}
                onValueChange={(val) => setFormData({ ...formData, payment_status: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'Lesson':
        return (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">العنوان</label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">الوصف</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">النوع</label>
              <Select
                value={formData.type || 'video'}
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
              <label className="text-sm font-medium mb-2 block">رابط الفيديو</label>
              <Input
                value={formData.video_url || ''}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">المحتوى</label>
              <Textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">الترتيب</label>
              <Input
                type="number"
                value={formData.order || 0}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">المدة</label>
              <Input
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="مثال: 30 دقيقة"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">مجاني</label>
              <Select
                value={formData.is_free ? 'true' : 'false'}
                onValueChange={(val) => setFormData({ ...formData, is_free: val === 'true' })}
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
          </>
        );

      case 'MentorshipPackage':
        return (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">اسم الباقة</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">عدد الجلسات</label>
              <Input
                type="number"
                value={formData.sessions_count || 0}
                onChange={(e) => setFormData({ ...formData, sessions_count: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">السعر (ر.س)</label>
              <Input
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">الوصف</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">مدة الجلسة</label>
              <Input
                value={formData.session_duration || ''}
                onChange={(e) => setFormData({ ...formData, session_duration: e.target.value })}
                placeholder="مثال: ساعة واحدة"
              />
            </div>
          </>
        );

      default:
        return <p>غير مدعوم</p>;
    }
  };

  return (
    <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل {dialog.type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {renderFields()}
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
              onClick={() => setDialog({ open: false, type: null, data: null })}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
