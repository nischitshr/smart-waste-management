export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center">
        <p className="text-ink/40 text-sm mb-1">Coming soon</p>
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
      </div>
    </div>
  )
}