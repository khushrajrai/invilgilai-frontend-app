import { useState, useEffect, useRef } from "react";

// Use the environment variable for the Gateway URL
const apiURL = import.meta.env.VITE_API_URL_GATEWAY;

const QUESTIONS = [
  {
    q: "What does HTML stand for?",
    options: [
      "Hyper Trainer ML",
      "HyperText Markup Language",
      "High Text ML",
      "None",
    ],
    answer: 1,
  },
  {
    q: "Which hook manages state in React?",
    options: ["useData", "useState", "useRef", "useEffect"],
    answer: 1,
  },
  {
    q: "JS is ___ typed?",
    options: ["Statically", "Strongly", "Dynamically", "Loosely"],
    answer: 2,
  },
  {
    q: "Which runs first?",
    options: ["useEffect", "Render", "Constructor", "DOM paint"],
    answer: 1,
  },
  {
    q: "CSS Flexbox axis default?",
    options: ["Column", "Row", "Grid", "Inline"],
    answer: 1,
  },
  {
    q: "HTTP status for success?",
    options: ["404", "500", "301", "200"],
    answer: 3,
  },
  {
    q: "Which is NOT a JS framework?",
    options: ["React", "Vue", "Angular", "Django"],
    answer: 3,
  },
  {
    q: "What is JSX?",
    options: ["HTML", "JS + XML", "Template engine", "Compiler"],
    answer: 1,
  },
  {
    q: "Which keyword blocks scope?",
    options: ["var", "let", "const", "static"],
    answer: 1,
  },
  {
    q: "npm is used for?",
    options: ["Styling", "Packaging", "Database", "Hosting"],
    answer: 1,
  },
];

export default function DemoExam() {
  const videoRef = useRef(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [stream, setStream] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Proctoring State ---
  const [riskScore, setRiskScore] = useState(0);
  const [violationMsg, setViolationMsg] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  /* ================= PERMISSION CHECK ================= */
  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setPermissionsGranted(true);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch {
      alert("Camera and microphone access is mandatory to start the exam.");
    }
  };

  /* ================= PROCTORING INFERENCE LOOP ================= */
  useEffect(() => {
    if (!permissionsGranted || submitted) return;

    const interval = setInterval(async () => {
      if (!videoRef.current || isCapturing) return;

      setIsCapturing(true);
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob(
        async (blob) => {
          const formData = new FormData();
          formData.append("file", blob, "frame.jpg");

          try {
            // Fix: Call the correct endpoint on the gateway
            const response = await fetch(`${apiURL}`, {
              method: "POST",
              body: formData,
            });

            const data = await response.json();

            setRiskScore(data.risk_score); // Update HUD
            setViolationMsg(data.message); // Update HUD Warning

            if (data.status === "AUTO_FAIL") {
              alert(`CRITICAL VIOLATION: ${data.message}. Exam Terminated.`);
              setSubmitted(true);
            }
          } catch (err) {
            console.error("Proctoring API unreachable:", err);
          } finally {
            setIsCapturing(false);
          }
        },
        "image/jpeg",
        0.6
      ); // Reduced quality for faster transmission
    }, 2000);

    return () => clearInterval(interval);
  }, [permissionsGranted, submitted, isCapturing]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!permissionsGranted || submitted) return;
    if (timeLeft <= 0) {
      setSubmitted(true);
      return;
    }
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, permissionsGranted, submitted]);

  const score = QUESTIONS.reduce(
    (acc, q, idx) => acc + (answers[idx] === q.answer ? 1 : 0),
    0
  );

  if (!permissionsGranted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="bg-zinc-900 p-10 rounded-2xl w-full max-w-lg text-center">
          <h1 className="text-3xl font-bold mb-4">Identity Verification</h1>
          <p className="text-gray-400 mb-6">
            Position your face clearly in the frame.
          </p>
          <div className="aspect-video bg-black rounded-xl mb-6 overflow-hidden border border-zinc-800">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={requestPermissions}
            className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <div className="bg-zinc-900 p-10 rounded-2xl w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Exam Closed</h1>
          <p className="text-gray-300 mb-6">
            Score: <span className="text-blue-500">{score}</span> /{" "}
            {QUESTIONS.length}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full py-3 rounded-xl bg-white text-black font-bold"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[current];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans">
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden fixed top-[72px] left-0 right-0 z-20 bg-black border-b border-zinc-800 px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="px-3 py-1 rounded-lg bg-zinc-800 text-sm font-semibold"
        >
          Question Map
        </button>
      </div>

      {/* --- PROCTORING HUD --- */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              AI Proctoring Active
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full animate-pulse ${
                  riskScore > 60 ? "bg-red-500" : "bg-green-500"
                }`}
              />
              <p
                className={`text-xs font-mono ${
                  riskScore > 60 ? "text-red-500" : "text-gray-300"
                }`}
              >
                Risk: {riskScore}% {violationMsg && `| ${violationMsg}`}
              </p>
            </div>
          </div>
        </div>
        <div className="text-xl font-mono text-white bg-black px-4 py-1 rounded-lg border border-zinc-700">
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`
    fixed inset-y-0 left-0 z-40 w-72 bg-black border-r border-zinc-800 p-6 pt-24
    transform transition-transform duration-300
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    md:static md:translate-x-0 md:block
  `}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden mb-6 px-3 py-2 rounded-lg bg-zinc-800 text-sm font-semibold"
        >
          Close Map
        </button>

        <h2 className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-6">
          Progress Map
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {QUESTIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrent(idx);
                setIsSidebarOpen(false);
              }}
              className={`h-10 rounded-lg text-xs font-bold transition ${
                current === idx
                  ? "bg-white text-black"
                  : answers[idx] !== undefined
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-gray-500"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to end the exam?")) {
              setSubmitted(true);
            }
          }}
          className="mt-10 w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-bold text-white"
        >
          End Exam
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 pt-28 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <p className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-2 mt-10">
            Question {current + 1}
          </p>
          <h2 className="text-2xl font-semibold leading-tight">{q.q}</h2>
        </div>

        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <label
              key={idx}
              className={`block p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                answers[current] === idx
                  ? "border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30"
              }`}
            >
              <input
                type="radio"
                className="hidden"
                name="mcq"
                checked={answers[current] === idx}
                onChange={() => setAnswers({ ...answers, [current]: idx })}
              />
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[current] === idx
                      ? "border-blue-500"
                      : "border-zinc-600"
                  }`}
                >
                  {answers[current] === idx && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  )}
                </div>
                <span className="text-base font-medium">{opt}</span>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-between items-center mt-12">
          <button
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
            className="px-10 py-3 rounded-xl bg-zinc-800 disabled:opacity-20 font-bold hover:bg-zinc-700 transition"
          >
            Back
          </button>
          <button
            onClick={
              current === QUESTIONS.length - 1
                ? () => setSubmitted(true)
                : () => setCurrent((c) => c + 1)
            }
            className="px-10 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition shadow-lg"
          >
            {current === QUESTIONS.length - 1 ? "Finish Exam" : "Next"}
          </button>
        </div>
      </main>
    </div>
  );
}
