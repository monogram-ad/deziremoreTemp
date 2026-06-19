interface SectionTitleProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

export default function SectionTitle({
  title,
  subtitle,
  center = false,
}: SectionTitleProps) {
  return (
    <div
      className={`mb-10 ${
        center ? "text-center" : ""
      }`}
    >
      <h2 className="text-4xl md:text-5xl font-heading">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-3 text-gray-600 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}