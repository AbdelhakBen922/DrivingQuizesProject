import type { Route } from "./+types/contact";
import NavBar from "~/components/NavBar";
import ContactForm from "~/components/Contact/ContactForm";
import FAQ from "~/components/LandingPage/FAQ";
import Footer from "~/components/Footer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact Us - Driving School" },
    { name: "description", content: "Get in touch with us for any questions or support." },
  ];
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar dark={false} />
      <ContactForm />
      <FAQ id="faq" />
      <Footer />
    </div>
  );
}
