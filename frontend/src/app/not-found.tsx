import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center">
        <h1 className="text-8xl font-heading text-primary">
          404
        </h1>

        <h2 className="text-4xl font-heading mt-4">
          Page Not Found
        </h2>

        <p className="mt-4 text-gray-600">
          The page you are looking for does not exist.
        </p>

        <Link
          href="/"
          className="btn-primary inline-block mt-8"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}