import FadeInSection from "../FadeInSection";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const FeatureLine = ({ icon, text }: { icon: string; text: string }) => {
    return (
        <div className="flex items-center gap-4">
            <img src={icon} alt="" className="w-7 h-7" />
            <p className="text-primary-800">{text}</p>
        </div>
    );
};

const QuizPreview = ({className,id}: {className?: string; id: string}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const handleQuizClick = () => {
        navigate('/login?type=student');
    };
    
    return (
        <FadeInSection>
            <section id={id} className={` two-columns-section two-columns-section-right ${className}`}>
                <div className="flex flex-col gap-7 justify-center items-center w-full text-center md:text-start md:items-start">
                    <h1 className="text-primary-800">
                        {t('quizPreview.title')}
                    </h1>
                    <p className="font-medium text-primary-600">
                        {t('quizPreview.description')}
                    </p>
                        <img src="/assets/images/quiz_preview_mobile.png" alt="Learning Preview Mobile" className="w-full h-auto rounded-lg  block md:hidden" />
                    <div className="flex flex-col justify-center items-start gap-2 text-start">
                        <FeatureLine
                            icon="/assets/icons/done_all.svg"
                            text={t('quizPreview.feature1')}
                        />
                        <FeatureLine
                            icon="/assets/icons/alarm.svg"
                            text={t('quizPreview.feature2')}
                        />
                        <FeatureLine
                            icon="/assets/icons/whatshot.svg"
                            text={t('quizPreview.feature3')}
                        />
                    </div>
                    <button onClick={handleQuizClick} className="btn-primary text-3xl py-3 mt-4">{t('quizPreview.btn')}</button>
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
