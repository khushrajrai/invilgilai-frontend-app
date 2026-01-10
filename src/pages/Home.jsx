import Navbar from "../components/Navbar";
import FeatureCarousel from "../components/FeatureCarousel";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

function Landing() {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="min-h-screen bg-black from-gray-100 to-gray-400">
      <Navbar />
      {/* HERO TEXT */}
      <div className="px-12 mt-12">
        <p className="text-xl md:text-2xl font-medium text-white max-w-3xl leading-snug">
          Real-time AI that sees, hears, and flags cheating
          <br />
          before it even starts.
        </p>
      </div>
      {/* FEATURE CARDS
            <div className="flex justify-between px-12 mt-24 gap-10">
                {[1, 2, 3].map((_, i) => (
                    <div
                        key={i}
                        className="w-full h-60 rounded-2xl bg-white shadow-lg"
                    />
                ))}
            </div> */}
      {/* FEATURE CARDS */}
      <div className="px-0 mt-20">
        <FeatureCarousel />
      </div>
      {isAuthenticated ? (
        <Link to="/start-camera-detection">
          <div className="w-18 h-18 ml-320 rounded-full bg-white flex items-center justify-center hover:scale-105 transition">
            <svg
              className="w-11 h-11 text-blue-900"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7h3l2-3h8l2 3h3a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z"
              />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </Link>
      ) : (
        <Link to="/login">
          <button className="ml-298 px-6 py-3 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition">
            Login to Start{" "}
            <span className="font-extrabold font-stretch-75% ">➔</span>
          </button>
        </Link>
      )}
    </div>
  );
}

export default Landing;
