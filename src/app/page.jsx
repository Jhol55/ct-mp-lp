import { Benefits } from "@/components/sections/Benefits";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { Gallery } from "@/components/sections/Gallery";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Locations } from "@/components/sections/Locations";
import { Welcome } from "@/components/sections/Welcome";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Welcome />
        <Gallery />
        <Benefits />
        <Locations />
        <FinalCta />
        <Footer />
      </main>
    </>
  );
}
