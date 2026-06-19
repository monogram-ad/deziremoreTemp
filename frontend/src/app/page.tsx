import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import LeadPopup from "@/components/LeadPopup";

export default function HomePage() {
  return (
    <>
      <Hero />

      <main className="container mx-auto px-4">
        <CategoryGrid />
      </main>

      <LeadPopup />
    </>
  );
}