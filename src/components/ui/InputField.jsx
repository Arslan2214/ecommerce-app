const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  name,
  className = ""
}) => {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`input input-bordered w-full ${error ? 'input-error' : ''} ${className}`}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default InputField; 