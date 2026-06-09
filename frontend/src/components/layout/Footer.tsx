export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} 福島イベントナビ
        </p>
      </div>
    </footer>
  )
}
