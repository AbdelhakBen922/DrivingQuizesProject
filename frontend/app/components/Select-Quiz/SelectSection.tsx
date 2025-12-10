import React, { useState } from "react";
import InputField from "../ui/InputField";
import DropdownField from "../ui/DropdownField";
import {  useNavigate } from "react-router";
type IconRowProps = {
    icon: string;
    title: string;
    subtitle: string;
};
type SelectionCardProps = {
    iconRow: IconRowProps;
    description: string;
    inputs: React.ReactNode[];
    button: string;
};
type QuizOptions ={
    carType: string;
    numQuestions:number;
}

const IconRow = ({ icon, title, subtitle }: IconRowProps) => {
    return (
        <div className="flex flex-row items-center gap-4 mb-2">
            {/* Icon circle */}
            <div className="w-13 h-13 rounded-full bg-primary-50 flex items-center justify-center">
                <img src={icon} alt="icon" className="w-6 h-6" />
            </div>

            {/* Texts */}
            <div className="flex flex-col">
                <h2 className="text-primary-800 font-bold text-2xl">{title}</h2>
                <p className="text-grey text-sm">{subtitle}</p>
            </div>
        </div>
    );
};

const SelectionCard = ({
    iconRow,
    description,
    inputs,
    button,
}: SelectionCardProps) => {
    const Navigate = useNavigate()
    return (
        <div className="bg-primary-25 w-full rounded-2xl p-8 flex flex-col gap-3 max-w-xl shadow-md ">
            <IconRow {...iconRow} />

            <p className="text-primary-600 text-base">{description}</p>

            <div className="flex flex-col gap-4">
                {inputs.map((input, index) => (
                    <div key={index}>{input}</div>
                ))}
            </div>
            {/* move to quiz/ route*/}
            <button className="btn-primary w-full" onClick={()=>{
                Navigate("/quiz/01", )
            }}>
                {button}
            </button>
        </div>
    );
};

const SelectSection = () => {
    const [QuizCode, setQuizCode] = useState("");
    const [QuizOptions, setQuizOptions] = useState<QuizOptions>({carType:"Voiture", numQuestions: 10});
    return (
        <section className="max-h-screen relative  z-0 flex flex-col bg-white justify-center items-center px-30">
            <h1 className="font-bold mt-12 mb-15 text-primary-600">
                Choisissez votre mode de quiz
            </h1>
            <div className="flex flex-col md:flex-row gap-7 h-fit">
                <SelectionCard
                    {...{
                        iconRow: {
                            icon: "/assets/icons/key.svg",
                            title: "Quiz avec Code",
                            subtitle: "Votre auto-école quiz",
                        },
                        description: "Ce mode est réservé aux élèves de l'auto-école. Veuillez entrer votre code d'accès pour commencer.",
                        inputs: [
                            <InputField
                                key={1}
                                label="Code d'accès"
                                type="text"
                                value={QuizCode}
                                placeholder="Entrez votre code"
                                onChange={setQuizCode }
                            />,
                        ],
                        button: "Valider",
                    }}
                />
                <SelectionCard
                    {...{
                        iconRow: {
                            icon: "/assets/icons/Car.svg",
                            title: "Mode Entraînement",
                            subtitle: "Pour s'exercer librement",
                        },
                        description: "Pratiquez à votre rythme en choisissant vos propres paramètres de quiz.",
                        inputs: [
                           <DropdownField
                                key={2}
                                label="Type de véhicule"
                                value={QuizOptions.carType}
                                options={["Voiture","Lourd"]}
                                placeholder="Voiture"
                                onChange={(value) => setQuizOptions((prev) => ({ ...prev, carType: value })) }
                            />,
                            <DropdownField
                                key={3}
                                label="Nombre de questions"
                                value={QuizOptions.numQuestions.toString()}
                                options={["5","10","15"]}
                                placeholder="10"
                                onChange={(value) => setQuizOptions((prev) => ({ ...prev, numQuestions: parseInt(value) })) }
                            />,
                        ],
                        button: "Lancer Le Quiz",
                    }}
                />
            </div>
        </section>
    );
};

export default SelectSection;
