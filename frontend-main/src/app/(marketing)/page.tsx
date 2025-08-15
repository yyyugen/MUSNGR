import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon, StarIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MagicCard from "@/components/ui/magic-card";
import MagicBadge from "@/components/ui/magic-badge";
import { LampContainer } from "@/components/ui/lamp";
import { FEATURES } from "@/components/marketing/features";
import MaxWidthWrapper from "@/components/global/max-width-wrapper";
import { PROCESS, REVIEWS } from "@/components/constants/constants";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import AnimationContainer from "@/components/animations/animation-container";

export default async function Marketing() {
  const user = {};

  return (
    <section className="overflow-x-hidden scrollbar-hide size-full">
      {/* Hero Section */}
      <MaxWidthWrapper>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[radial-gradient(hsl(var(--accent-foreground)/0.1)_1px,transparent_1px)] [background-size:8px_8px] [mask-image:radial-gradient(ellipse_60%_60%_at_center,#000_0%,transparent_80%)]"></div>
        <section className="flex flex-col items-center justify-center w-full text-center bg-gradient-to-t from-background pt-20">
          <AnimationContainer className="flex flex-col items-center justify-center w-full text-center">
            <button className="group relative grid overflow-hidden rounded-full px-4 py-1 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200">
              <span>
                <span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
              </span>
              <span className="backdrop absolute inset-[1px] rounded-full bg-neutral-950 transition-colors duration-200 group-hover:bg-neutral-900" />
              <span className="h-full w-full blur-md absolute bottom-0 inset-x-0 bg-gradient-to-tr from-primary/20"></span>
              <span className="z-10 py-0.5 text-sm text-neutral-100 flex items-center justify-center gap-1">
                ✨ How to create superior products
                <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </span>
            </button>
            <h1 className="text-foreground text-center py-6 text-5xl font-medium tracking-normal text-balance sm:text-6xl md:text-7xl lg:text-8xl !leading-[1.15] w-full font-heading">
              Turn your music into YouTube gold - effortlessly.
            </h1>
            <p className="mb-12 text-lg tracking-tight text-muted-foreground md:text-xl text-balance">
              Musngr makes it easy to create captivating videos from your audio
              content.
              <br className="hidden md:block" />
              <span className="hidden md:block">
                Upload your tracks, choose your visuals, and let our platform do
                the rest. No video editing experience required.
              </span>
            </p>
            <div className="flex items-center justify-center whitespace-nowrap gap-4 z-50">
              <Button asChild className="bg-white hover:bg-gray-100">
                <Link
                  href={user ? "/dashboard" : "/auth/sign-in"}
                  className="flex items-center !text-black hover:!text-black"
                >
                  Try Musngr Today
                  <ArrowRightIcon className="w-4 h-4 ml-2 !text-black" />
                </Link>
              </Button>
            </div>
          </AnimationContainer>

          <AnimationContainer
            delay={0.2}
            className="relative pt-20 pb-20 md:py-32 px-2 bg-transparent w-full"
          >
            <div className="absolute md:top-[10%] left-1/2 gradient w-3/4 -translate-x-1/2 h-1/4 md:h-1/3 inset-0 blur-[5rem] animate-image-glow"></div>
            <div className="-m-2 rounded-xl p-2 ring-1 ring-inset ring-foreground/20 lg:-m-4 lg:rounded-2xl bg-opacity-50 backdrop-blur-3xl">
              <Image
                src="/dashboard-dark.png"
                alt="Dashboard"
                width={1200}
                height={1200}
                quality={100}
                className="rounded-md lg:rounded-xl bg-foreground/10 ring-1 ring-border"
              />
              <div className="absolute -bottom-4 inset-x-0 w-full h-1/2 bg-gradient-to-t from-background z-40"></div>
              <div className="absolute bottom-0 md:-bottom-8 inset-x-0 w-full h-1/4 bg-gradient-to-t from-background z-50"></div>
            </div>
          </AnimationContainer>
        </section>
      </MaxWidthWrapper>

      {/* Features Section */}
      <MaxWidthWrapper className="pt-10">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col w-full items-center lg:items-center justify-center py-8">
            <MagicBadge title="Features" />
            <h2 className="text-center lg:text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              Effortless Audio-to-Video Uploads with Premium Perks
            </h2>
            <p className="mt-4 text-center lg:text-center text-lg text-muted-foreground max-w-lg">
              Musngr is a powerful tool that helps you transform your audio into
              engaging YouTube videos.
            </p>
          </div>
        </AnimationContainer>
        <AnimationContainer delay={0.2}>
          <BentoGrid className="">
            {FEATURES.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                image={item.img}
                icon={item.icon}
                className={i === 3 || i === 6 ? "" : ""}
              />
            ))}
          </BentoGrid>
        </AnimationContainer>
      </MaxWidthWrapper>

      {/* Process Section */}
      <MaxWidthWrapper className="py-10">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col items-center lg:items-center justify-center w-full py-8 max-w-xl mx-auto">
            <MagicBadge title="The Process" />
            <h2 className="text-center lg:text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              Effortlessly Upload to YouTube in Just 3 Steps!
            </h2>
            <p className="mt-4 text-center lg:text-center text-lg text-muted-foreground max-w-lg">
              Combine your audio file and an image to create stunning YouTube
              videos in seconds.
            </p>
          </div>
        </AnimationContainer>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full py-8 gap-4 md:gap-8">
          {PROCESS.map((process, id) => (
            <AnimationContainer delay={0.2 * id} key={id}>
              <MagicCard className="group md:py-8">
                <div className="flex flex-col items-start justify-center w-full p-5">
                  <process.icon
                    strokeWidth={1.5}
                    className="w-10 h-10 text-foreground"
                  />
                  <div className="flex flex-col relative items-start">
                    <span className="absolute -top-6 right-0 border-2 border-border text-foreground font-medium text-2xl rounded-full w-12 h-12 flex items-center justify-center pt-0.5">
                      {id + 1}
                    </span>
                    <h3 className="text-base mt-6 font-medium text-foreground">
                      {process.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {process.description}
                    </p>
                  </div>
                </div>
              </MagicCard>
            </AnimationContainer>
          ))}
        </section>
      </MaxWidthWrapper>

      {/* Benefits Section */}
      <MaxWidthWrapper className="pt-10">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col w-full items-center lg:items-center justify-center py-8">
            <MagicBadge title="Benefits" />
            <h2 className="text-center lg:text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              Elevate Your Audio-to-Video Workflow with Musngr Premium{" "}
            </h2>
            <p className="mt-4 text-center lg:text-center text-lg text-muted-foreground max-w-lg">
              Enjoy a premium experience with ad-free uploads, saved
              descriptions and tags, and support for high-resolution video
              codecs, all tailored for creators who value quality and
              efficiency.
            </p>
          </div>
        </AnimationContainer>
        <AnimationContainer delay={0.2}>
          <section className="overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0 -top-32 -z-10 mx-auto hidden size-[500px] bg-[radial-gradient(hsl(var(--muted-foreground))_1px,transparent_1px)] opacity-25 [background-size:6px_6px] [mask-image:radial-gradient(circle_at_center,white_250px,transparent_250px)] lg:block"></div>
            <div className="relative mt-8 grid md:grid-cols-3">
              <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
                <div>
                  <h3 className="text-lg font-medium">Enhanced Security</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Protect your content with robust encryption and secure
                    transfer protocols. Your uploads are safe with Musngr.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
                <div>
                  <h3 className="text-lg font-medium">Custom Backgrounds</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add personalized backgrounds to your videos, giving them a
                    professional and polished look to stand out on YouTube.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
                <div>
                  <h3 className="text-lg font-medium">
                    Upload files via a URL
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Easily upload files hosted on your website, Dropbox, and
                    other services.
                  </p>
                </div>
              </div>

              <div className="absolute -inset-x-4 top-0 h-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-4 top-[-0.5px] row-start-2 h-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-4 top-[-0.5px] row-start-3 h-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-4 bottom-0 row-start-4 h-px bg-input md:hidden"></div>
              <div className="absolute -left-2 -top-2 bottom-0 w-px bg-input md:hidden"></div>
              <div className="absolute -right-2 -top-2 bottom-0 col-start-2 w-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-2 top-0 hidden h-px bg-input md:block"></div>
              <div className="absolute -top-2 bottom-0 left-0 hidden w-px bg-input md:block"></div>
              <div className="absolute -left-[0.5px] -top-2 bottom-0 col-start-2 hidden w-px bg-input md:block"></div>
              <div className="absolute -left-[0.5px] -top-2 bottom-0 col-start-3 hidden w-px bg-input md:block"></div>
              <div className="absolute -top-2 bottom-0 right-0 hidden w-px bg-input md:block"></div>
            </div>

            <div className="relative mt-8 grid md:grid-cols-3">
              <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
                <div>
                  <h3 className="text-lg font-medium">Default states</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Save time by setting default preferences for privacy,
                    checkboxes, and other upload form options.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
                <div>
                  <h3 className="text-lg font-medium">
                    Save description and tags
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Save your frequently used descriptions and tags to avoid
                    repetitive typing and streamline your workflow.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
                <div>
                  <h3 className="text-lg font-medium">
                    Multi-Language Support
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Access the platform in your preferred language for a smooth
                    and intuitive user experience.
                  </p>
                </div>
              </div>

              <div className="absolute -inset-x-4 top-0 h-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-4 top-[-0.5px] row-start-2 h-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-4 top-[-0.5px] row-start-3 h-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-4 bottom-0 row-start-4 h-px bg-input md:hidden"></div>
              <div className="absolute -left-2 -top-2 bottom-0 w-px bg-input md:hidden"></div>
              <div className="absolute -right-2 -top-2 bottom-0 col-start-2 w-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-2 top-0 hidden h-px bg-input md:block"></div>
              <div className="absolute -top-2 bottom-0 left-0 hidden w-px bg-input md:block"></div>
              <div className="absolute -left-[0.5px] -top-2 bottom-0 col-start-2 hidden w-px bg-input md:block"></div>
              <div className="absolute -left-[0.5px] -top-2 bottom-0 col-start-3 hidden w-px bg-input md:block"></div>
              <div className="absolute -top-2 bottom-0 right-0 hidden w-px bg-input md:block"></div>
            </div>

            <div className="relative mt-8 grid md:grid-cols-3">
              <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
                <div>
                  <h3 className="text-lg font-medium">No Ads</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enjoy a completely clean and distraction-free experience.
                    Focus on your creativity, not annoying interruptions.{" "}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
                <div>
                  <h3 className="text-lg font-medium">Premium Quality</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get the best of both worlds with high-quality videos and
                    efficient uploads. Musngr Premium supports lossless audio
                    (WAV/FLAC), the VP9 audio codec, and batch uploading for
                    maximum productivity.{" "}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-y-6 px-2 py-10 md:p-6 lg:p-8">
                <div>
                  <h3 className="text-lg font-medium">
                    WAV / FLAC Uploads, VP9 Audio Codec, Batch Upload Mode
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload lossless audio, batch process up to 50 files, and
                    ensure high-resolution videos with superior audio quality.
                  </p>
                </div>
              </div>

              <div className="absolute -inset-x-4 top-0 h-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-4 top-[-0.5px] row-start-2 h-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-4 top-[-0.5px] row-start-3 h-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-4 bottom-0 row-start-4 h-px bg-input md:hidden"></div>
              <div className="absolute -left-2 -top-2 bottom-0 w-px bg-input md:hidden"></div>
              <div className="absolute -right-2 -top-2 bottom-0 col-start-2 w-px bg-input md:hidden"></div>
              <div className="absolute -inset-x-2 top-0 hidden h-px bg-input md:block"></div>
              <div className="absolute -top-2 bottom-0 left-0 hidden w-px bg-input md:block"></div>
              <div className="absolute -left-[0.5px] -top-2 bottom-0 col-start-2 hidden w-px bg-input md:block"></div>
              <div className="absolute -left-[0.5px] -top-2 bottom-0 col-start-3 hidden w-px bg-input md:block"></div>
              <div className="absolute -top-2 bottom-0 right-0 hidden w-px bg-input md:block"></div>
            </div>
          </section>
        </AnimationContainer>
      </MaxWidthWrapper>

      {/* Reviews Section */}
      <MaxWidthWrapper className="py-10">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col items-center lg:items-center justify-center w-full py-8 max-w-xl mx-auto">
            <MagicBadge title="Our Customers" />
            <h2 className="text-center lg:text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              What our users are saying
            </h2>
            <p className="mt-4 text-center lg:text-center text-lg text-muted-foreground max-w-lg">
              Here&apos;s what some of our users have to say about Linkify.
            </p>
          </div>
        </AnimationContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-start gap-4 md:gap-8 py-10">
          <div className="flex flex-col items-start h-min gap-6">
            {REVIEWS.slice(0, 3).map((review, index) => (
              <AnimationContainer delay={0.2 * index} key={index}>
                <MagicCard key={index} className="md:p-0">
                  <Card className="flex flex-col w-full border-none h-min">
                    <CardHeader className="space-y-0">
                      <CardTitle className="text-lg font-medium text-muted-foreground">
                        {review.name}
                      </CardTitle>
                      <CardDescription>{review.username}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-4">
                      <p className="text-muted-foreground">{review.review}</p>
                    </CardContent>
                    <CardFooter className="w-full space-x-1 mt-auto">
                      {Array.from({ length: review.rating }, (_, i) => (
                        <StarIcon
                          key={i}
                          className="w-4 h-4 fill-yellow-500 text-yellow-500"
                        />
                      ))}
                    </CardFooter>
                  </Card>
                </MagicCard>
              </AnimationContainer>
            ))}
          </div>
          <div className="flex flex-col items-start h-min gap-6">
            {REVIEWS.slice(3, 6).map((review, index) => (
              <AnimationContainer delay={0.2 * index} key={index}>
                <MagicCard key={index} className="md:p-0">
                  <Card className="flex flex-col w-full border-none h-min">
                    <CardHeader className="space-y-0">
                      <CardTitle className="text-lg font-medium text-muted-foreground">
                        {review.name}
                      </CardTitle>
                      <CardDescription>{review.username}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-4">
                      <p className="text-muted-foreground">{review.review}</p>
                    </CardContent>
                    <CardFooter className="w-full space-x-1 mt-auto">
                      {Array.from({ length: review.rating }, (_, i) => (
                        <StarIcon
                          key={i}
                          className="w-4 h-4 fill-yellow-500 text-yellow-500"
                        />
                      ))}
                    </CardFooter>
                  </Card>
                </MagicCard>
              </AnimationContainer>
            ))}
          </div>
          <div className="flex flex-col items-start h-min gap-6">
            {REVIEWS.slice(6, 9).map((review, index) => (
              <AnimationContainer delay={0.2 * index} key={index}>
                <MagicCard key={index} className="md:p-0">
                  <Card className="flex flex-col w-full border-none h-min">
                    <CardHeader className="space-y-0">
                      <CardTitle className="text-lg font-medium text-muted-foreground">
                        {review.name}
                      </CardTitle>
                      <CardDescription>{review.username}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-4">
                      <p className="text-muted-foreground">{review.review}</p>
                    </CardContent>
                    <CardFooter className="w-full space-x-1 mt-auto">
                      {Array.from({ length: review.rating }, (_, i) => (
                        <StarIcon
                          key={i}
                          className="w-4 h-4 fill-yellow-500 text-yellow-500"
                        />
                      ))}
                    </CardFooter>
                  </Card>
                </MagicCard>
              </AnimationContainer>
            ))}
          </div>
        </div>
      </MaxWidthWrapper>

      {/* CTA Section */}
      <MaxWidthWrapper className="mt-20 max-w-[100vw] overflow-x-hidden scrollbar-hide">
        <AnimationContainer delay={0.1}>
          <LampContainer>
            <div className="flex flex-col items-center justify-center relative w-full text-center">
              <h2 className="bg-gradient-to-b from-neutral-200 to-neutral-400 py-4 bg-clip-text text-center text-4xl md:text-7xl !leading-[1.15] font-medium font-heading tracking-tight text-transparent mt-8">
                Ready to Share Your Music on YouTube?{" "}
              </h2>
              <p className="text-muted-foreground mt-6 max-w-md mx-auto">
                Try our tools and services to build your website faster. Start
                with a 14-day free trial. No credit card required. No setup
                fees. Cancel anytime.
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
    </section>
  );
}
