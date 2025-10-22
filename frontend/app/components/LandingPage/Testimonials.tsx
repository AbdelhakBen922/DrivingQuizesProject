import type { ReactNode } from "react";
import FadeInSection from "../FadeInSection";
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
        <div className="flex flex-row justify-center items-center -space-x-2">
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
    return (
        <img src="/assets/icons/Divider.svg" alt="" />
    );
};
const Testimonials = () => {
    const usersImages = [
        "/assets/images/user1.png",
        "/assets/images/user2.png",
        "/assets/images/user3.png",
        "/assets/images/user4.png",
        "/assets/images/user5.png",
        "/assets/images/user6.png",
    ];
    const renderUserImages = () => {
        return usersImages.map((src, index) => (
            <img
                key={index}
                src={src}
                alt={`User ${index + 1}`}
                className="w-10 h-10 rounded-full border-2 border-white"
                style={{ zIndex: usersImages.length - index }}
            />
        ));
    };

    return (
        <FadeInSection>
        <section className="flex flex-col justify-center items-center gap-20 py-20 px-24 bg-white">
            <div className=" flex flex-col justify-center items-center text-center gap-6 px-4">
                <h1 className="text-primary-800">
                    Ce que nos apprenants disent de nous
                </h1>
                <h4 className=" text-primary-600  max-w-3xl">
                    Des milliers d’élèves nous font confiance chaque année pour réussir
                    leur code et leur conduite.
                </h4>
            </div>
            <div className="flex flex-row justify-center items-center gap-8">
                <TestimonialElement
                    image={<UsersIconsWrapper>{renderUserImages()}</UsersIconsWrapper>}
                    text="+10 000 élèves satisfaits"
                />
                <DividerBuilder />
                <TestimonialElement
                    image={starsReview([true, true, true, true, false])}
                    text="Basé sur les retours authentiques"
                />
                <DividerBuilder />
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
