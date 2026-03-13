export default function TextInput({
  label,
  id,
  type = "text",
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--muted)]">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        type={type}
        className={`input-field h-12 px-4 text-sm text-[var(--ink)] outline-none transition ${className}`}
        {...props}
      />
    </div>
  )
}
