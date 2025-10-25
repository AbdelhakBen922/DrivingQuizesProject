import FadeInSection from "../FadeInSection";
import NavBar from "../NavBar";

const Hero = () => {
    return (
            <section className=" relative w-full h-screen flex flex-col items-center justify-start ">
                <img
                    src="/assets/images/hero.png"
                    alt=""
                    className="absolute top-0 left-0 w-full h-full object-cover object-center max-w-none z-0"
                />
                <NavBar dark={true} />

                <div className="z-10 text-center flex flex-col gap-6 text-white px-4  mt-30">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-7xl">Maîtrisez la route.</h1>
                        <h4 >Conduisez votre avenir en toute confiance.</h4>
                    </div>
                    <p className="opacity-70">
                        Apprenez le code, entraînez-vous en toute sécurité et suivez vos
                        progrès <br />
                        grâce à notre plateforme complète d’auto-école.
                        <br />
                        Votre réussite commence ici — sur la route de la liberté.
                    </p>
                    <div className="flex flex-row justify-center items-center gap-6">
                        <button className="btn-primary max-md:w-full ">
                        Faire Quiz
                            </button>
                        <button className="btn-secondary max-md:w-full ">
                            Apprendre le code
                        </button>
                    </div>
                </div>
            </section>
    );
};

export default Hero;
