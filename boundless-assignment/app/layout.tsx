// app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col items-center">
        <header className="w-full bg-indigo-600 text-white py-4 shadow-md">
          <div className="max-w-4xl mx-auto px-4 text-center text-lg font-semibold">
            Market Tracker
          </div>
        </header>

        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="text-sm text-gray-500 py-4">
          Ethereum
        </footer>
      </body>
    </html>
  );
}
