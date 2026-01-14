/* eslint-disable react/prop-types */

function Button({
  children,
  bgColor = "bg-app-primary",
  textColor = "text-white",
  className = "",
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={[
        "px-4 py-2 font-medium transition duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-app-primary/30",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        bgColor,
        textColor,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
