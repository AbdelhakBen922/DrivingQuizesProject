import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InputField from "../ui/InputField";
import DropdownField from "../ui/DropdownField";
import { useNavigate } from "react-router";
import * as api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

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
    onSubmit?: () => void;
};
type QuizOptions = {
    carType: string;
    numQuestions: number;
};

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
    onSubmit,
}: SelectionCardProps) => {
    const Navigate = useNavigate()
    
    const handleClick = () => {
        if (onSubmit) {
            onSubmit();
        } else {
            Navigate("/quiz/01");
        }
    };
    
    return (
        <div className="bg-primary-25 w-full rounded-2xl p-8 flex flex-col gap-3 max-w-xl shadow-md ">
            <IconRow {...iconRow} />

            <p className="text-primary-600 text-base">{description}</p>

            <div className="flex flex-col gap-4">
                {inputs.map((input, index) => (
                    <div key={index}>{input}</div>
                ))}
            </div>
            <button className="btn-primary w-full" onClick={handleClick}>
                {button}
            </button>
        </div>
    );
};

const SelectSection = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const [QuizCode, setQuizCode] = useState("");
    const [QuizOptions, setQuizOptions] = useState<QuizOptions>({ carType: t('selectQuiz.carType.car', 'Voiture'), numQuestions: 10 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCodeEntry = async () => {
        if (!QuizCode.trim()) {
            setError(t('selectQuiz.errors.enterCode', 'Veuillez entrer un code'));
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Try quick entry with student code
            await api.quickCodeEntry(QuizCode.trim());
            setAuth({ type: "guest", studentCode: QuizCode.trim() });
            navigate("/student/dashboard");
        } catch (err: any) {
            // If password required, redirect to login with code pre-filled
            localStorage.setItem("pendingStudentCode", QuizCode.trim());
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-h-screen relative  z-0 flex flex-col bg-white justify-center items-center px-30">
            <h1 className="font-bold mt-12 mb-15 text-primary-600">
                {t('selectQuiz.title', 'Choisissez votre mode de quiz')}
            </h1>
            <div className="flex flex-col md:flex-row gap-7 h-fit">
                <SelectionCard
                    {...{
                        iconRow: {
                            icon: "/assets/icons/key.svg",
                            title: t('selectQuiz.withCode.title', 'Quiz avec Code'),
                            subtitle: t('selectQuiz.withCode.subtitle', 'Votre auto-école quiz'),
                        },
                        description: t('selectQuiz.withCode.description', 'Ce mode est réservé aux élèves de l\'auto-école. Veuillez entrer votre code d\'accès pour commencer.'),
                        inputs: [
                            <InputField
                                key={1}
                                label={t('selectQuiz.withCode.codeLabel', 'Code d\'accès')}
                                type="text"
                                value={QuizCode}
                                placeholder={t('selectQuiz.withCode.codePlaceholder', 'Entrez votre code')}
                                onChange={setQuizCode}
                            />,
                        ],
                        button: loading ? t('common.loading', 'Chargement...') : t('common.validate', 'Valider'),
                        onSubmit: handleCodeEntry,
                    }}
                />
                <SelectionCard
                    {...{
                        iconRow: {
                            icon: "/assets/icons/Car.svg",
                            title: t('selectQuiz.practice.title', 'Mode Entraînement'),
                            subtitle: t('selectQuiz.practice.subtitle', 'Pour s\'exercer librement'),
                        },
                        description: t('selectQuiz.practice.description', 'Pratiquez à votre rythme en choisissant vos propres paramètres de quiz.'),
                        inputs: [
                            <DropdownField
                                key={2}
                                label={t('selectQuiz.practice.vehicleType', 'Type de véhicule')}
                                value={QuizOptions.carType}
                                options={[t('selectQuiz.carType.car', 'Voiture'), t('selectQuiz.carType.heavy', 'Lourd')]}
                                placeholder={t('selectQuiz.carType.car', 'Voiture')}
                                onChange={(value) => setQuizOptions((prev) => ({ ...prev, carType: value }))}
                            />,
                            <DropdownField
                                key={3}
                                label={t('selectQuiz.practice.questionCount', 'Nombre de questions')}
                                value={QuizOptions.numQuestions.toString()}
                                options={["5", "10", "15"]}
                                placeholder="10"
                                onChange={(value) => setQuizOptions((prev) => ({ ...prev, numQuestions: parseInt(value) }))}
                            />,
                        ],
                        button: t('selectQuiz.practice.startButton', 'Lancer Le Quiz'),
                    }}
                />
            </div>
        </section>
    );
};

export default SelectSection;
