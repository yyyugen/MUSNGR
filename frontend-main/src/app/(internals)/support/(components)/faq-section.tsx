"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I upload a video?",
    answer:
      "To upload a video, go to the Upload page, select your audio file and image, fill in the required details, and click 'Create Video'. Make sure your files meet our size and format requirements.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "We support most common audio formats (AUDIO FILE, WAV, AAC) and image formats (JPG, PNG, GIF). For best results, use high-quality audio files and images with a 16:9 aspect ratio.",
  },
  {
    question: "How long does it take to process a video?",
    answer:
      "Processing time varies depending on the length of your audio and the current server load. Most videos are processed within 5-15 minutes. You'll receive a notification when your video is ready.",
  },
  {
    question: "Can I edit my video after uploading?",
    answer:
      "Once a video is created, you cannot edit the audio or image. However, you can update the title, description, and tags on YouTube after the video has been uploaded.",
  },
  {
    question: "How do I connect my YouTube account?",
    answer:
      "Go to your Account Settings and click on 'Connect YouTube Account'. You'll be redirected to YouTube to grant permission. Once connected, you can choose to auto-publish your videos to YouTube.",
  },
];

export function FAQSection() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
