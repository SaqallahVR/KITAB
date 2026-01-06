import React, { useState, useEffect } from "react";
import { kitabApi } from "@/api/kitabApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StatCard from "@/components/ui/stat-card";
import { getBookingStatusClass, getBookingStatusLabel } from "@/utils/status";
import {
  PackagePlus,
  Users,
  Calendar,
  Mail,
  Pencil,
  Trash2,
  Plus,
  Save,
  X,
  Loader2,
  BookMarked,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function WriterDashboard() {
  const [user, setUser] = useState(null);
  const [writer, setWriter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name: "",
    sessions_count: 1,
    price: 0,
    description: "",
    session_duration: "60 دقيقة",
    benefits: [],
  });
  const [benefitInput, setBenefitInput] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    kitabApi.auth
      .me()
      .then(async (userData) => {
        setUser(userData);
        const writers = await kitabApi.entities.Writer.filter({ email: userData.email });
        if (writers[0]) {
          setWriter(writers[0]);
        }
      })
      .catch(() => {
        kitabApi.auth.redirectToLogin(window.location.href);
      })
      .finally(() => setLoading(false));
  }, []);

  const { data: packages } = useQuery({
    queryKey: ["writer-packages", writer?.id],
    queryFn: () => kitabApi.entities.MentorshipPackage.filter({ writer_id: writer.id }),
    initialData: [],
    enabled: !!writer,
  });

  const { data: bookings } = useQuery({
    queryKey: ["writer-bookings", writer?.id],
    queryFn: () =>
      kitabApi.entities.Booking.filter({ writer_id: writer.id }, "-created_date"),
    initialData: [],
    enabled: !!writer,
  });

  const createPackageMutation = useMutation({
    mutationFn: (data) => kitabApi.entities.MentorshipPackage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writer-packages"] });
      setShowPackageDialog(false);
      resetForm();
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: ({ id, data }) => kitabApi.entities.MentorshipPackage.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writer-packages"] });
      setShowPackageDialog(false);
      setEditingPackage(null);
      resetForm();
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: (id) => kitabApi.entities.MentorshipPackage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writer-packages"] });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }) => kitabApi.entities.Booking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["writer-bookings"] });
    },
  });

  const resetForm = () => {
    setPackageForm({
      name: "",
      sessions_count: 1,
      price: 0,
      description: "",
      session_duration: "60 دقيقة",
      benefits: [],
    });
    setBenefitInput("");
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name || "",
      sessions_count: pkg.sessions_count,
      price: pkg.price,
      description: pkg.description || "",
      session_duration: pkg.session_duration || "60 دقيقة",
      benefits: pkg.benefits || [],
    });
    setShowPackageDialog(true);
  };

  const handleSavePackage = async () => {
    const data = {
      writer_id: writer.id,
      writer_name: writer.name,
      ...packageForm,
    };

    if (editingPackage) {
      await updatePackageMutation.mutateAsync({ id: editingPackage.id, data });
    } else {
      await createPackageMutation.mutateAsync(data);
    }
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setPackageForm({
        ...packageForm,
        benefits: [...packageForm.benefits, benefitInput.trim()],
      });
      setBenefitInput("");
    }
  };

  const removeBenefit = (index) => {
    setPackageForm({
      ...packageForm,
      benefits: packageForm.benefits.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!writer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] flex items-center justify-center p-6">
        <Alert>
          <AlertDescription>
            لا يوجد ملف كاتب مرتبط بحسابك. يرجى التواصل مع الإدارة.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#1A1A1A] mb-2">
            لوحة تحكم الكاتب
          </h1>
          <p className="text-xl text-gray-600">مرحباً {writer.name}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="الباقات"
            value={packages.length}
            Icon={PackagePlus}
            layout="row"
            bg="from-[#FFF4D6] to-white"
            iconBg="bg-[#D4AF37]/20"
            iconColor="text-[#D4AF37]"
            padding="pt-7"
          />
          <StatCard
            label="الحجوزات"
            value={bookings.length}
            Icon={Users}
            layout="row"
            bg="from-[#E9FBF1] to-white"
            iconBg="bg-green-100"
            iconColor="text-green-600"
            padding="pt-6"
          />
          <StatCard
            label="الجلسات النشطة"
            value={bookings.filter((b) => b.status === "confirmed").length}
            Icon={Calendar}
            layout="row"
            bg="from-[#EAF2FF] to-white"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            padding="pt-8"
          />
        </div>

        <Tabs defaultValue="packages" className="w-full">
          <TabsList className="w-full bg-white shadow-md mb-8">
            <TabsTrigger value="packages" className="flex-1 gap-2">
              <PackagePlus className="w-4 h-4" />
              الباقات
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 gap-2">
              <Users className="w-4 h-4" />
              المشتركين والحجوزات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packages">
            <div className="mb-6">
              <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F]"
                    onClick={() => {
                      setEditingPackage(null);
                      resetForm();
                    }}
                  >
                    <Plus className="ml-2 w-4 h-4" />
                    إضافة باقة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPackage ? "تعديل الباقة" : "إضافة باقة جديدة"}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">اسم الباقة</label>
                      <Input
                        placeholder="مثال: باقة المبتدئين"
                        value={packageForm.name}
                        onChange={(e) =>
                          setPackageForm({ ...packageForm, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">عدد الجلسات</label>
                        <Input
                          type="number"
                          min="1"
                          value={packageForm.sessions_count}
                          onChange={(e) =>
                            setPackageForm({
                              ...packageForm,
                              sessions_count: parseInt(e.target.value, 10),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">السعر (ر.س)</label>
                        <Input
                          type="number"
                          min="0"
                          value={packageForm.price}
                          onChange={(e) =>
                            setPackageForm({
                              ...packageForm,
                              price: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">مدة الجلسة</label>
                      <Input
                        placeholder="60 دقيقة"
                        value={packageForm.session_duration}
                        onChange={(e) =>
                          setPackageForm({
                            ...packageForm,
                            session_duration: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">الوصف</label>
                      <Textarea
                        rows={3}
                        placeholder="وصف الباقة والخدمات المقدمة"
                        value={packageForm.description}
                        onChange={(e) =>
                          setPackageForm({ ...packageForm, description: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">الميزات</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="أضف ميزة"
                          value={benefitInput}
                          onChange={(e) => setBenefitInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addBenefit()}
                        />
                        <Button onClick={addBenefit} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {packageForm.benefits.length > 0 && (
                        <div className="space-y-2">
                          {packageForm.benefits.map((benefit, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm">{benefit}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeBenefit(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSavePackage}
                        className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B8941F]"
                        disabled={
                          createPackageMutation.isPending || updatePackageMutation.isPending
                        }
                      >
                        <Save className="ml-2 w-4 h-4" />
                        حفظ
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPackageDialog(false);
                          setEditingPackage(null);
                          resetForm();
                        }}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="border-none shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">
                          {pkg.name || `${pkg.sessions_count} جلسات`}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">
                            {pkg.sessions_count} جلسة
                          </Badge>
                          <Badge variant="outline">{pkg.session_duration}</Badge>
                        </div>
                      </div>
                      <div className="text-3xl font-black text-[#D4AF37]">
                        {pkg.price} ر.س
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {pkg.description && (
                      <p className="text-gray-600 mb-4">{pkg.description}</p>
                    )}

                    {pkg.benefits && pkg.benefits.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">الميزات:</p>
                        <ul className="space-y-1">
                          {pkg.benefits.map((benefit, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-600 flex items-start gap-2"
                            >
                              <span className="text-[#D4AF37] mt-1">•</span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditPackage(pkg)}
                      >
                        <Pencil className="ml-2 w-4 h-4" />
                        تعديل
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذه الباقة؟")) {
                            deletePackageMutation.mutate(pkg.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {packages.length === 0 && (
              <Card className="border-none shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6">
                  <PackagePlus className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">لا توجد باقات</h3>
                <p className="text-gray-600 mb-6">ابدأ بإضافة باقاتك الأولى للطلاب</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            {bookings.length === 0 ? (
              <Card className="border-none shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">لا توجد حجوزات</h3>
                <p className="text-gray-600">ستظهر حجوزات الطلاب هنا</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="border-none shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <CardContent className="px-6 pt-8 pb-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-[#1A1A1A]">
                              {booking.user_name}
                            </h3>
                            <Badge className={getBookingStatusClass(booking.status)}>
                              {getBookingStatusLabel(booking.status)}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-[#D4AF37]" />
                              <span>{booking.user_email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookMarked className="w-4 h-4 text-[#D4AF37]" />
                              <span>{booking.sessions_count} جلسات متبقية</span>
                            </div>
                            {booking.session_date && (
                              <>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                                  <span>
                                    {format(new Date(booking.session_date), "d MMMM yyyy", {
                                      locale: ar,
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                                  <span>
                                    {format(new Date(booking.session_date), "HH:mm", {
                                      locale: ar,
                                    })}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {booking.notes && (
                            <div className="mt-4 p-3 bg-[#F5F1E8] rounded-lg">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                ملاحظات الطالب:
                              </p>
                              <p className="text-sm text-gray-600">{booking.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {booking.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() =>
                                  updateBookingMutation.mutate({
                                    id: booking.id,
                                    data: { status: "confirmed" },
                                  })
                                }
                              >
                                تأكيد
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() =>
                                  updateBookingMutation.mutate({
                                    id: booking.id,
                                    data: { status: "cancelled" },
                                  })
                                }
                              >
                                إلغاء
                              </Button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() =>
                                updateBookingMutation.mutate({
                                  id: booking.id,
                                  data: { status: "completed" },
                                })
                              }
                            >
                              إكمال
                            </Button>
                          )}
                        </div>
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
