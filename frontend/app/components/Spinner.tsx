import React from "react";
import clsx from "clsx";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const Spinner = ({ size = "md" }: SpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-4",
  };

  return (
    <div
      className={clsx(
        "rounded-full border-t-transparent border-blue-500 animate-spin",
        sizeClasses[size]
      )}
    />
  );
};

export default Spinner;