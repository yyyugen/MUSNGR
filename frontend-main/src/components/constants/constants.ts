import { BarChart3Icon, HelpCircleIcon } from "lucide-react";

import { EnterIcon, UploadIcon } from "@radix-ui/react-icons";

export const NAV_LINKS = [
  {
    title: "Pricing",
    href: "/pricing",
  },
  {
    title: "Enterprise",
    href: "/enterprise",
  },
  {
    title: "Help",
    href: "/support",
  },
  {
    title: "Changelog",
    href: "/changelog",
  },
];

export const DEFAULT_AVATAR_URL =
  "https://api.dicebear.com/8.x/initials/svg?backgroundType=gradientLinear&backgroundRotation=0,360&seed=";

export const PAGINATION_LIMIT = 10;

export const COMPANIES = [
  {
    name: "Asana",
    logo: "/assets/company-01.svg",
  },
  {
    name: "Tidal",
    logo: "/assets/company-02.svg",
  },
  {
    name: "Innovaccer",
    logo: "/assets/company-03.svg",
  },
  {
    name: "Linear",
    logo: "/assets/company-04.svg",
  },
  {
    name: "Raycast",
    logo: "/assets/company-05.svg",
  },
  {
    name: "Labelbox",
    logo: "/assets/company-06.svg",
  },
] as const;

export const PROCESS = [
  {
    title: "Log in with Google",
    description:
      "Click on the 'Continue with Google' button to sign in using your Google account. This allows Musngr to connect to your YouTube account for uploading.",
    icon: EnterIcon,
  },
  {
    title: "Upload Audio File and an Image",
    description:
      "Combine an Audio File and an image to create a video. Musngr automatically processes the audio and image together to generate a YouTube-compatible file.",
    icon: UploadIcon,
  },
  {
    title: "Complete Upload and Go Live",
    description:
      "After combining the audio file and image, Musngr uploads the resulting video to your YouTube channel.",
    icon: BarChart3Icon,
  },
] as const;

export const REVIEWS = [
  {
    name: "Michael Smith",
    username: "@michaelsmith",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    rating: 5,
    review:
      "This tool is a lifesaver! Managing and tracking my links has never been easier. A must-have for anyone dealing with numerous links.",
  },
  {
    name: "Emily Johnson",
    username: "@emilyjohnson",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 4,
    review:
      "Very useful app! It has streamlined my workflow considerably. A few minor bugs, but overall a great experience.",
  },
  {
    name: "Daniel Williams",
    username: "@danielwilliams",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 5,
    review:
      "I've been using this app daily for months. The insights and analytics it provides are invaluable. Highly recommend it!",
  },
  {
    name: "Sophia Brown",
    username: "@sophiabrown",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    rating: 4,
    review:
      "This app is fantastic! It offers everything I need to manage my links efficiently.",
  },
  {
    name: "James Taylor",
    username: "@jamestaylor",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    rating: 5,
    review:
      "Absolutely love this app! It's intuitive and feature-rich. Has significantly improved how I manage and track links.",
  },
  {
    name: "Olivia Martinez",
    username: "@oliviamartinez",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 4,
    review:
      "Great app with a lot of potential. It has already saved me a lot of time. Looking forward to future updates and improvements.",
  },
  {
    name: "William Garcia",
    username: "@williamgarcia",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    rating: 5,
    review:
      "This app is a game-changer for link management. It's easy to use, extremely powerful and highly recommended!",
  },
  {
    name: "Mia Rodriguez",
    username: "@miarodriguez",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    rating: 4,
    review:
      "I've tried several link management tools, but this one stands out. It's simple, effective.",
  },
  {
    name: "Henry Lee",
    username: "@henrylee",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    rating: 5,
    review:
      "This app has transformed my workflow. Managing and analyzing links is now a breeze. I can't imagine working without it.",
  },
] as const;

export const FAQ = [
  {
    id: "item-1",
    question: "How do I upload a video?",
    answer:
      "To upload a video, go to the Upload page, select your audio file and image, fill in the required details, and click 'Create Video'. Make sure your files meet our size and format requirements.",
  },
  {
    id: "item-2",
    question: "What file formats are supported?",
    answer:
      "We support most common audio formats (AUDIO FILE, WAV, AAC) and image formats (JPG, PNG, GIF). For best results, use high-quality audio files and images with a 16:9 aspect ratio.",
  },
  {
    id: "item-3",
    question: "How long does it take to process a video?",
    answer:
      "Processing time varies depending on the length of your audio and the current server load. Most videos are processed within 5-15 minutes. You'll receive a notification when your video is ready.",
  },
  {
    id: "item-4",
    question: "Can I edit my video after uploading?",
    answer:
      "Once a video is created, you cannot edit the audio or image. However, you can update the title, description, and tags on YouTube after the video has been uploaded.",
  },
  {
    id: "item-5",
    question: "How do I connect my YouTube account?",
    answer:
      "Go to your Account Settings and click on 'Connect YouTube Account'. You'll be redirected to YouTube to grant permission. Once connected, you can choose to auto-publish your videos to YouTube.",
  },
];

export const PLANS = [
  {
    name: "Free",
    info: "For most individuals",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      { text: "Upload up to 5 videos/month" },
      { text: "15-minute maximum length" },
      { text: "720p/1080p resolution" },
      { text: "Basic analytics" },
      { text: "Single user account" },
      { text: "Email support" },
    ],
    btn: {
      text: "Start for free",
      href: "/auth/sign-up?plan=free",
      variant: "default",
    },
  },
  {
    name: "Pro",
    info: "For small businesses",
    price: {
      monthly: 9,
      yearly: Math.round(9 * 12 * (1 - 0.12)),
    },
    features: [
      { text: "Upload up to 50 videos/month" },
      { text: "1-hour maximum length" },
      { text: "Up to 4K resolution" },
      { text: "Scheduled uploads" },
      { text: "Advanced analytics" },
      { text: "Up to 3 team members" },
    ],
    btn: {
      text: "Get started",
      href: "/auth/sign-up?plan=pro",
      variant: "purple",
    },
  },
  {
    name: "Business",
    info: "For large organizations",
    price: {
      monthly: 49,
      yearly: Math.round(49 * 12 * (1 - 0.12)),
    },
    features: [
      { text: "Unlimited video uploads" },
      { text: "Unlimited video length" },
      { text: "Up to 8K resolution" },
      { text: "Bulk upload support" },
      { text: "Enterprise analytics" },
      { text: "Unlimited team members" },
    ],
    btn: {
      text: "Contact team",
      href: "/auth/sign-up?plan=business",
      variant: "default",
    },
  },
];

export const PRICING_FEATURES = [
  {
    text: "Shorten links",
    tooltip: "Create shortened links",
  },
  {
    text: "Track clicks",
    tooltip: "Track clicks on your links",
  },
  {
    text: "See top countries",
    tooltip: "See top countries where your links are clicked",
  },
  {
    text: "Upto 10 tags",
    tooltip: "Add upto 10 tags to your links",
  },
  {
    text: "Community support",
    tooltip: "Community support is available for free users",
  },
  {
    text: "Priority support",
    tooltip: "Get priority support from our team",
  },
  {
    text: "AI powered suggestions",
    tooltip: "Get AI powered suggestions for your links",
  },
];
