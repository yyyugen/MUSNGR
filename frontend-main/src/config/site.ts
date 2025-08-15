import { FooterItem, SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "Musngr",
  description:
    "Turn your audio content into stunning videos effortlessly with Musngr. Simply upload your tracks, select visuals, and let our platform handle the video creation—no editing skills needed!",
  url: "https://musngr.com",
  ogImage: "https://musngr.com/opengraph-image.png",
  links: {
    twitter: "https://x.com/musngr",
    github: "https://github.com/musngr",
  },
};

export const navLinks = [
  {
    id: 1,
    title: "Pricing",
    href: "/pricing",
  },
  {
    id: 2,
    title: "Enterprise",
    href: "/enterprise",
  },
  {
    id: 3,
    title: "Help",
    href: "/support",
  },
  {
    id: 4,
    title: "Log in",
    href: "/signin",
  },
];

export const footerConfig = {
  footerNav: [
    {
      title: "Resources",
      items: [
        {
          title: "Why Musngr",
          href: "",
          external: true,
        },
        {
          title: "Community",
          href: "",
          external: true,
        },
        {
          title: "FAQ",
          href: "/faq",
          external: true,
        },
      ],
    },
    {
      title: "Help",
      items: [
        {
          title: "About",
          href: "/about",
          external: false,
        },
        {
          title: "Contact",
          href: "/contact",
          external: false,
        },
        {
          title: "Getting Started",
          href: "",
          external: false,
        },
      ],
    },
    {
      title: "Social",
      items: [
        {
          title: "Twitter",
          href: "https://twitter.com",
          external: true,
        },
        {
          title: "Facebook",
          href: "https://facebook.com",
          external: true,
        },
        {
          title: "YouTube",
          href: "https://youtube.com",
          external: true,
        },
      ],
    },
    {
      title: "Product",
      items: [
        {
          title: "Pricing",
          href: "/pricing",
          external: true,
        },
        {
          title: "Enterprise",
          href: "",
          external: true,
        },
      ],
    },
  ] satisfies FooterItem[],
};
