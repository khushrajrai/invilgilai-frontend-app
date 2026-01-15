import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function Login() {
  const { loginWithRedirect, isLoading } = useAuth0();

  if (isLoading) return null;

  return (
    /* Added px-4 to ensure the card doesn't touch screen edges on small devices */
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black px-4">
      {/* Added max-w-[95%] and adjusted padding for mobile-first responsiveness */}
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 shadow-xl p-6 sm:p-8">
        {/* Logo - Text size scales slightly for small screens */}
        <h1
          className="text-2xl sm:text-3xl font-semibold text-center text-[#5B6CFF]"
          style={{ fontFamily: "'Expletus Sans', sans-serif" }}
        >
          InvigilAI
        </h1>

        <p className="text-center text-gray-400 mt-2 text-sm sm:text-base">
          Login to your account
        </p>

        {/* AUTH BUTTONS */}
        <div className="mt-8 space-y-4">
          {/* Email / Password */}
          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-[#5B6CFF] text-white py-3 rounded-lg font-medium hover:opacity-90 transition active:scale-[0.98]"
          >
            Login with Email
          </button>

          {/* Google Login */}
          <button
            onClick={() =>
              loginWithRedirect({
                authorizationParams: {
                  connection: "google-oauth2",
                },
              })
            }
            className="w-full bg-gray-800 text-white py-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition active:scale-[0.98]"
          >
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-[#5B6CFF] font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
