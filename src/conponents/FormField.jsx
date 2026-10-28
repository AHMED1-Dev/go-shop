function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  textarea = false,
  placeholder,
}) {
  const baseStyle =
    "w-full border rounded-xl px-4! py-3! bg-white text-sm outline-none transition focus:ring-2 focus:ring-main/20";
  const borderStyle = error
    ? "border-danger focus:border-danger"
    : "border-border focus:border-main";

  return (
    <div className="mb-4!">
      <label htmlFor={name} className="block text-sm font-semibold mb-1.5!">
        {label}
      </label>

      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={5}
          className={`${baseStyle} ${borderStyle} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseStyle} ${borderStyle}`}
        />
      )}

      {error && <p className="text-danger! text-xs mt-1!">{error}</p>}
    </div>
  );
}

export default FormField;
