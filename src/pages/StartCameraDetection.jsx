import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
const apiUrl = import.meta.env.VITE_API_URL_IDENTITY;

function StartCameraDetection() {
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
        const response = await fetch(`${apiUrl}/enroll`, {
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
          const trainRes = await fetch(`${apiUrl}/train`, { method: "POST" });
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
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* HIDDEN CANVAS */}
      <canvas ref={canvasRef} className="hidden" />

      {/* LEFT MAIN AREA */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-blue-600 px-2 py-1 rounded font-bold"
        >
          ⬅
        </button>

        {/* CAMERA CONTAINER */}
        <div className="relative w-[420px] h-[420px] bg-white rounded-xl overflow-hidden shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${
              cameraOn ? "block" : "hidden"
            }`}
          />

          {/* FACE FRAME */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-72 border-4 border-gray-400 rounded-[40px] opacity-80"></div>
          </div>

          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
              Camera Preview
            </div>
          )}
        </div>

        {/* COUNTER */}
        <p className="mt-4 text-blue-400 font-semibold">
          Images: {count} / {totalImages}
        </p>

        {count === 0 && <p className="text-yellow-400">Face The Camera</p>}
        {count === 5 && <p className="text-yellow-400">➡ Turn LEFT</p>}
        {count === 10 && <p className="text-yellow-400">➡ Turn RIGHT</p>}
        {count === 15 && <p className="text-yellow-400">Photos Taken</p>}

        <p className="mt-2 text-gray-300">Place your face inside the frame</p>

        {!cameraOn && (
          <button
            onClick={startCamera}
            className="mt-4 bg-blue-600 px-6 py-3 rounded-full font-medium"
          >
            ▶ Enable Camera
          </button>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="w-80 bg-gray-200 text-black">
        <div className="bg-blue-600 text-white text-lg p-4 font-bold text-center">
          Instructions
        </div>

        <ul className="p-6 space-y-6 font-medium text-lg">
          <li>🔹 Press Spacebar to take photos</li>
          <li>🔹 Keep the room well lit</li>
          <li>🔹 5 photos facing forward</li>
          <li>🔹 5 photos facing left</li>
          <li>🔹 5 photos facing right</li>
        </ul>
      </div>
    </div>
  );
}

export default StartCameraDetection;
