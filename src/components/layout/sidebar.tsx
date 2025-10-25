export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-50 border-r min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <a href="/dashboard" className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-100">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/courses" className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-100">
              Courses
            </a>
          </li>
          <li>
            <a href="/progress" className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-100">
              Progress
            </a>
          </li>
          <li>
            <a href="/alumni" className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-100">
              Alumni Network
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  )
}