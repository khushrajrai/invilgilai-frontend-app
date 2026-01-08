import { Link } from "react-router-dom";
function Navbar() {
    return (
        <nav className="w-full flex items-center bg-black justify-between px-14 py-3">
            <h1 className="text-5xl font-medium  text-[#5B6CFF] tracking-wide" style={{ fontFamily: "'Expletus Sans', sans-serif" }}>
                Invigil<span className="font-medium">AI</span>
            </h1>
            
            <Link to="/login">
                <div className="w-11 h-11 rounded-full bg-gray-300  flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-black "
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </Link>
        </nav>
    );
}

export default Navbar;
