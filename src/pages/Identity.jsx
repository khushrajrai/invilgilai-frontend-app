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
  const [isScanning, setIsScanning] = useState(false);

  const totalImages = 15;
  const navigate = useNavigate();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      alert("Camera permission denied");
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureImage = async () => {
    if (!videoRef.current || count >= totalImages) return;

    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 300);

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

    new Audio("/beep.mp3").play();
    const nextCount = count + 1;
    setCount(nextCount);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("student_name", user?.name);
      formData.append("files", blob, `img_${nextCount}.jpg`);

      try {
        await fetch(`${apiURL}/enroll`, {
          method: "POST",
          mode: "cors",
          body: formData,
        });
      } catch (err) {
        console.error("Upload error:", err);
      }

      if (nextCount === totalImages) {
        try {
          const trainRes = await fetch(`${apiURL}/train`, { method: "POST" });
          if (trainRes.ok) {
            alert("Your Identity has been recorded!"); // Enrollment and Training Complete!
            navigate("/");
          }
        } catch {
          alert("An Error Occured, Reload and retake photos"); // Training must've started, Check backend console for progress.
        }
      }
    }, "image/jpeg");
  };

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
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-8">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 p-3 rounded-xl bg-zinc-900 border border-white/10 hover:border-blue-500 transition-all z-30"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* CAMERA HUD */}
        <div className="relative group">
          <div className="relative w-72 h-72 sm:w-[450px] sm:h-[450px] rounded-[40px] overflow-hidden border-2 border-white/5 bg-zinc-900 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                cameraOn ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* AI HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner Brackets */}
              <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-blue-500" />
              <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-blue-500" />
              <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-blue-500" />
              <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-blue-500" />

              {/* Scanning Bar */}
              {cameraOn && count < totalImages && (
                <div className="absolute inset-x-0 h-[2px] bg-blue-500/50 shadow-[0_0_15px_#3b82f6] animate-[scan_3s_infinite_linear]" />
              )}

              {/* Flash Effect */}
              <div
                className={`absolute inset-0 bg-white transition-opacity duration-200 ${
                  isScanning ? "opacity-30" : "opacity-0"
                }`}
              />
            </div>

            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-2 border-blue-500/30 rounded-full animate-ping" />
                <p className="text-zinc-500 font-mono text-sm tracking-widest">
                  AWAITING FEED...
                </p>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 rounded-full text-[10px] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            {cameraOn ? "SYSTEM ACTIVE" : "SYSTEM STANDBY"}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="mt-10 text-center z-10">
          <div className="mb-6">
            <h3 className="text-2xl font-black tracking-tighter italic">
              CAPTURED: <span className="text-blue-500">{count}</span>
              <span className="text-zinc-700"> / {totalImages}</span>
            </h3>
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(totalImages)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-4 rounded-full transition-all duration-300 ${
                    i < count ? "bg-blue-500" : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="h-12 flex items-center justify-center">
            {cameraOn && (
              <p className="text-blue-400 font-mono text-2xl tracking-wider animate-pulse">
                {count < 5
                  ? "● Face The Camera"
                  : count < 10
                  ? "⬅ Turn LEFT"
                  : count < 15
                  ? "➡ Turn RIGHT"
                  : "● ENROLLMENT READY"}
              </p>
            )}
          </div>

          {!cameraOn ? (
            <button
              onClick={startCamera}
              className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] uppercase tracking-widest"
            >
              Enable Camera
            </button>
          ) : (
            <button
              onClick={captureImage}
              disabled={count >= totalImages}
              className="lg:hidden mt-4 w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center active:scale-90 transition-all"
            >
              <div className="w-14 h-14 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
            </button>
          )}
        </div>
      </div>

      {/* INSTRUCTIONS PANEL */}
      <div className="w-full lg:w-[400px] bg-zinc-900/50 backdrop-blur-xl border-l border-white/5 p-10 flex flex-col justify-center">
        <div className="mb-12">
          <h2 className="text-xs font-black text-blue-500 tracking-[0.4em] uppercase mb-2">
            Instructions
          </h2>
          <h1 className="text-4xl font-extrabold tracking-tighter">
            Identity Enrollment
          </h1>
        </div>

        <div className="space-y-8">
          {[
            {
              label: "Use Spacebar or the Shutter button to capture.",
              desc: "",
            },
            {
              label: "Ensure your face is well-lit and unobstructed.",
              desc: "",
            },
            {
              label: "Provide center, left, and right angles as prompted.",
              desc: "",
            },
          ].map((item, i) => (
            <div key={i} className="group">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-blue-500 font-mono text-xs">
                  0{i + 1}
                </span>
                <h3 className="font-bold text-zinc-200 tracking-widest text-sm">
                  {item.label}
                </h3>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-6 rounded-2xl bg-blue-600/5 border border-blue-500/20">
          <p className="text-[10px] font-mono text-blue-400 leading-relaxed uppercase">
            Data is encrypted and stored securely. Biometric vectors are used
            solely for proctoring verification.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 10%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 90%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default Identity;
