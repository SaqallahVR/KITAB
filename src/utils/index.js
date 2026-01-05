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
    };
    return map[name] || "/";
  };
