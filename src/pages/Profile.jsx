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
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-xl">You need to log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-16 py-12">
      <div className="mt-6 md:mt-0 px-6 py-3">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-blue-600 px-2 py-1 rounded font-bold"
        >
          ⬅
        </button>
      </div>
      {/* USER INFO */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-wide mb-2">
            {user.name || user.email}
          </h1>
          <p className="text-gray-400">
            Photos Taken: <span className="font-semibold">{photos.length}</span>
          </p>
        </div>

        <button
          onClick={() => alert("Logout handled elsewhere")}
          className="mt-6 md:mt-0 px-6 py-3 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500 transition"
        >
          Logout
        </button>
      </div>

      {/* PHOTOS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((src, idx) => (
          <div key={idx} className="relative group rounded-xl overflow-hidden">
            <img
              src={src}
              alt={`User Photo ${idx + 1}`}
              className="w-full h-64 object-cover rounded-xl"
            />
            {/* Delete overlay */}
            <button
              onClick={() => handleDelete(idx)}
              className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
              aria-label="Delete Photo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
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

      {photos.length === 0 && (
        <p className="mt-12 text-gray-400 text-center text-lg">
          No photos uploaded yet.
        </p>
      )}
    </div>
  );
}
