export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              About
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Professional status monitoring for your services. Real-time
              updates, beautiful dashboard, powerful API.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Features
            </h3>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li>✓ Real-time monitoring</li>
              <li>✓ 30-day uptime history</li>
              <li>✓ Maintenance mode</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Developer
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a
                  href="https://github.com/notdeathm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  @notdeathm
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/notdeathm/statusapi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Source Code
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 dark:text-slate-500">
          <p>© 2026 Status API. Proprietary Software.</p>
          <p className="mt-2 sm:mt-0">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </footer>
  );
}
