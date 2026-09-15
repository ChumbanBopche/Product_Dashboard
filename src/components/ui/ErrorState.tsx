interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border bg-white p-6 text-center">
      <p className="text-red-600">
        {message}
      </p>

      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Retry
      </button>
    </div>
  );
}