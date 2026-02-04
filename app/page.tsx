/**
 * @fileoverview Landing page view for the Lemello webapp.
 */

import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fefefe] dark:bg-[#191a17] flex items-center justify-center p-8">
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
        <h1 className="text-4xl md:text-5xl font-bold text-[#3d3833] dark:text-[#f2f1ec] mb-4">
          Coming Soon!
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-[#6b6560] dark:text-[#95968e]">
          Today's recipes. Tomorrow's traditions.
        </p>
      </div>
    </div>
  );
}
