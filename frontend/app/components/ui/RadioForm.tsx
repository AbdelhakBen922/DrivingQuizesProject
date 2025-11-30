
import { useState } from "react";
import RadioOption from "./RadioOption";

type RadioFormOption = {
  label: string;
  value: string;
  isCorrect: boolean;
};

type RadioFormProps = {
  options: RadioFormOption[];
  isConfirmed: boolean;
  onSelectionChange?: (selectedValue: string) => void;
};

const RadioForm = ({ options, isConfirmed, onSelectionChange }: RadioFormProps) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleChange = (value: string) => {
    if (!isConfirmed) {
      setSelectedValue(value);
      onSelectionChange?.(value);
    }
  };

  return (
    <div className="space-y-3 h-auto">
      {options.map((option) => (
        <RadioOption
          key={option.value}
          label={option.label}
          value={option.value}
          isConfirmed={isConfirmed}
          isTrue={option.isCorrect}
          isSelected={selectedValue === option.value}
          onChange={handleChange}
        />
      ))}
    </div>
  );
};

export default RadioForm;