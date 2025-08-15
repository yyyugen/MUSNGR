"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLANS } from "./constants/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tab = "monthly" | "yearly";

const PricingCards = () => {
  const MotionTabTrigger = motion(TabsTrigger);

  const [activeTab, setActiveTab] = useState<Tab>("monthly");

  return (
    <Tabs
      defaultValue="monthly"
      className="w-full flex flex-col items-center justify-center"
    >
      <TabsList>
        <MotionTabTrigger
          value="monthly"
          onClick={() => setActiveTab("monthly")}
          className="relative"
        >
          {activeTab === "monthly" && (
            <motion.div
              layoutId="active-tab-indicator"
              transition={{
                type: "spring",
                bounce: 0.5,
              }}
              className="absolute top-0 left-0 w-full h-full bg-background shadow-sm rounded-md z-10"
            />
          )}
          <span className="z-20">Monthly</span>
        </MotionTabTrigger>
        <MotionTabTrigger
          value="yearly"
          onClick={() => setActiveTab("yearly")}
          className="relative"
        >
          {activeTab === "yearly" && (
            <motion.div
              layoutId="active-tab-indicator"
              transition={{
                type: "spring",
                bounce: 0.5,
              }}
              className="absolute top-0 left-0 w-full h-full bg-background shadow-sm rounded-md z-10"
            />
          )}
          <span className="z-20">Yearly</span>
        </MotionTabTrigger>
      </TabsList>

      <TabsContent
        value="monthly"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full md:gap-8 flex-wrap max-w-5xl mx-auto pt-6"
      >
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "flex flex-col w-full border-border rounded-xl",
              plan.name === "Pro" && "border-2 border-gray-500"
            )}
          >
            <CardHeader
              className={cn(
                "border-b border-border",
                plan.name === "Pro"
                  ? "bg-gray-500/[0.07]"
                  : "bg-foreground/[0.03]"
              )}
            >
              <CardTitle
                className={cn(
                  plan.name !== "Pro" && "text-muted-foreground",
                  "text-lg font-medium"
                )}
              >
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.info}</CardDescription>
              <h5 className="text-3xl font-semibold">
                ${plan.price.monthly}
                <span className="text-base text-muted-foreground font-normal">
                  {plan.name !== "Free" ? "/month" : ""}
                </span>
              </h5>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircleIcon className="text-gray-500 w-4 h-4" />
                  {feature.text}
                </div>
              ))}
            </CardContent>
            <CardFooter className="w-full mt-auto">
              <Link
                href={plan.btn.href}
                style={{ width: "100%" }}
                className={buttonVariants({
                  className: plan.name === "Pro" && "",
                })}
              >
                {plan.btn.text}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </TabsContent>
      <TabsContent
        value="yearly"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full md:gap-8 flex-wrap max-w-5xl mx-auto pt-6"
      >
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "flex flex-col w-full border-border rounded-xl",
              plan.name === "Pro" && "border-2 border-gray-500"
            )}
          >
            <CardHeader
              className={cn(
                "border-b border-border",
                plan.name === "Pro"
                  ? "bg-gray-500/[0.07]"
                  : "bg-foreground/[0.03]"
              )}
            >
              <CardTitle
                className={cn(
                  plan.name !== "Pro" && "text-muted-foreground",
                  "text-lg font-medium"
                )}
              >
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.info}</CardDescription>
              <h5 className="text-3xl font-semibold flex items-end">
                ${plan.price.yearly}
                <div className="text-base text-muted-foreground font-normal">
                  {plan.name !== "Free" ? "/year" : ""}
                </div>
                {plan.name !== "Free" && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, type: "spring", bounce: 0.25 }}
                    className="px-2 py-0.5 ml-2 rounded-md bg-gray-500 text-foreground text-sm font-medium"
                  >
                    -12%
                  </motion.span>
                )}
              </h5>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircleIcon className="text-gray-500 w-4 h-4" />
                  {feature.text}
                </div>
              ))}
            </CardContent>
            <CardFooter className="w-full pt- mt-auto">
              <Link
                href={plan.btn.href}
                style={{ width: "100%" }}
                className={buttonVariants({
                  className: plan.name === "Pro" && "",
                })}
              >
                {plan.btn.text}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default PricingCards;
