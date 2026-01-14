import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function Navbar() {
  const { isAuthenticated } = useAuth0();

  const destination = isAuthenticated ? "/profile" : "/login";
  const ariaLabel = isAuthenticated ? "Profile" : "Login";

  return (
    <nav className="w-full flex items-center justify-between px-6 md:px-16 py-4 md:py-6 bg-black border-b border-white/5">
      {/* BRAND */}
      <div className="flex items-center gap-4 select-none">
        <img
          src="/logo.png"
          alt="Invigil AI Logo"
          className="h-15 sm:h-17 md:h-21 w-auto"
        />

        <h1
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-[0.10em] md:tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600 flex items-center"
          style={{ fontFamily: "'Expletus Sans', sans-serif" }}
        >
          INVIGIL
          <span className="ml-1 md:ml-2 tracking-normal font-black text-white">
            AI
          </span>
        </h1>
      </div>

      {/* PROFILE / LOGIN */}
      <Link to={destination} aria-label={ariaLabel} className="shrink-0">
        <div className="group w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center transition-all duration-300 hover:border-blue-500 hover:bg-zinc-800">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-white transition-colors duration-300 group-hover:text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      </Link>
    </nav>
  );
}

export default Navbar;
