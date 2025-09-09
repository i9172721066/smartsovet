export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${className}`}
      {...props}
    />
  );
}

