import Footer from "@/components/navigation/footer";
import Navbar from "@/components/navigation/navbar";
import MaxWidthWrapper from "@/components/global/max-width-wrapper";

export default function Internals({ children }: React.PropsWithChildren) {
  return (
    <>
      <div
        id="home"
        className="absolute inset-0 bg-[size:3rem_3rem] dark:bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] h-full opacity-60"
      />
      <Navbar />
      <section className="mt-20 mx-auto w-full z-0 relative">
        <MaxWidthWrapper>{children}</MaxWidthWrapper>
      </section>
      <Footer />
    </>
  );
}
