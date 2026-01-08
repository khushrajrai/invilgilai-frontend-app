import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function StartCameraDetection() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);


    const [cameraOn, setCameraOn] = useState(false);
    const navigate = useNavigate();

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            setCameraOn(true);
        } catch (err) {
            alert("Camera permission denied");
        }
    };

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, []);


    return (
        <div className="min-h-screen bg-gray-950 text-white flex">
            {/* LEFT MAIN AREA */}
            <div className="flex-1 flex flex-col items-center justify-center relative">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 bg-blue-600 p-2 rounded "
                >
                    ←
                </button>

                {/* Camera Container */}
                <div className="relative w-[420px] h-[420px] bg-white rounded-xl overflow-hidden shadow-lg">

                    {/* VIDEO */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={`w-full h-full object-cover ${cameraOn ? "block" : "hidden"
                            }`}
                    />

                    {/* FACE MASK OVERLAY */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-72 border-4 border-gray-400 rounded-[40px] opacity-80"></div>
                    </div>

                    {/* CAMERA OFF STATE */}
                    {!cameraOn && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                            Camera Preview
                        </div>
                    )}
                </div>

                {/* TEXT */}
                <p className="mt-6 text-gray-300">
                    Place your face inside the frame
                </p>

                {/* BUTTON */}
                {!cameraOn && (
                    <button
                        onClick={startCamera}
                        className="mt-4 bg-blue-600 px-6 py-3 rounded-full font-medium hover:opacity-90"
                    >
                        ▶ Enable Camera
                    </button>
                )}
            </div>

            {/* RIGHT INSTRUCTIONS PANEL */}
            <div className="w-80 bg-gray-200 text-black">
                <div className="bg-blue-600 text-white text-lg p-4 font-bold text-center">
                    Instructions
                </div>

                <ul className="p-6 space-y-6 font-medium text-lg">
                    <li>🔹 Press Spacebar after beeps </li>
                    <li>🔹 Keep the room well lit</li>
                    <li>🔹 Take 5 photos facing forward</li>
                    <li>🔹 Then left, then right</li>
                </ul>
            </div>
        </div>
    );
}

export default StartCameraDetection;
