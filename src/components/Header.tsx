import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
              Status
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              by NotDeath
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-6">
          <Link
            href="/"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Dashboard
          </Link>
          <Link
            href="/api-docs"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            API Docs
          </Link>
        </nav>
      </div>
    </header>
  );
}
