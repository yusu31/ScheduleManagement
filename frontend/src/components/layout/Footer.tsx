export default function Footer() {
  return (
    <footer className="bg-primary-dark mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-[22px] text-center">
        <p className="text-[12px] text-white/65">
          © {new Date().getFullYear()} Roami — 福島のおでかけ・予定をまるっと管理
        </p>
      </div>
    </footer>
  )
}
