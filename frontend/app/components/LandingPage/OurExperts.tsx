import FadeInSection from "../FadeInSection";

const ExpertCard = ({
    name,
    image,
    job,
}: {
    name: string;
    image: string;
    job: string;
}) => {
    return (
        <div className="flex flex-col items-center justify-center text-center gap-1">
            <img src={image} alt={name} className="w-24 h-24 rounded-full mb-4" />
            <h4 className="text-primary-800">{name}</h4>
            <p className="text-primary-500">{job}</p>
            <a className="text-primary-100 underline underline-offset-2 text-lg font-bold" href="#">
                contactez-moi
            </a>
        </div>
    );
};

const OurExperts = () => {
    return (
        <FadeInSection>
            <section className="bg-white flex flex-col justify-center items-center gap-10 py-12 px-24">
                <div className="flex flex-col justify-center items-center ">
                    <h1 className=" text-primary-800 text-center mb-4">
                        Notre équipe d’experts
                    </h1>
                    <h4 className="text-primary-500 text-center font-medium max-w-2xl">
                        Des professionnels passionnés qui vous accompagnent à chaque étape de votre apprentissage.
                    </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-8">
                    <ExpertCard
                        name="Abdelhak Benbouziane"
                        image="/assets/images/expert1.png"
                        job="Formateur principal"
                    />
                    <ExpertCard
                        name="Zakaria Chetouane"
                        image="/assets/images/expert2.png"
                        job="Moniteur de conduite"
                    />
                    <ExpertCard
                        name="Dhia Guerfi"
                        image="/assets/images/expert3.png"
                        job="Conseiller pédagogique"
                    />
                    <ExpertCard
                        name="Ala Slimani"
                        image="/assets/images/expert4.png"
                        job="Examinateur certifié"
                    />
                </div>
            </section>
        </FadeInSection>
    );
};

export default OurExperts;
