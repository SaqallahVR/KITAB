export const createPageUrl = (name) => {
    const map = {
      Home: "/home",
      Courses: "/courses",
      Mentorship: "/mentorship",
      Profile: "/profile",
      MySubscriptions: "/my-subscriptions",
    };
    return map[name] || "/";
  };
