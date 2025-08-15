import Navbar from "@/components/navigation/navbar";

export default function SettingsLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Navbar />
      <section className="container">{children}</section>
    </>
  );
}
