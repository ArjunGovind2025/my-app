import React from "react";
import clsx from "clsx";

// Define variant styles for typography
const typographyVariants = {
  h1: "text-4xl font-bold leading-tight",
  h2: "text-3xl font-semibold leading-snug",
  h3: "text-2xl font-medium leading-normal",
  body: "text-base leading-relaxed",
  caption: "text-sm text-gray-500 leading-tight",
};

// Typography component
const Typography = ({ variant = "body", className, children, ...props }) => {
  const variantClass = typographyVariants[variant] || typographyVariants.body;

  return (
    <p className={clsx(variantClass, className)} {...props}>
      {children}
    </p>
  );
};

export { Typography }
