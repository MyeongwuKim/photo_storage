import { inputTheme } from "@/hooks/useFlowTheme";
import { TextInput } from "flowbite-react";
import {
  ChangeEventHandler,
  DetailedHTMLProps,
  FC,
  InputHTMLAttributes,
  forwardRef,
} from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextBoxProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  register?: UseFormRegisterReturn;
}

export const InputField: FC<TextBoxProps> = forwardRef((props, ref) => {
  return (
    <TextInput
      autoComplete="off"
      theme={inputTheme}
      {...props}
      ref={ref}
      type="text"
      sizing="sm"
      className="w-full h-full"
    />
  );
});

InputField.displayName = "InputField";

export default InputField;
