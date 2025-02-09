interface LoadingButtonProps {
  onClick: () => void;
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}

export const LoadingButton = ({
  onClick,
  loading,
  children,
  className = "",
}: LoadingButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
        loading
          ? "bg-pink-200 cursor-not-allowed"
          : "bg-pink-500 hover:bg-pink-600"
      } text-white ${className}`}
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <span className="animate-spin mr-2">🌸</span>
          Thinking...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
