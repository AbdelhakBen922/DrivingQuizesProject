import FadeInSection from "../FadeInSection"
import FeatureCard from "../FeatureCard"

const WhyUs = () => {
    return (
        <FadeInSection>
            <section className="bg-white  flex flex-col justify-center items-center gap-8 py-10 px-12 md:gap-15 md:py-12 md:px-20 max-md:text-center">
                <h2 className=" text-primary-800">
                    Pourquoi choisir notre plateforme ?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard icon="/assets/icons/date_range.svg" feature="Apprentissage à votre rythme" description="Avancez à votre propre vitesse, reprenez vos leçons où vous les avez laissées." />
                    <FeatureCard icon="/assets/icons/accessibility_new.svg" feature="Interface moderne et intuitive" description="Navigation fluide, design clair et expérience agréable sur tous les appareils." />
                    <FeatureCard icon="/assets/icons/build.svg" feature="Personnalisation complète" description="Choisissez vos thèmes, vos types de tests et vos modes d’apprentissage préférés." />
                </div>
            </section>
        </FadeInSection>
    )
}

export default WhyUs