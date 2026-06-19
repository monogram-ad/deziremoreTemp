interface ProductDescriptionProps {
  title: string;
  description: string;
  fabric?: string;
  color?: string;
  sizes?: string[];
}

export default function ProductDescription({
  title,
  description,
  fabric,
  color,
  sizes,
}: ProductDescriptionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-5xl font-heading">
          {title}
        </h1>
      </div>

      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap text-gray-700">
          {description}
        </p>
      </div>

      {(fabric || color || sizes?.length) && (
        <div className="luxury-card p-5">
          <h3 className="text-2xl font-heading mb-4">
            Product Details
          </h3>

          <div className="space-y-2">
            {fabric && (
              <p>
                <strong>Fabric:</strong>{" "}
                {fabric}
              </p>
            )}

            {color && (
              <p>
                <strong>Color:</strong>{" "}
                {color}
              </p>
            )}

            {sizes?.length ? (
              <p>
                <strong>Sizes:</strong>{" "}
                {sizes.join(", ")}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}