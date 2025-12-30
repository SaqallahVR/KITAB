import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, CheckCircle2, Loader2, ArrowRight, User, MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addDays } from "date-fns";
import { ar } from "date-fns/locale";

export default function BookingPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const writerId = urlParams.get('writer_id');
  const packageId = urlParams.get('package_id');
  
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {
        base44.auth.redirectToLogin(window.location.href);
      });
  }, []);

  const { data: writer } = useQuery({
    queryKey: ['writer', writerId],
    queryFn: async () => {
      const writers = await base44.entities.Writer.filter({ id: writerId });
      return writers[0];
    },
    enabled: !!writerId,
  });

  const { data: pkg } = useQuery({
    queryKey: ['package', packageId],
    queryFn: async () => {
      const packages = await base44.entities.MentorshipPackage.filter({ id: packageId });
      return packages[0];
    },
    enabled: !!packageId,
  });

  const { data: availableSlots } = useQuery({
    queryKey: ['slots', writerId],
    queryFn: () => base44.entities.AvailableSlot.filter({ 
      writer_id: writerId,
      is_available: true 
    }, 'date'),
    initialData: [],
    enabled: !!writerId,
  });

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const availableDates = Object.keys(slotsByDate).sort();

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      // Create booking
      const booking = await base44.entities.Booking.create(bookingData);
      
      // Mark slot as unavailable
      const slot = availableSlots.find(
        s => s.date === selectedDate && s.time === selectedTime
      );
      if (slot) {
        await base44.entities.AvailableSlot.update(slot.id, {
          is_available: false,
          booking_id: booking.id
        });
      }
      
      // Send email to writer
      await base44.integrations.Core.SendEmail({
        to: writer.email,
        subject: `حجز جديد من ${user.full_name}`,
        body: `
          مرحباً ${writer.name}،
          
          لديك حجز جديد:
          
          - الطالب: ${user.full_name}
          - البريد: ${user.email}
          - التاريخ: ${selectedDate}
          - الوقت: ${selectedTime}
          - الباقة: ${pkg.name || pkg.sessions_count + ' جلسات'}
          - ملاحظات: ${notes || 'لا توجد'}
          
          يرجى التواصل مع الطالب لتأكيد الموعد.
          
          مع تحيات منصة كتاب
        `
      });
      
      // Send confirmation to user
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `تأكيد حجز جلسة إرشاد مع ${writer.name}`,
        body: `
          مرحباً ${user.full_name}،
          
          تم حجز جلستك بنجاح!
          
          - الكاتب: ${writer.name}
          - التاريخ: ${selectedDate}
          - الوقت: ${selectedTime}
          - الباقة: ${pkg.name || pkg.sessions_count + ' جلسات'}
          - السعر: ${pkg.price} ر.س
          
          سيتواصل معك الكاتب قريباً لتأكيد الموعد.
          
          مع تحيات منصة كتاب
        `
      });
      
      return booking;
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    setIsProcessing(true);
    try {
      await createBookingMutation.mutateAsync({
        user_email: user.email,
        user_name: user.full_name,
        writer_id: writerId,
        writer_name: writer.name,
        writer_email: writer.email,
        package_id: packageId,
        sessions_count: pkg.sessions_count,
        session_date: `${selectedDate}T${selectedTime}`,
        status: 'pending',
        payment_status: 'pending',
        notes: notes
      });
    } catch (error) {
      console.error('Error creating booking:', error);
    }
    setIsProcessing(false);
  };

  if (!writer || !pkg) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] flex items-center justify-center">
        <Card className="max-w-lg border-none shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-[#1A1A1A] mb-4">تم الحجز بنجاح!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              تم إرسال تأكيد الحجز إلى بريدك الإلكتروني. سيتواصل معك الكاتب قريباً لتأكيد الموعد.
            </p>
            <div className="space-y-3">
              <Link to={createPageUrl("Profile")}>
                <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F]">
                  عرض حجوزاتي
                </Button>
              </Link>
              <Link to={createPageUrl("Mentorship")}>
                <Button variant="outline" className="w-full">
                  العودة للإرشاد الأدبي
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F5F1E8] py-12">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={createPageUrl("WriterProfile") + "?id=" + writerId}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#D4AF37] mb-4"
          >
            <ArrowRight className="w-4 h-4" />
            العودة لصفحة الكاتب
          </Link>
          <h1 className="text-4xl font-black text-[#1A1A1A] mb-2">حجز جلسة إرشاد</h1>
          <p className="text-xl text-gray-600">اختر الموعد المناسب لك</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Writer Info */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
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
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1A1A1A]">{writer.name}</h3>
                    <p className="text-gray-600">{writer.specialty}</p>
                  </div>
                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">
                    {pkg.name || `${pkg.sessions_count} جلسات`}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  اختر التاريخ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableDates.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      لا توجد مواعيد متاحة حالياً. يرجى المحاولة لاحقاً.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {availableDates.slice(0, 9).map((date) => (
                      <Button
                        key={date}
                        variant={selectedDate === date ? "default" : "outline"}
                        className={`h-auto py-3 flex-col ${
                          selectedDate === date 
                            ? 'bg-[#D4AF37] hover:bg-[#B8941F]' 
                            : ''
                        }`}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }}
                      >
                        <span className="text-xs">{format(new Date(date), 'EEE', { locale: ar })}</span>
                        <span className="font-bold">{format(new Date(date), 'd MMM', { locale: ar })}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Selection */}
            {selectedDate && slotsByDate[selectedDate] && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#D4AF37]" />
                    اختر الوقت
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {slotsByDate[selectedDate].map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        className={selectedTime === slot.time ? 'bg-[#D4AF37] hover:bg-[#B8941F]' : ''}
                        onClick={() => setSelectedTime(slot.time)}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {selectedDate && selectedTime && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                    ملاحظات (اختياري)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="أضف أي ملاحظات أو أسئلة تود مناقشتها..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div>
            <Card className="border-none shadow-xl sticky top-24">
              <CardHeader>
                <CardTitle>ملخص الحجز</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الباقة</p>
                  <p className="font-bold text-[#1A1A1A]">
                    {pkg.name || `${pkg.sessions_count} جلسات`}
                  </p>
                </div>

                {selectedDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">التاريخ</p>
                    <p className="font-bold text-[#1A1A1A]">
                      {format(new Date(selectedDate), 'd MMMM yyyy', { locale: ar })}
                    </p>
                  </div>
                )}

                {selectedTime && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الوقت</p>
                    <p className="font-bold text-[#1A1A1A]">{selectedTime}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">السعر</span>
                    <span className="font-bold text-[#1A1A1A]">{pkg.price} ر.س</span>
                  </div>
                  <div className="text-4xl font-black text-[#D4AF37] text-center my-4">
                    {pkg.price} ر.س
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4AF37] text-lg py-6"
                  disabled={!selectedDate || !selectedTime || isProcessing}
                  onClick={handleBooking}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="ml-2 w-5 h-5 animate-spin" />
                      جاري الحجز...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="ml-2 w-5 h-5" />
                      تأكيد الحجز والدفع
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-600 text-center">
                  بالنقر على "تأكيد الحجز" أنت توافق على شروط الاستخدام
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}