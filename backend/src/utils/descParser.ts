/**
 * Parses the `desc.txt` file that lives inside every product's asset
 * folder into structured metadata.
 *
 * Expected shape (see exts/struct.txt for the canonical example):
 *
 *   Name: Royal Silk Saree
 *   Price: 3499
 *   MRP: 4999
 *   Category: Sarees
 *   Color: Maroon
 *   Fabric: Silk
 *   Sizes: Free Size, S, M, L
 *
 *   Premium handcrafted silk saree suitable for weddings and festive
 *   occasions.
 *
 * Rules:
 *  - Leading lines matching `Key: value` are treated as metadata.
 *  - The first line that does NOT match `Key: value` ends the metadata
 *    block; everything from there to the end of the file (trimmed) is
 *    the free-text description.
 *  - Recognised keys are case-insensitive and accept a couple of common
 *    spelling variants (e.g. "Colour").
 *  - Missing/invalid numeric fields do not throw — they fall back to
 *    `null` and are reported in `warnings` so the sync job can log them
 *    without taking the whole catalog down because of one bad file.
 */

export interface ParsedProductMeta {
  name: string | null;
  price: number | null;
  mrp: number | null;
  fabric: string | null;
  color: string | null;
  sizes: string[];
  category: string | null;
  description: string;
  warnings: string[];
}

const KEY_LINE = /^([A-Za-z][A-Za-z ]{0,30}):\s*(.*)$/;

const KEY_ALIASES: Record<string, keyof Omit<ParsedProductMeta, "description" | "warnings">> = {
  name: "name",
  price: "price",
  mrp: "mrp",
  "m.r.p": "mrp",
  fabric: "fabric",
  material: "fabric",
  color: "color",
  colour: "color",
  sizes: "sizes",
  size: "sizes",
  category: "category",
};

function parseNumber(raw: string): number | null {
  // Strips currency symbols / commas so "₹3,499" and "3499" both parse.
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function parseProductDesc(raw: string): ParsedProductMeta {
  const warnings: string[] = [];

  const result: ParsedProductMeta = {
    name: null,
    price: null,
    mrp: null,
    fabric: null,
    color: null,
    sizes: [],
    category: null,
    description: "",
    warnings,
  };

  // Normalise line endings (desc.txt files are frequently authored on
  // Windows and checked in with CRLF endings).
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i].trim();

    // A blank line always ends the metadata block, even if more
    // "Key: value"-shaped lines follow further down (those belong to
    // the free-text description, e.g. "Care: hand wash only" written
    // as a sentence inside the description).
    if (line === "") {
      i++;
      break;
    }

    const match = line.match(KEY_LINE);
    if (!match) {
      // First non-metadata line: stop here, do not consume it — it is
      // part of the description.
      break;
    }

    const key = match[1].trim().toLowerCase();
    const value = match[2].trim();
    const field = KEY_ALIASES[key];

    if (!field) {
      // Unknown key — most likely the description starting with
      // something that happens to contain a colon. Stop parsing
      // metadata and let it fall through to the description.
      break;
    }

    switch (field) {
      case "price":
      case "mrp": {
        const num = parseNumber(value);
        if (num === null) {
          warnings.push(`Could not parse numeric value for "${match[1]}": "${value}"`);
        }
        result[field] = num;
        break;
      }
      case "sizes": {
        result.sizes = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      }
      default: {
        result[field] = value || null;
      }
    }
  }

  result.description = lines.slice(i).join("\n").trim();

  if (!result.description) {
    warnings.push("No description text found after metadata block.");
  }

  return result;
}
