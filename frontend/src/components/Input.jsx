/* eslint-disable react/prop-types */
import React, { useId } from "react";

const Input = React.forwardRef(function Input(
  { label, type = "text", className = "", ...props },
  ref
) {
  const id = useId();

  return (
    <div className="w-full">
      {label && (
        <label
          className="inline-block mb-1 pl-1 text-sm font-medium text-app-text"
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <input
        id={id}
        ref={ref}
        type={type}
        className={[
          "w-full rounded-md border border-app-border bg-white px-3 py-2 text-app-text",
          "outline-none focus:border-app-primary focus:ring-2 focus:ring-app-primary/20",
          "transition duration-200",
          className,
        ].join(" ")}
        {...props}
      />
    </div>
  );
});

export default Input;
