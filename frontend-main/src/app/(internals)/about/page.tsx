import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, ArrowRightIcon, Timer, Phone } from "lucide-react";
import { LampContainer } from "@/components/ui/lamp";
import MaxWidthWrapper from "@/components/global/max-width-wrapper";
import AnimationContainer from "@/components/animations/animation-container";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center mb-12">
        <AnimationContainer delay={0.1}>
          <h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center w-full">
            About Us
          </h1>
        </AnimationContainer>
      </div>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold mb-2">100K+</div>
            <p className="text-muted-foreground">Active Creators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold mb-2">50M+</div>
            <p className="text-muted-foreground">Monthly Listeners</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold mb-2">1M+</div>
            <p className="text-muted-foreground">Tracks Created</p>
          </CardContent>
        </Card>
      </section>

      {/* Mission Section */}
      <section className="mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              To empower artists and creators by providing a seamless platform
              to share their music with the world. We strive to simplify the
              journy from inspiration to audience, helping you connect, grow,
              and thrive in the digital landscape.
            </p>
            <ul className="space-y-4">
              {[
                "Allowing artists to share their music effortlessly.",
                "Simplify the process of uploading music to YouTube.",
                "Help creators connect with a global audience.",
                "Provide tools to enhance reach and visibility.",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-square">
            <Image
              src="./svg/placeholder-4.svg"
              alt="Studio setup"
              fill
              className="object-cover rounded-lg w-[600px] h-[600px]"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Musngr
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community-Driven</h3>
              <p className="text-muted-foreground">
                Connect with like-minded creators and build your audience in a
                supportive environment.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Timer className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                TIme-Saving Automation
              </h3>
              <p className="text-muted-foreground">
                Automatically generate videos, optimize metadata, and schedule
                uploads for maximun efficiency.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Phone className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Reliable Support:</h3>
              <p className="text-muted-foreground">
                Dedicated customer support to assist with any issues or
                questions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <MaxWidthWrapper className="mt-20 max-w-[100vw] overflow-x-hidden scrollbar-hide">
        <AnimationContainer delay={0.1}>
          <LampContainer>
            <div className="flex flex-col items-center justify-center relative w-full text-center">
              <h2 className="bg-gradient-to-b from-neutral-200 to-neutral-400 py-4 bg-clip-text text-center text-4xl md:text-7xl !leading-[1.15] font-medium font-heading tracking-tight text-transparent mt-8">
                Ready to Start Creating?
              </h2>
              <p className="text-muted-foreground mt-6 max-w-md mx-auto">
                Join thousands of creators who are already using Musngr to bring
                their vision to life.
              </p>
              <div className="mt-6">
                <Button>
                  <Link
                    href="/signup"
                    className="flex justify-center items-center"
                  >
                    Get started for free
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </LampContainer>
        </AnimationContainer>
      </MaxWidthWrapper>
    </div>
  );
}
