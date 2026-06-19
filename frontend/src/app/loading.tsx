export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />

        <h2 className="mt-6 text-3xl font-heading">
          Loading...
        </h2>

        <p className="text-gray-500 mt-2">
          Preparing your shopping experience
        </p>
      </div>
    </div>
  );
}