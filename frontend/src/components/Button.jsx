export default function Button({
  as: Component = "button",
  className = "",
  variant = "primary",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center cursor-pointer px-5 py-2.5 text-sm font-semibold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"

  const variants = {
    primary: "btn-primary hover:-translate-y-0.5 focus-visible:outline-[var(--accent)]",
    ghost: "btn-ghost hover:-translate-y-0.5 focus-visible:outline-[var(--accent)]",
  }

  return <Component className={`${base} ${variants[variant]} ${className}`} {...props} />
}
