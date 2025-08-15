import { Metadata } from "next";
import { FAQSection } from "./(components)/faq-section";
import { AdditionalResources } from "./(components)/additional-resources";
import AnimationContainer from "@/components/animations/animation-container";

export default function SupportPage() {
  return (
    <section className="mx-auto px-4 py-20">
      <AnimationContainer delay={0.1} className="w-full">
        <div className="pb-12">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold font-heading text-center mt-6 !leading-tight">
            Support Center
          </h1>
          <p className="text-base md:text-lg mt-6 text-center text-muted-foreground">
            Find answers to common questions, or reach out to our support team
            for further assistance.
          </p>
        </div>
      </AnimationContainer>
      <div className="space-y-12">
        <FAQSection />
        <AdditionalResources />
      </div>
    </section>
  );
}
