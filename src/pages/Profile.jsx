import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  // Dummy photos array for demo; replace with backend fetch in prod
  const [photos, setPhotos] = useState([
    "/shots/shot 1.png",
    "/shots/shot 2.png",
    "/shots/shot 3.png",
  ]);

  // Change delete logic in prod
  const handleDelete = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-6 text-center">
        <p className="text-xl">You need to log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 sm:px-10 md:px-16 py-12">
      {/* HEADER AREA */}
      <div className="relative flex flex-col items-center md:items-start mb-12">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute -top-6 left-0 bg-blue-600 px-3 py-1.5 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition active:scale-95"
        >
          ⬅
        </button>

        <div className="mt-8 flex flex-col md:flex-row w-full items-center md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide mb-2 break-all">
              {user.name || user.email}
            </h1>
            <p className="text-gray-400">
              Photos Taken:{" "}
              <span className="font-semibold text-blue-500">
                {photos.length}
              </span>
            </p>
          </div>

          <button
            onClick={() => alert("Logout handled elsewhere")}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500 transition shadow-lg active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>

      {/* PHOTOS GRID */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {photos.map((src, idx) => (
          <div
            key={idx}
            className="relative group rounded-xl overflow-hidden bg-zinc-900 border border-white/5"
          >
            <img
              src={src}
              alt={`User Photo ${idx + 1}`}
              className="w-full h-56 sm:h-64 object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
            />

            {/* Delete button: Visible on mobile, hover-only on desktop */}
            <button
              onClick={() => handleDelete(idx)}
              className="absolute top-3 right-3 bg-red-600 hover:bg-red-500 text-white p-2.5 rounded-full shadow-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 active:scale-90"
              aria-label="Delete Photo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {photos.length === 0 && (
        <div className="mt-20 flex flex-col items-center text-gray-400">
          <div className="w-16 h-16 mb-4 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center">
            📷
          </div>
          <p className="text-lg">No photos uploaded yet.</p>
        </div>
      )}
    </div>
  );
}
