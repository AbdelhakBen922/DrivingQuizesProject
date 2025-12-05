import FadeInSection from "../FadeInSection";
import { useTranslation } from "react-i18next";

const ExpertCard = ({
    name,
    image,
    job,
}: {
    name: string;
    image: string;
    job: string;
}) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center text-center gap-1">
            <img src={image} alt={name} className="w-24 h-24 rounded-full mb-4" />
            <h4 className="text-primary-800">{name}</h4>
            <p className="text-primary-500">{job}</p>
            <a className="text-primary-200 underline underline-offset-2 text-lg font-bold" href="#">
                {t('experts.contact')}
            </a>
        </div>
    );
};

const OurExperts = () => {
    const { t } = useTranslation();
    return (
        <FadeInSection>
            <section className="bg-white flex flex-col justify-center items-center  gap-6 md:gap-10 py-6 px-4 md:py-12 md:px-24">
                <div className="flex flex-col justify-center items-center ">
                    <h1 className=" text-primary-800 text-center mb-4">
                        {t('experts.title')}
                    </h1>
                    <h4 className="text-primary-500 text-center font-medium max-w-2xl">
                        {t('experts.subtitle')}
                    </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-8">
                    <ExpertCard
                        name="Abdelhak Benbouziane"
                        image="/assets/images/expert1.png"
                        job={t('experts.job1')}
                    />
                    <ExpertCard
                        name="Zakaria Chetouane"
                        image="/assets/images/expert2.png"
                        job={t('experts.job2')}
                    />
                    <ExpertCard
                        name="Dhia Guerfi"
                        image="/assets/images/expert3.png"
                        job={t('experts.job3')}
                    />
                    <ExpertCard
                        name="Ala Slimani"
                        image="/assets/images/expert4.png"
                        job={t('experts.job4')}
                    />
                </div>
            </section>
        </FadeInSection>
    );
};

export default OurExperts;
