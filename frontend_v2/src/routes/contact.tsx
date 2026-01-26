import NavBar from "~/components/NavBar";
import ContactForm from "~/components/Contact/ContactForm";
import FAQ from "~/components/LandingPage/FAQ";
import Footer from "~/components/Footer";

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
