export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Alumni LMS
          </h1>
          <nav className="space-x-4">
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </a>
            <a href="/profile" className="text-gray-600 hover:text-gray-900">
              Profile
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}