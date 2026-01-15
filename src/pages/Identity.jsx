import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
const apiURL = import.meta.env.VITE_API_URL_IDENTITY;

function Identity() {
  const { user } = useAuth0();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [count, setCount] = useState(0);

  const totalImages = 15;
  const navigate = useNavigate();

  // START CAMERA
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      alert("Camera permission denied");
    }
  };

  // STOP CAMERA ON PAGE LEAVE
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // CAPTURE IMAGE (FACE AREA)
  const captureImage = async () => {
    if (!videoRef.current || count >= totalImages) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const cropWidth = 256;
    const cropHeight = 288;

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;

    const x = (videoWidth - cropWidth) / 2;
    const y = (videoHeight - cropHeight) / 2;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(
      videoRef.current,
      x,
      y,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // 🔊 Beep
    new Audio("/beep.mp3").play();

    // 1. Determine what the NEW count will be
    const nextCount = count + 1;

    // 2. Update the UI state immediately
    setCount(nextCount);

    // ⏳ BACKEND
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("student_name", user?.name);
      formData.append("files", blob, `img_${nextCount}.jpg`);

      try {
        const response = await fetch(`${apiURL}/enroll`, {
          method: "POST",
          mode: "cors", // Explicitly ask for CORS
          body: formData,
        });

        if (!response.ok) throw new Error("Server responded with error");
      } catch (err) {
        console.error(
          "The browser blocked the response header, but the image likely saved.",
          err
        );
      }

      if (nextCount === totalImages) {
        console.log("Reaching limit. Triggering training...");
        try {
          const trainRes = await fetch(`${apiURL}/train`, { method: "POST" });
          if (trainRes.ok) {
            alert("Your Identity has been recorded!"); // Enrollment and Training Complete!
            navigate("/");
          }
        } catch (trainErr) {
          alert("An Error Occured, Reload and retake photos"); // Training must've started, Check backend console for progress.
        }
      }
    }, "image/jpeg");
  };

  // SPACEBAR HANDLER
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space" && cameraOn && count < totalImages) {
        e.preventDefault();
        captureImage();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [cameraOn, count]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col lg:flex-row overflow-x-hidden">
      {/* HIDDEN CANVAS */}
      <canvas ref={canvasRef} className="hidden" />

      {/* LEFT MAIN AREA */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-blue-600 px-4 py-2 rounded-lg font-bold shadow-lg z-20 hover:bg-blue-700 transition"
        >
          ⬅
        </button>

        {/* CAMERA CONTAINER - Scaled for mobile */}
        <div className="relative w-full max-w-[320px] h-[320px] sm:max-w-[420px] sm:h-[420px] bg-white rounded-2xl overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              cameraOn ? "block" : "hidden"
            }`}
          />

          {/* FACE FRAME - Scaled for smaller camera container */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-56 sm:w-64 sm:h-72 border-4 border-blue-500 rounded-[40px] opacity-60"></div>
          </div>

          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-900">
              Camera Preview
            </div>
          )}
        </div>

        {/* COUNTER & INSTRUCTIONS */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xl text-blue-400 font-bold">
            Images: {count} / {totalImages}
          </p>

          <div className="h-8">
            {count < 5 && (
              <p className="text-yellow-400 font-medium animate-pulse">
                Face The Camera
              </p>
            )}
            {count >= 5 && count < 10 && (
              <p className="text-yellow-400 font-medium animate-pulse">
                ➡ Turn LEFT
              </p>
            )}
            {count >= 10 && count < 15 && (
              <p className="text-yellow-400 font-medium animate-pulse">
                ➡ Turn RIGHT
              </p>
            )}
            {count === 15 && (
              <p className="text-green-400 font-medium">
                Photos Taken Successfully
              </p>
            )}
          </div>

          <p className="text-sm text-gray-400">
            Place your face inside the frame
          </p>

          {/* MOBILE SHUTTER BUTTON */}
          <button
            onClick={captureImage}
            disabled={!cameraOn || count >= totalImages}
            className="lg:hidden mt-4 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-20"
          >
            <div className="w-12 h-12 bg-red-600 rounded-full"></div>
          </button>
          <p className="lg:hidden text-xs text-gray-500 mt-1">
            Tap circle to capture
          </p>
        </div>

        {!cameraOn && (
          <button
            onClick={startCamera}
            className="mt-6 bg-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            ▶ Enable Camera
          </button>
        )}
      </div>

      {/* RIGHT PANEL - Responsive visibility */}
      <div className="w-full lg:w-80 bg-zinc-900 lg:bg-gray-200 text-white lg:text-black border-t lg:border-t-0 lg:border-l border-zinc-800">
        <div className="bg-blue-600 text-white text-lg p-4 font-bold text-center">
          Instructions
        </div>

        <ul className="p-6 space-y-4 md:space-y-6 font-medium text-base md:text-lg">
          <li className="flex items-start gap-3">
            <span className="text-blue-500">🔹</span>
            <span>
              Press{" "}
              <kbd className="bg-gray-800 lg:bg-gray-300 px-2 py-0.5 rounded text-sm">
                Spacebar
              </kbd>{" "}
              or tap the red circle to take photos
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-500">🔹</span>
            <span>Keep the room well lit</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-500">🔹</span>
            <span>5 photos facing forward</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-500">🔹</span>
            <span>5 photos facing left</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-500">🔹</span>
            <span>5 photos facing right</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Identity;
