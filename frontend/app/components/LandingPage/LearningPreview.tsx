import FadeInSection from "../FadeInSection";

const FeatureLine = ({ icon, text }: { icon: string; text: string }) => {
    return (
        <div className="flex items-center gap-4">
            <img src={icon} alt="" className="w-7 h-7" />
            <p className="text-primary-800">{text}</p>
        </div>
    );
};

const LearningPreview = () => {
    return (
        <FadeInSection>
            <section className="two-columns-section two-columns-section-left ">
                <div className="w-full flex justify-center items-center">
                    <img
                        src="/assets/images/learning_preview.png"
                        alt="Learning Preview"
                        className="w-full h-auto rounded-lg shadow-lg"
                    />
                </div>
                <div className="flex flex-col gap-7 justify-center items-start">
                    <h1 className="text-primary-800">
                        Apprenez le code avant de passer à la pratique.
                    </h1>
                    <p className="font-medium text-primary-600">
                       Maîtrisez la théorie avec des leçons simples et visuelles.Comprenez les panneaux, les priorités et les règles de conduite — étape par étape.
                    </p>
                    <div className="flex flex-col justify-center items-start gap-2">
                        <FeatureLine
                            icon="/assets/icons/school.svg"
                            text="Leçons interactives et illustrées pour chaque thème"
                        />
                        <FeatureLine
                            icon="/assets/icons/poll.svg"
                            text="Panneaux et situations réelles expliqués en détail"
                        />
                        <FeatureLine
                            icon="/assets/icons/explore.svg"
                            text="Suivi de progression pour savoir où vous en êtes"
                        />
                    </div>
                    <button className="btn-primary mt-4">Apprendre le code</button>
                </div>
            </section>
        </FadeInSection>
    );
};

export default LearningPreview;
