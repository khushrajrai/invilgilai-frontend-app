import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

const IMAGES = [
  "/shots/shot 1.png",
  "/shots/shot 2.png",
  "/shots/shot 3.png",
  "/shots/shot 1.png",
  "/shots/shot 2.png",
  "/shots/shot 3.png",
];

function FeatureCarousel() {
  const extendedImages = useMemo(() => [...IMAGES, ...IMAGES, ...IMAGES], []);

  const START_INDEX = IMAGES.length;
  const [index, setIndex] = useState(START_INDEX);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Responsive Constants
  const cardWidth =
    typeof window !== "undefined" && window.innerWidth < 768 ? 280 : 400;
  const gap =
    typeof window !== "undefined" && window.innerWidth < 768 ? 24 : 48;
  const totalWidth = cardWidth + gap;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setIndex((prev) => prev + 1);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (index === IMAGES.length * 2) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(START_INDEX);
      }, 850);

      return () => clearTimeout(timeout);
    }
  }, [index, START_INDEX]);

  return (
    <div className="relative w-full overflow-hidden py-12 md:py-24 bg-black">
      {/* Side fades - reduced width on mobile */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-40 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-40 bg-gradient-to-l from-black to-transparent z-10" />

      <div className="relative flex justify-center">
        <motion.div
          className="flex items-center"
          style={{ gap: `${gap}px` }}
          animate={{
            // Dynamic centering based on responsive constants
            x: `calc(50% - ${index * totalWidth + cardWidth / 2}px)`,
          }}
          transition={
            isTransitioning
              ? {
                  type: "spring",
                  stiffness: 110,
                  damping: 22,
                  duration: 0.85,
                }
              : { duration: 0 }
          }
        >
          {extendedImages.map((src, i) => {
            const isActive = i === index;
            const displayId = (i % IMAGES.length) + 1;

            return (
              <motion.div
                key={i}
                animate={{
                  scale: isActive ? 1.25 : 0.9,
                  opacity: isActive ? 1 : 0.35,
                }}
                transition={{ duration: 0.6 }}
                style={{
                  width: `${cardWidth}px`,
                  height:
                    typeof window !== "undefined" && window.innerWidth < 768
                      ? "180px"
                      : "250px",
                }}
                className={`relative flex-shrink-0 rounded-2xl md:rounded-3xl overflow-hidden
                  ${
                    isActive
                      ? "ring-2 md:ring-4 ring-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.3)] md:shadow-[0_0_70px_rgba(37,99,235,0.45)]"
                      : "border border-white/10"
                  }`}
              >
                <img
                  src={src}
                  alt={`Feature ${i}`}
                  className={`w-full h-full object-cover transition duration-700 ${
                    isActive ? "grayscale-0" : "grayscale"
                  }`}
                />

                {/* Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500
                    ${isActive ? "opacity-100" : "opacity-0"}`}
                >
                  <div className="absolute bottom-3 left-4 md:bottom-6 md:left-6">
                    <span className="block text-blue-500 text-[10px] md:text-xs font-mono tracking-[0.2em] md:tracking-[0.35em] uppercase">
                      Active Shield
                    </span>
                    <p className="text-white font-bold tracking-widest uppercase text-sm md:text-lg">
                      Module 0{displayId}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

export default FeatureCarousel;
