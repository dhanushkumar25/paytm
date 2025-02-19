export function Button({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-blue-600 transition duration-200"
    >
      {label}
    </button>
  );
}
