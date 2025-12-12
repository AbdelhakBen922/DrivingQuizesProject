import type { ReactNode } from "react";
import FadeInSection from "../FadeInSection";
import { useTranslation } from "react-i18next";

const TestimonialElement = ({
    image,
    text,
}: {
    image: ReactNode;
    text: string;
}) => {
    return (
        <div className="flex flex-col items-center justify-center text-center gap-4">
            {image}
            <p className="text-primary-600">{text}</p>
        </div>
    );
};
const UsersIconsWrapper = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex flex-row justify-center items-center -space-x-2 max-w-[180px] sm:max-w-xs overflow-hidden flex-nowrap">
            {children}
        </div>
    );
};
const starsReview = (review: boolean[]) => {
    const filled_path = "/assets/icons/star_filled.svg";
    const unfilled_path = "/assets/icons/star_unfilled.svg";
    return (
        <div className="flex flex-row justify-center items-center gap-0">
            {review.map((filled, index) => (
                <img
                    key={index}
                    src={filled ? filled_path : unfilled_path}
                    className="h-5 w-5 border-1 border-white"
                />
            ))}
        </div>
    );
};

const DividerBuilder = () => {
    return <img src="/assets/icons/Divider.svg" alt="" />;
};
const Testimonials = () => {
    const usersImages = [
        "/assets/images/user1.png",
        "/assets/images/user2.png",
        "/assets/images/user3.png",
        "/assets/images/user4.png",
        "/assets/images/user5.png",
        // "/assets/images/user6.png",
    ];
    const renderUserImages = () => {
        return usersImages.map((src, index) => (
            <img
                key={index}
                src={src}
                alt={`User ${index + 1}`}
                className="w-10 h-10 rounded-full border-2 border-white shrink-0"
                style={{ zIndex: usersImages.length - index }}
            />
        ));
    };

    return (
        <FadeInSection>
            <section className="flex flex-col justify-center items-center gap-14 sm:gap-20 py-16 sm:py-20 px-6 sm:px-16 lg:px-24 bg-white">
                {/* Title */}
                <div className="flex flex-col justify-center items-center text-center gap-4 sm:gap-6 px-2">
                    <h1 className="text-primary-800 text-2xl sm:text-3xl lg:text-4xl">
                        Ce que nos apprenants disent de nous
                    </h1>
                    <h4 className="text-primary-600 max-w-3xl text-sm sm:text-base lg:text-lg">
                        Des milliers d’élèves nous font confiance chaque année pour réussir
                        leur code et leur conduite.
                    </h4>
                </div>

                {/* Testimonials Row */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-10 sm:gap-8">
                    <TestimonialElement
                        image={<UsersIconsWrapper>{renderUserImages()}</UsersIconsWrapper>}
                        text="+10 000 élèves satisfaits"
                    />
                    <div className="hidden sm:block">
                        <DividerBuilder />
                    </div>
                    <hr className="block sm:hidden border-t border-primary-200 my-3 w-full" />
                    <TestimonialElement
                        image={starsReview([true, true, true, true, false])}
                        text="Basé sur les retours authentiques"
                    />
                    <div className="hidden sm:block">
                        <DividerBuilder />
                    </div>

                    <hr className="block sm:hidden border-t border-primary-200 my-3 w-full" />
                    <TestimonialElement
                        image={<img src="/assets/icons/iconsax-ranking.svg" alt="" />}
                        text="La meilleure formation à vos côtés."
                    />
                </div>
            </section>
        </FadeInSection>
    );
};

export default Testimonials;
