// export default function Button({
//   as: Component = "button",
//   className = "",
//   variant = "primary",
//   ...props
// }) {
//   const base =
//     "inline-flex items-center justify-center cursor-pointer px-5 py-2.5 text-sm font-semibold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"

//   const variants = {
//     primary:
//       "btn-primary hover:-translate-y-0.5 focus-visible:outline-[var(--accent)]",
//     ghost:
//       "btn-ghost hover:-translate-y-0.5 focus-visible:outline-[var(--accent)]",
//   }

//   return (
//     <Component className={`${base} ${variants[variant]} ${className}`} {...props} />
//   )
// }









import React from 'react';

export default function Button({
  // eslint-disable-next-line no-unused-vars
  as: Component = "button", 
  className = "",
  variant = "primary",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center cursor-pointer px-5 py-2.5 text-sm font-semibold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 hover:-translate-y-0.5",
  };

  return (
    <Component 
      className={`${base} ${variants[variant] || variants.primary} ${className}`} 
      {...props}
    >
      {children}
    </Component>
  );
}