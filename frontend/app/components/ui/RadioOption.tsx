import { useEffect, useState } from "react";

type RadioOptionProps = {
  label: string;
  value: string;
  isConfirmed: boolean;
  isTrue: boolean;
  isSelected: boolean;
  onChange: (value: string) => void;
};

const RadioOption = ({ label, value, isConfirmed, isTrue, isSelected, onChange }: RadioOptionProps) => {
    const [colorStyle, setColorStyle] = useState('bg-white border-grey text-primary-800');
    
    useEffect(() => {
        if (isConfirmed) {
            if (isTrue) {
                setColorStyle('bg-green border-green text-white');
            } else if (isSelected) {
                setColorStyle('bg-red border-red text-white');
            } else {
                setColorStyle('bg-white border-grey text-primary-800');
            }
        } else {
            if (isSelected) {
                setColorStyle('bg-primary-300 border-primary-500 text-white');
            } else {
                setColorStyle('bg-white border-grey text-primary-800');
            }
        }
    }, [isConfirmed, isTrue, isSelected]);
  return (
    <div
      className={`
        flex items-center border-1 rounded-xl p-3 cursor-pointer
        ${colorStyle}
      `}
      onClick={() => {
        if (!isConfirmed) {
          onChange(value);
        }
      }}
    >
      {/* Custom Radio Button */}
      <div className="mr-3 flex items-center justify-center w-5 h-5 rounded-full border-2 border-white">
        {isSelected && (
          <div className="w-2.5 h-2.5 rounded-full bg-white " />
        )}
      </div>
      <label className="text-base cursor-pointer">{label}</label>
    </div>

  )
}

export default RadioOption