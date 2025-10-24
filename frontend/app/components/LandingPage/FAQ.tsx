import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeInSection from "../FadeInSection";

const QuestionItem = ({
    question,
    answer,
}: {
    question: string;
    answer: string;
}) => {
    const [showAnswer, setShowAnswer] = useState<boolean>(false);
    return (
        <div className={`flex flex-col gap-2 w-full max-w-3xl border border-primary-300 rounded-md shadow-sm hover:shadow-md   transition-all duration-200 cursor-pointer ${showAnswer ? "":"h-fit"}`}>
            <div
                className="flex flex-row items-center justify-between p-3"
                onClick={() => setShowAnswer(!showAnswer)}
            >
                <p className="text-primary-600 font-medium">{question}</p>
                <img
                    src={"/assets/icons/down.svg"}
                    alt="Expand"
                    className={`h-5 w-5 transform transition-transform duration-300 ${showAnswer ? "rotate-180" : ""}`}
                />
            </div>
            <AnimatePresence>
                {showAnswer && (
                    <motion.div
                        className="border-t-1 border-light-grey "
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <p className="text-primary-200 font-light text-md p-3">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => {
    const questionsAnswers = [
        {
            question: "Comment puis-je m'inscrire à la plateforme ?",
            answer:
                "Vous pouvez vous inscrire en cliquant sur le bouton 'S'inscrire' en haut à droite de la page d'accueil et en remplissant le formulaire d'inscription.",
        },
        {
            question: "Quels types de tests sont disponibles ?",
            answer:
                "Nous proposons une variété de tests, y compris des tests de code de la route, des tests pratiques et des simulations d'examen.",
        },
        {
            question: "Puis-je accéder à la plateforme depuis mon téléphone ?",
            answer:
                "Oui, notre plateforme est entièrement responsive et accessible depuis tous les appareils, y compris les smartphones et les tablettes.",
        },
        {
            question: "Y a-t-il un support client disponible ?",
            answer:
                "Oui, nous avons une équipe de support dédiée prête à vous aider par chat en direct, email ou téléphone.",
        },
        {
            question: "Comment puis-je suivre mes progrès ?",
            answer:
                "Vous pouvez suivre vos progrès via votre tableau de bord personnel, où vous trouverez des statistiques détaillées sur vos performances.",
        },
        {
            question: "Quels sont les modes de paiement acceptés ?",
            answer:
                "Nous acceptons les paiements par carte de crédit, PayPal et virement bancaire.",
        },
    ];
    return (
        <FadeInSection>
            <section className="flex flex-col justify-center items-center gap-10 py-10 px-8 md:gap-20 md:py-16 md:px-24 bg-white">
                <div className=" flex flex-col justify-center items-center text-center gap-6 px-4 max-w-3xl">
                    <h1 className="text-primary-800">Questions Fréquemment Posées</h1>
                    <h4 className="text-primary-600 font-normal">
                        Trouvez des réponses aux questions les plus courantes sur notre
                        service.
                    </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-y-5 gap-x-4 ">
                    {questionsAnswers.map((qa, index) => (
                        <QuestionItem
                            key={index}
                            question={qa.question}
                            answer={qa.answer}
                        />
                    ))}
                    
                </div>
            </section>
        </FadeInSection>
    );
};

export default FAQ;
