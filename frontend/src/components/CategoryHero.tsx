interface CategoryHeroProps {
  title: string;
  description?: string;
  image?: string;
}

export default function CategoryHero({
  title,
  description,
  image,
}: CategoryHeroProps) {
  return (
    <section className="relative mb-10">
      <div className="relative overflow-hidden rounded-3xl luxury-card">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-[300px] md:h-[420px] object-cover"
          />
        ) : (
          <div className="h-[300px] md:h-[420px] gold-gradient" />
        )}

        <div className="absolute inset-0 bg-black/35 flex items-center">
          <div className="px-8 md:px-16 text-white">
            <h1 className="text-5xl md:text-7xl font-heading">
              {title}
            </h1>

            {description && (
              <p className="mt-4 max-w-2xl text-lg">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}