import FadeInSection from "../FadeInSection";

const FeatureLine = ({ icon, text }: { icon: string; text: string }) => {
    return (
        <div className="flex items-center gap-4">
            <img src={icon} alt="" className="w-7 h-7" />
            <p className="text-primary-800">{text}</p>
        </div>
    );
};

const QuizPreview = () => {
    return (
        <FadeInSection>
            <section className=" two-columns-section two-columns-section-right ">
                <div className="flex flex-col gap-7 justify-center items-center text-center md:text-start md:items-start">
                    <h1 className="text-primary-800">
                        Testez vos connaissances avant de prendre la route.
                    </h1>
                    <p className="font-medium text-primary-600">
                        Préparez votre examen avec des quiz interactifs. Apprenez, et suivez
                        vos progrès facilement.
                    </p>
                        <img src="/assets/images/quiz_preview_mobile.png" alt="Learning Preview Mobile" className="w-full h-auto rounded-lg  block md:hidden" />
                    <div className="flex flex-col justify-center items-start gap-2 text-start">
                        <FeatureLine
                            icon="/assets/icons/done_all.svg"
                            text="Correction intelligente avec retour immédiat"
                        />
                        <FeatureLine
                            icon="/assets/icons/alarm.svg"
                            text="Mode examen avec chronomètre"
                        />
                        <FeatureLine
                            icon="/assets/icons/whatshot.svg"
                            text="Suivi des progrès et statistiques de performance"
                        />
                    </div>
                    <button className="btn-primary text-3xl py-3 mt-4">Faire le Quiz</button>
                </div>
                <div className="w-full flex justify-center items-center">
                    <img
                        src="/assets/images/quiz_preview.png"
                        alt="Quiz Preview"
                        className="w-full h-auto rounded-lg shadow-lg max-md:hidden "
                    />
                </div>
            </section>
        </FadeInSection>
    );
};

export default QuizPreview;
