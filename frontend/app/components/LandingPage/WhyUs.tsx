import FadeInSection from "../FadeInSection"
import FeatureCard from "../FeatureCard"
import { useTranslation } from "react-i18next";

const WhyUs = ({ id }: { id: string }) => {
    const { t } = useTranslation();
    return (
        <FadeInSection>
            <section id={id} className="bg-white  flex flex-col justify-center items-center gap-8 py-10 px-12 md:gap-15 md:py-12 md:px-20 max-md:text-center">
                <h2 className=" text-primary-800">
                    {t('whyUs.title')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard icon="/assets/icons/date_range.svg" feature={t('whyUs.feature1Title')} description={t('whyUs.feature1Desc')} />
                    <FeatureCard icon="/assets/icons/accessibility_new.svg" feature={t('whyUs.feature2Title')} description={t('whyUs.feature2Desc')} />
                    <FeatureCard icon="/assets/icons/build.svg" feature={t('whyUs.feature3Title')} description={t('whyUs.feature3Desc')} />
                </div>
            </section>
        </FadeInSection>
    )
}

export default WhyUs
