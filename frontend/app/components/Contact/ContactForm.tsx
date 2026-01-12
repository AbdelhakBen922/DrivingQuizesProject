import { useState } from "react";
import { useTranslation } from "react-i18next";
import FadeInSection from "../FadeInSection";

const ContactForm = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setError(t("contact.errorRequired", "Veuillez remplir tous les champs obligatoires"));
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t("contact.errorInvalidEmail", "Veuillez entrer une adresse email valide"));
      setLoading(false);
      return;
    }

    // Simulate form submission (since no backend API exists yet)
    try {
      // In a real implementation, you would call an API here:
      // await api.sendContactMessage(formData);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // For now, just log to console and show success
      console.log("Contact form submitted:", formData);
      
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      setError(
        err.message || t("contact.errorSubmit", "Erreur lors de l'envoi du message")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeInSection>
      <section className="bg-white py-16 px-6 md:px-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-primary-800 mb-4">
              {t("contact.title", "Contactez-nous")}
            </h1>
            <p className="text-primary-600 font-medium text-xl">
              {t(
                "contact.subtitle",
                "Nous sommes là pour répondre à toutes vos questions. Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais."
              )}
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-primary-25 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="/assets/icons/phone.svg" alt="Phone" className="w-6 h-6 filter brightness-0 invert" />
              </div>
              <h4 className="text-primary-800 mb-2">{t("contact.phone", "Téléphone")}</h4>
              <p className="text-primary-600">+213 555 000 000</p>
            </div>
            
            <div className="bg-primary-25 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="/assets/icons/mail.svg" alt="Email" className="w-6 h-6 filter brightness-0 invert" />
              </div>
              <h4 className="text-primary-800 mb-2">{t("contact.email", "Email")}</h4>
              <p className="text-primary-600">contact@drivingschool.dz</p>
            </div>
            
            <div className="bg-primary-25 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-primary-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="/assets/icons/location.svg" alt="Location" className="w-6 h-6 filter brightness-0 invert" />
              </div>
              <h4 className="text-primary-800 mb-2">{t("contact.address", "Adresse")}</h4>
              <p className="text-primary-600">Alger, Algérie</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-100">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green/10 border border-green/30 rounded-xl text-green text-center">
                {t(
                  "contact.successMessage",
                  "✓ Votre message a été envoyé avec succès ! Nous vous répondrons bientôt."
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red/10 border border-red/30 rounded-xl text-red text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="form-label block mb-2">
                  {t("contact.name", "Nom complet")} <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("contact.namePlaceholder", "Entrez votre nom complet")}
                  className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                  required
                  disabled={loading}
                />
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label block mb-2">
                    {t("contact.email", "Email")} <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("contact.emailPlaceholder", "votre.email@exemple.com")}
                    className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="form-label block mb-2">
                    {t("contact.phone", "Téléphone")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("contact.phonePlaceholder", "+213 555 000 000")}
                    className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="form-label block mb-2">
                  {t("contact.subject", "Sujet")}
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`form-field ${isRTL ? "text-right" : "text-left"}`}
                  disabled={loading}
                >
                  <option value="">
                    {t("contact.selectSubject", "Sélectionnez un sujet")}
                  </option>
                  <option value="general">
                    {t("contact.subjectGeneral", "Question générale")}
                  </option>
                  <option value="student">
                    {t("contact.subjectStudent", "Question élève")}
                  </option>
                  <option value="school">
                    {t("contact.subjectSchool", "Question auto-école")}
                  </option>
                  <option value="technical">
                    {t("contact.subjectTechnical", "Support technique")}
                  </option>
                  <option value="partnership">
                    {t("contact.subjectPartnership", "Partenariat")}
                  </option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="form-label block mb-2">
                  {t("contact.message", "Message")} <span className="text-red">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t(
                    "contact.messagePlaceholder",
                    "Écrivez votre message ici..."
                  )}
                  rows={6}
                  className={`form-field resize-none ${isRTL ? "text-right" : "text-left"}`}
                  required
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary w-full py-4 text-xl"
                disabled={loading}
              >
                {loading
                  ? t("contact.sending", "Envoi en cours...")
                  : t("contact.send", "Envoyer le message")}
              </button>
            </form>
          </div>
        </div>
      </section>
    </FadeInSection>
  );
};

export default ContactForm;
