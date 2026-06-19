import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function EmptyState({
  title,
  description,
  buttonText,
  buttonLink,
}: EmptyStateProps) {
  return (
    <div className="luxury-card p-10 text-center">
      <h2 className="text-3xl font-heading">
        {title}
      </h2>

      <p className="mt-3 text-gray-600">
        {description}
      </p>

      {buttonText && buttonLink && (
        <Link
          href={buttonLink}
          className="btn-primary inline-block mt-6"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}