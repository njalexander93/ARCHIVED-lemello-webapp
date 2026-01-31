import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FEFEFE] dark:bg-[#191A17] flex items-center justify-center p-8">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/lemello-horizontal-yellow.svg"
            alt="Lemello"
            width={400}
            height={100}
            priority
            className="dark:drop-shadow-[0_0_20px_rgba(255,202,40,0.2)]"
          />
        </div>

        {/* Coming Soon */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#3D3833] dark:text-[#F2F1EC] mb-4">
          Coming Soon!
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-[#6B6560] dark:text-[#95968E]">
          Today's recipes. Tomorrow's traditions.
        </p>
      </div>
    </div>
  );
}
