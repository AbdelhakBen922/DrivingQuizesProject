import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface QuizTimerProps {
    durationSec: number | null;
    onTimeExpired: () => void;
    isActive: boolean;
}

const QuizTimer = ({ durationSec, onTimeExpired, isActive }: QuizTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(durationSec || 0);

    useEffect(() => {
        setTimeLeft(durationSec || 0);
    }, [durationSec]);

    useEffect(() => {
        if (!isActive || !timeLeft) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onTimeExpired();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, timeLeft, onTimeExpired]);

    if (!durationSec) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isLowTime = timeLeft <= 30;

    return (
        <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                isLowTime ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
            }`}
        >
            <Clock size={20} />
            <span className="text-lg">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
        </div>
    );
};

export default QuizTimer;
