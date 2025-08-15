import { Cpu, Mic, Palette, Plane, UsersRound, Wrench } from "lucide-react";

export const FEATURES = [
  {
    title: "Fast uploads",
    description: "Upload an audio file to YouTube in 3 seconds.",
    img: "./svg/placeholder-5.svg",
    icon: <Cpu className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Trusted",
    description:
      "Operating since 2011, with 35,000,000 uploads from more than 1,500,000 users.",
    img: "./svg/placeholder-2.svg",
    icon: <UsersRound className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "No transcoding",
    description: "Your audio is unaltered, so there is no loss of quality.",
    img: "./svg/placeholder-4.svg",
    icon: <Mic className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Simple",
    description: "Clean design and clear workflow makes Musngr easy to use.",
    img: "./svg/placeholder-1.svg",
    icon: <Palette className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Feature rich",
    description: "Loaded with extra features for the ideal user experience.",
    img: "./svg/placeholder-3.svg",
    icon: <Plane className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Quick",
    description:
      "Render videos significantly faster than with tools such as Adobe Premiere Pro, Final Cut Pro, etc.",
    img: "./svg/placeholder-6.svg",
    icon: <Wrench className="h-4 w-4 text-neutral-500" />,
  },
];
