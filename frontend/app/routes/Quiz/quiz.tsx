import { useState } from "react";
import RadioForm from "../../components/ui/RadioForm";
import NavBar from "~/components/NavBar";
import QuizProgressBar from "~/components/Quiz/QuizProgressBar";

const Quiz = () => {
    const [selectedOption, setSelectedOption] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const selectOption = (value: string) => {
        console.log("Selected option:", value);
        setSelectedOption(value);
    }
    const [question, setQuestion] = useState("À quoi correspond ce panneau ?");
    const [currentQuestion, setCurrentQuestion] = useState(10);
    const [totalQuestions, setTotalQuestions] = useState(20);

    // Check if the selected option is correct
    const options = [
        { label: "Cédez le passage", value: "option1", isCorrect: false },
        { label: "Route prioritaire", value: "option2", isCorrect: false },
        { label: "Rond-point", value: "option3", isCorrect: true },
        { label: "Interdiction de tourner à gauche", value: "option4", isCorrect: false },
    ];
    
    const isCorrect = isConfirmed && options.find(opt => opt.value === selectedOption)?.isCorrect;
    const isFailed = isConfirmed && !isCorrect;

    // Determine colors based on result
    const bgColor = isCorrect ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-primary-50";
    const progressColor = isCorrect ? "bg-green" : isFailed ? "bg-red" : "bg-primary-500";

    return (
        <div className="min-h-screen flex flex-col ">
            <NavBar dark={false} />
            
            {/* Progress Bar Section */}
            <QuizProgressBar 
                currentQuestion={currentQuestion}
                totalQuestions={totalQuestions}
                progressColor={progressColor}
                onBack={() => console.log("Back clicked")}
                onFlag={() => console.log("Flag clicked")}
                onMenu={() => console.log("Menu clicked")}
            />

            {/* Main Content */}
            <div className="flex-1 flex items-start justify-center px-4 pb-8">
                <div className="w-full max-w-4xl">
                    {/* Card Container */}
                    <div className={`${bgColor} rounded-3xl px-18 py-8 shadow-md transition-colors duration-300`}>
                        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                            {/* Question and Options Section */}
                            <div className="flex-1 w-full flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <h3 className=" font-semibold text-primary-800">{question}</h3>
                                    <p className="text-xs text-red">*obligatoire</p>
                                </div>
                                <RadioForm
                                    options={options}
                                    isConfirmed={isConfirmed}
                                    onSelectionChange={selectOption}
                                />
                            </div>
                            
                            {/* Image Section */}
                            <div className="flex-1 w-full flex items-start justify-center lg:justify-end">
                                <div className="relative w-full h-full flex items-start overflow-hidden rounded-2xl">
                                    <img 
                                        src="/assets/images/roundabout.png" 
                                        alt="Traffic sign" 
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                    {/* Zoom Button - positioned inside the image, clipped by border radius */}
                                    <button className={`absolute bottom-0 right-0 p-3 ${progressColor} text-white transition-colors rounded-tl-2xl ${progressColor === 'bg-green' ? 'hover:bg-green-700' : progressColor === 'bg-red' ? 'hover:bg-red-700' : 'hover:bg-primary-600'} cursor-pointer `}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Confirm Button */}
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={() => setIsConfirmed(true)}
                                className={`px-6 py-2.5 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    progressColor === 'bg-green' ? 'bg-green hover:bg-green-700' : 
                                    progressColor === 'bg-red' ? 'bg-red hover:bg-red-700' : 
                                    'bg-primary-500 hover:bg-primary-600'
                                }`}
                                disabled={!selectedOption}
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Quiz