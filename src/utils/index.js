export const createPageUrl = (name) => {
    const map = {
      Home: "/home",
      Courses: "/courses",
      CourseDetails: "/course-details",
      Lesson: "/lesson",
      Mentorship: "/mentorship",
      Profile: "/profile",
      MySubscriptions: "/my-subscriptions",
      WriterProfile: "/writer-profile",
      BookingPage: "/booking-page",
      WriterDashboard: "/writer-dashboard",
      InstructorDashboard: "/instructor-dashboard",
      AdminDashboard: "/admin-dashboard",
    };
    return map[name] || "/";
  };
