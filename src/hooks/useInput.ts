import { useState, ChangeEvent } from "react";

interface ValidationOptions {
  isRequired?: boolean;
  minLength?: number;
  maxLength?: number;
  type?: string;
  reference?: string;
  referenceName?: string;
}

const useInput = (
  initialValue: string,
  id: string,
  label: string,
  validation: ValidationOptions,
  type?: string
) => {
  const [value, setValue] = useState<string>(initialValue);
  const [error, setError] = useState("");

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setError("");
  };

  const isValid = () => {
    let newError = "";

    // Check if passwords match
    if (validation.type === "equal") {
      if (value !== validation.reference) {
        newError = `Does not match ${validation.referenceName}`;
      }
    }

    // Check for valid email
    if (validation.type === "email") {
      if (!/^\S+@\w+\.\S+$/.test(value)) {
        newError = "Invalid email";
      }
    }

    // Check if input has its minLength
    if (validation.minLength) {
      if (value.length < validation.minLength) {
        newError = `Minimum length is ${validation.minLength}`;
      }
    }

    // Check if input exceed its maxLength
    if (validation.maxLength) {
      if (value.length > validation.maxLength) {
        newError = `Maximum length is ${validation.maxLength}`;
      }
    }

    // Check if input is required
    if (validation.isRequired && value === "") {
      newError = `${label} is required`;
    }

    if (newError.length) {
      setError(newError);
      return false;
    }
    return true;
  };
  return {
    value,
    id,
    label,
    error,
    isRequired: validation.isRequired,
    type,
    onChange,
    isValid,
    setError,
    setValue,
  };
};

export default useInput;
