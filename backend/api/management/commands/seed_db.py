from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from django.core.management.base import BaseCommand

from api.models import (
    AvailableSlot,
    Booking,
    Course,
    Lesson,
    MentorshipPackage,
    Subscription,
    Writer,
)


class Command(BaseCommand):
    help = "Seed the database with sample data."

    def handle(self, *args, **options):
        writer1, _ = Writer.objects.get_or_create(
            name="د. سارة الهاشمي",
            defaults={
                "bio": "روائية ومدرّبة كتابة إبداعية بخبرة أكثر من 10 سنوات.",
                "specialty": "الكتابة الإبداعية",
                "email": "sara@ketab.com",
                "experience": "10+ سنوات",
                "achievements": "حاصلة على جوائز أدبية ومؤلفة لعدة أعمال روائية.",
                "active": True,
            },
        )
        writer2, _ = Writer.objects.get_or_create(
            name="أ. خالد الشمري",
            defaults={
                "bio": "مدرّب كتابة وتقنيات سرد، وخبير في بناء الحبكة.",
                "specialty": "تقنيات السرد",
                "email": "khaled@ketab.com",
                "experience": "8 سنوات",
                "achievements": "أدار ورش كتابة متعددة في السعودية والخليج.",
                "active": True,
            },
        )

        course1, _ = Course.objects.get_or_create(
            title="أساسيات الكتابة الإبداعية",
            defaults={
                "description": "ابدأ من الصفر وتعلّم بناء الفكرة والشخصيات والحبكة.",
                "instructor": writer1.name,
                "type": "free",
                "price": Decimal("0.00"),
                "requirements": "لا توجد متطلبات مسبقة.",
                "category": "إبداعي",
                "duration": "3 ساعات",
                "level": "beginner",
                "published": True,
            },
        )
        course2, _ = Course.objects.get_or_create(
            title="تقنيات السرد وبناء الحبكة",
            defaults={
                "description": "كيف تبني حبكة قوية وتكتب مشاهد مؤثرة بدون ملل.",
                "instructor": writer2.name,
                "type": "paid",
                "price": Decimal("149.00"),
                "requirements": "خبرة بسيطة في الكتابة.",
                "category": "سرد",
                "duration": "6 ساعات",
                "level": "intermediate",
                "published": True,
            },
        )

        Lesson.objects.get_or_create(
            course=course1,
            order=1,
            defaults={
                "title": "مدخل إلى الكتابة",
                "description": "تعرف على أساسيات الكتابة الإبداعية.",
                "type": "video",
                "video_url": "https://example.com/video1",
                "content": "محتوى تمهيدي.",
                "is_free": True,
                "duration": "20 دقيقة",
            },
        )
        Lesson.objects.get_or_create(
            course=course1,
            order=2,
            defaults={
                "title": "بناء الفكرة",
                "description": "كيف تولّد أفكاراً لقصصك.",
                "type": "exercise",
                "content": "تمرين عملي لتوليد الأفكار.",
                "is_free": False,
                "duration": "25 دقيقة",
            },
        )
        Lesson.objects.get_or_create(
            course=course2,
            order=1,
            defaults={
                "title": "الحبكة وأنواعها",
                "description": "مقدمة في أنواع الحبكات.",
                "type": "video",
                "video_url": "https://example.com/video2",
                "content": "شرح نظري.",
                "is_free": False,
                "duration": "30 دقيقة",
            },
        )
        Lesson.objects.get_or_create(
            course=course2,
            order=2,
            defaults={
                "title": "المشهد المؤثر",
                "description": "تقنيات كتابة المشاهد المؤثرة.",
                "type": "live",
                "content": "جلسة مباشرة.",
                "is_free": False,
                "duration": "45 دقيقة",
            },
        )

        package1, _ = MentorshipPackage.objects.get_or_create(
            writer=writer1,
            name="جلسة واحدة",
            defaults={
                "writer_name": writer1.name,
                "sessions_count": 1,
                "price": Decimal("200.00"),
                "description": "جلسة إرشاد فردية لمدة ساعة.",
                "session_duration": "60 دقيقة",
                "benefits": ["مراجعة نص", "توجيهات عملية"],
            },
        )
        package2, _ = MentorshipPackage.objects.get_or_create(
            writer=writer2,
            name="3 جلسات",
            defaults={
                "writer_name": writer2.name,
                "sessions_count": 3,
                "price": Decimal("500.00"),
                "description": "ثلاث جلسات إرشادية مكثفة.",
                "session_duration": "60 دقيقة",
                "benefits": ["متابعة مستمرة", "خطة تطوير"],
            },
        )

        Subscription.objects.get_or_create(
            user_email="student@example.com",
            course=course1,
            defaults={
                "course_title": course1.title,
                "payment_status": "completed",
                "payment_amount": Decimal("0.00"),
                "payment_date": date.today(),
                "expiry_date": date.today() + timedelta(days=30),
            },
        )
        Subscription.objects.get_or_create(
            user_email="student2@example.com",
            course=course2,
            defaults={
                "course_title": course2.title,
                "payment_status": "completed",
                "payment_amount": course2.price,
                "payment_date": date.today(),
                "expiry_date": date.today() + timedelta(days=30),
            },
        )

        booking1, _ = Booking.objects.get_or_create(
            user_email="student@example.com",
            writer=writer1,
            package=package1,
            defaults={
                "user_name": "فهد أحمد",
                "writer_name": writer1.name,
                "writer_email": writer1.email,
                "sessions_count": 1,
                "session_date": datetime.now(timezone.utc) + timedelta(days=2),
                "status": "confirmed",
                "payment_status": "completed",
                "notes": "يرجى مراجعة الفصل الأول.",
            },
        )
        booking2, _ = Booking.objects.get_or_create(
            user_email="student2@example.com",
            writer=writer2,
            package=package2,
            defaults={
                "user_name": "نورة علي",
                "writer_name": writer2.name,
                "writer_email": writer2.email,
                "sessions_count": 3,
                "session_date": datetime.now(timezone.utc) + timedelta(days=4),
                "status": "pending",
                "payment_status": "pending",
                "notes": "تحديد موعد مناسب للجلسات.",
            },
        )

        AvailableSlot.objects.get_or_create(
            writer=writer1,
            date=date.today() + timedelta(days=5),
            time="18:00",
            defaults={"is_available": True, "booking": None},
        )
        AvailableSlot.objects.get_or_create(
            writer=writer1,
            date=date.today() + timedelta(days=6),
            time="20:00",
            defaults={"is_available": False, "booking": booking1},
        )
        AvailableSlot.objects.get_or_create(
            writer=writer2,
            date=date.today() + timedelta(days=7),
            time="17:00",
            defaults={"is_available": True, "booking": None},
        )
        AvailableSlot.objects.get_or_create(
            writer=writer2,
            date=date.today() + timedelta(days=8),
            time="19:00",
            defaults={"is_available": False, "booking": booking2},
        )

        self.stdout.write(self.style.SUCCESS("Seed data created."))
