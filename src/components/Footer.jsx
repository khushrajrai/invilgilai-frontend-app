function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black border-t border-white/5 pt-16 pb-8 px-6 md:px-16 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          {/* BRAND SECTION */}
          <div className="space-y-4 text-center md:text-left">
            <h2
              className="text-4xl md:text-5xl font-extrabold tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600 select-none"
              style={{ fontFamily: "'Expletus Sans', sans-serif" }}
            >
              INVIGIL<span className="text-white">AI</span>
            </h2>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed mx-auto md:mx-0">
              Empowering academic integrity through advanced real-time computer
              vision and behavioral analysis.
            </p>
          </div>

          {/* CONNECT SECTION - ENHANCED STANDOUT */}
          <div className="flex flex-col items-center md:items-end gap-6">
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.3em] opacity-50">
              Developer Connect
            </h3>
            <div className="flex gap-4">
              <a
                href="https://github.com/Apurv7Gupta/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 bg-zinc-900 border border-white/10 px-6 py-3 rounded-2xl hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300"
              >
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors font-semibold">
                  GitHub
                </span>
                <svg
                  className="w-5 h-5 fill-current text-gray-400 group-hover:text-blue-500 transition-colors"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/apurv7gupta/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 bg-zinc-900 border border-white/10 px-6 py-3 rounded-2xl hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300"
              >
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors font-semibold">
                  LinkedIn
                </span>
                <svg
                  className="w-5 h-5 fill-current text-gray-400 group-hover:text-blue-500 transition-colors"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.6 0 4.266 2.37 4.266 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM DIVIDER */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-gray-600 text-xs">
            © {currentYear} InvigilAI. Built for absolute academic integrity.
          </p>

          <div className="flex gap-6">
            <span className="text-[10px] text-zinc-700 font-mono uppercase tracking-tighter">
              System Status: Optimal
            </span>
            <span className="text-[10px] text-zinc-700 font-mono uppercase tracking-tighter">
              AI Engine: v2.4.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
