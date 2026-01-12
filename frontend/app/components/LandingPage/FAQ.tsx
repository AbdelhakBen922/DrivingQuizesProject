import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeInSection from "../FadeInSection";
import { useTranslation } from "react-i18next";

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

const FAQ = ({ id }: { id: string }) => {
    const { t } = useTranslation();
    const questionsAnswers = [
        { question: t('faq.q1'), answer: t('faq.a1') },
        { question: t('faq.q2'), answer: t('faq.a2') },
        { question: t('faq.q3'), answer: t('faq.a3') },
        { question: t('faq.q4'), answer: t('faq.a4') },
        { question: t('faq.q5'), answer: t('faq.a5') },
        { question: t('faq.q6'), answer: t('faq.a6') },
    ];
    return (
        <FadeInSection>
            <section id={id} className="flex flex-col justify-center items-center gap-10 py-10 px-8 md:gap-20 md:py-16 md:px-24 bg-white">
                <div className=" flex flex-col justify-center items-center text-center gap-6 px-4 max-w-3xl">
                    <h1 className="text-primary-800">{t('faq.title')}</h1>
                    <h4 className="text-primary-600 font-normal">
                        {t('faq.subtitle')}
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
