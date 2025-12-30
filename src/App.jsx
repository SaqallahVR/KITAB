// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/ui/layout";

import Home from "@/pages/Home";
import Courses from "@/pages/Courses";
import CourseDetails from "@/pages/CourseDetails";
import Lesson from "@/pages/Lesson";
import Mentorship from "@/pages/Mentorship";
import MySubscriptions from "@/pages/MySubscriptions";
import Profile from "@/pages/Profile";
import WriterProfile from "@/pages/WriterProfile";
import BookingPage from "@/pages/BookingPage";

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404 - Page not found</h2>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course-details" element={<CourseDetails />} />
          <Route path="/lesson" element={<Lesson />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/my-subscriptions" element={<MySubscriptions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/writer-profile" element={<WriterProfile />} />
          <Route path="/booking-page" element={<BookingPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
