import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Portfolio from "@/components/sections/Portfolio";
import NicheExamples from "@/components/sections/NicheExamples";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import { StructuredData } from "@/components/seo/StructuredData";

export default function HomePage() {
  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <StructuredData type="localBusiness" />
      <Hero />
      <Services />
      <WhyChooseUs />
      <Portfolio />
      <NicheExamples />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
