import FadeInSection from "../FadeInSection";
import NavBar from "../NavBar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

const Hero = ( { id }: { id: string } ) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const handleQuizClick = () => {
        navigate('/login?type=student');
    };
    
    const handleLearnClick = () => {
        const element = document.getElementById('learning-preview');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    return (
            <section id={id} className=" relative w-full h-screen flex flex-col items-center justify-start ">
                <img
                    src="/assets/images/hero.png"
                    alt=""
                    className="absolute top-0 left-0 w-full h-full object-cover object-center max-w-none z-0"
                />
                <NavBar dark={true} />

                <div className="z-10 text-center flex flex-col gap-6 text-white px-4  mt-30">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-7xl">{t('hero.title')}</h1>
                        <h4>{t('hero.subtitle')}</h4>
                    </div>
                    <p className="opacity-70">
                        {t('hero.description')}
                    </p>
                    <div className="flex flex-row justify-center items-center gap-6">
                        <button onClick={handleQuizClick} className="btn-primary max-md:w-full ">
                            {t('hero.btnQuiz')}
                        </button>
                        <button onClick={handleLearnClick} className="btn-secondary max-md:w-full ">
                            {t('hero.btnLearn')}
                        </button>
                    </div>
                </div>
            </section>
    );
};

export default Hero;
