import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/components/constants/constants";
import AnimationContainer from "@/components/animations/animation-container";

export default function FAQPage() {
  return (
    <section className="pb-32">
      <AnimationContainer delay={0.3}>
        <div className="mt-20 w-full">
          <div className="flex flex-col items-center justify-center w-full pt-12">
            <h2 className="mt-6 text-2xl font-semibold text-center lg:text-3xl xl:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="max-w-lg mt-6 text-center text-neutral-500">
              Here are some of the most common questions we get asked. If you
              have a question that isn&apos;t answered here, feel free to reach
              out to us.
            </p>
          </div>
          <div className="max-w-3xl mx-auto w-full mt-20">
            <Accordion type="single" collapsible>
              {FAQ.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </AnimationContainer>
    </section>
  );
}
