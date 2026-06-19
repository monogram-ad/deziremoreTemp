"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="luxury-card p-8 max-w-lg text-center">
        <h1 className="text-5xl font-heading text-primary">
          Something Went Wrong
        </h1>

        <p className="mt-4 text-gray-600">
          An unexpected error occurred while loading this page.
        </p>

        <button
          onClick={reset}
          className="btn-primary mt-6"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}