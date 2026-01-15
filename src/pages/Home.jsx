import Navbar from "../components/Navbar";
import FeatureCarousel from "../components/FeatureCarousel";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

function Home() {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Glow Effect - Adjusted size for mobile */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] md:h-[600px] bg-blue-600/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

      <Navbar />

      {/* HERO SECTION */}
      <div className="relative max-w-6xl mx-auto px-6 md:px-8 pt-20 md:pt-32 pb-1 text-center md:text-left">
        {/* Responsive Typography */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          Real-time AI proctoring <br className="hidden md:block" />
          <span className="text-blue-500">that shuts down cheating.</span>
        </h1>

        <p className="mt-6 md:mt-8 text-base md:text-xl text-gray-400 max-w-2xl mx-auto md:mx-0 leading-relaxed">
          The ironclad defense for academic integrity. AI that detects,
          analyzes, and logs suspicious behavior with zero latency.
        </p>

        {/* Responsive CTA Buttons */}
        <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 md:gap-5 justify-center md:justify-start">
          {isAuthenticated ? (
            <>
              <Link to="/Exam" className="w-full sm:w-auto">
                <button className="w-full px-8 py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Take Demo Exam
                </button>
              </Link>
              <Link to="/Identity" className="w-full sm:w-auto">
                <button className="w-full px-8 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all active:scale-95">
                  Update Identity
                </button>
              </Link>
            </>
          ) : (
            <Link to="/login" className="w-full sm:w-auto">
              <button className="group relative w-full px-8 md:px-10 py-4 rounded-xl bg-zinc-900 border border-blue-500/40 text-white font-semibold text-base md:text-lg transition-all duration-300 hover:border-blue-500 hover:bg-zinc-800 active:scale-[0.98]">
                <span className="flex items-center justify-center gap-3">
                  Register Identity
                  <span className="text-blue-500 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-10 md:mt-0">
        <FeatureCarousel />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
