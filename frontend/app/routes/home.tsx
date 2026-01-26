import Hero from "~/components/LandingPage/Hero";
import type { Route } from "./+types/home";
import QuizPreview from "~/components/LandingPage/QuizPreview";
import LearningPreview from "~/components/LandingPage/LearningPreview";
import  WhyUs from "~/components/LandingPage/WhyUs";
import OurExperts from "~/components/LandingPage/OurExperts";
import Testimonials from "~/components/LandingPage/Testimonials";
import FAQ from "~/components/LandingPage/FAQ";
import Footer from "~/components/Footer";
import { PublicRoute } from "~/components/ProtectedRoute";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Driving School" },
    { name: "description", content: "Welcome to the Driving School!" },
  ];
}

export default function Home() {
  return (
    <PublicRoute redirectAuthenticated={false}>
      <div>
        <Hero id="hero" />
        <QuizPreview id="quiz-preview" />
        <LearningPreview id='learning-preview' />
        <WhyUs id="why-us" />
        <OurExperts id="our-experts" />
        <Testimonials id="testimonials" />
        <FAQ id="faq" />
        <Footer />
      </div>
    </PublicRoute>
  );
}
