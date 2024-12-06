import Card from "@/components/ui/card";
import Herosection from "@/components/sections/herosection";


export default function Home() {
  return (
    <>
    <section className="flex min-h-screen flex-col items-center justify-between">
      <Herosection />
        <Card />
      </section>
    </>
  );
}
