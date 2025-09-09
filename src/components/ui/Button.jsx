export default function Button({
  as: Tag = "button",
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  const styles = {
    primary:
      "inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-600",
    secondary:
      "inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-gray-900 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100",
    ghost:
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-indigo-700 hover:bg-indigo-50 disabled:text-gray-400",
  };

  return (
    <Tag
      className={`${styles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
