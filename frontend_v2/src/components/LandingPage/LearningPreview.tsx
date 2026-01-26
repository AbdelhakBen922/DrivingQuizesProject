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

const LearningPreview = ({ id }: { id: string }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const handleLearnClick = () => {
        navigate('/login?type=student');
    };
    
    return (
        <FadeInSection>
            <section id={id} className="two-columns-section two-columns-section-left ">
                <div className="w-full flex justify-center items-center ">
                    <img
                        src="/assets/images/learning_preview.png"
                        alt="Learning Preview"
                        className="w-full h-auto rounded-lg shadow-lg hidden md:block"
                    />
                </div>
                <div className="flex flex-col gap-7 justify-center items-center text-center md:text-start md:items-start">
                    <h1 className="text-primary-800">
                        {t('learningPreview.title')}
                    </h1>
                    <p className="font-medium text-primary-600">
                        {t('learningPreview.description')}
                    </p>
                        <img
                            src="/assets/images/learning_preview_mobile.png"
                            alt="Learning Preview Mobile"
                            className="w-full h-auto rounded-lg  md:hidden"
                        />
                    <div className="flex flex-col justify-center items-start gap-2 text-start">
                        <FeatureLine
                            icon="/assets/icons/school.svg"
                            text={t('learningPreview.feature1')}
                        />
                        <FeatureLine
                            icon="/assets/icons/poll.svg"
                            text={t('learningPreview.feature2')}
                        />
                        <FeatureLine
                            icon="/assets/icons/explore.svg"
                            text={t('learningPreview.feature3')}
                        />
                    </div>
                    <button onClick={handleLearnClick} className="btn-primary text-2xl mt-4">
                        {t('learningPreview.btn')}
                    </button>
                </div>
            </section>
        </FadeInSection>
    );
};

export default LearningPreview;
