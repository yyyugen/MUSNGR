"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Fingerprint, LucideIcon } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { MobileNavbar } from "./mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { NAV_LINKS } from "@/components/constants/constants";
import MaxWidthWrapper from "@/components/global/max-width-wrapper";
import AnimationContainer from "@/components/animations/animation-container";

const Navbar = () => {
  const user = false;

  const [scroll, setScroll] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 8) {
      setScroll(true);
    } else {
      setScroll(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 inset-x-0 h-14 w-full border-b border-transparent z-[99999] select-none",
        scroll && "border-background/80 bg-background/40 backdrop-blur-md"
      )}
    >
      <AnimationContainer reverse delay={0.1} className="size-full">
        <MaxWidthWrapper className="flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link href="/">
              <span className="text-lg font-bold font-heading !leading-none">
                {siteConfig.name}
              </span>
            </Link>

            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                {NAV_LINKS.map((link) => (
                  <NavigationMenuItem key={link.title}>
                    <Link href={link.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        {link.title}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden lg:flex items-center">
            {user ? (
              <div className="flex items-center">
                <Link
                  href="/dashboard"
                  className={buttonVariants({ size: "sm" })}
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-x-4">
                <Link
                  href="/signin"
                  rel="noopener noreferrer"
                  className="py-2 px-5 text-sm font-medium flex items-center gap-x-2 hover:opacity-80 transition-opacity"
                >
                  <Fingerprint size={15} className="mr-2" />
                  <span>Log in</span>
                </Link>

                <Link
                  href="/signup"
                  rel="noopener noreferrer"
                  className="py-2 px-5 text-sm font-medium bg-white rounded-full border border-gray-200 dark:bg-background dark:border-gray-600 flex items-center hover:opacity-80 transition-opacity"
                >
                  <span>Start your trial</span>
                </Link>
              </div>
            )}
          </div>

          <MobileNavbar />
        </MaxWidthWrapper>
      </AnimationContainer>
    </header>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; icon: LucideIcon }
>(({ className, title, href, icon: Icon, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href!}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-100 ease-out hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center space-x-2 text-neutral-300">
            <Icon className="h-4 w-4" />
            <h6 className="text-sm font-medium !leading-none">{title}</h6>
          </div>
          <p
            title={children! as string}
            className="line-clamp-1 text-sm leading-snug text-muted-foreground"
          >
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Navbar;
