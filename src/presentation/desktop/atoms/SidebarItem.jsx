export default function SidebarItem({
  icon,
  label,
  active = false
}) {
  return (
    <button
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${active
          ? 'bg-primary-container border-2 border-on-surface'
          : 'hover:bg-surface-container-low'}
      `}
    >
      <span className="material-symbols-outlined">
        {icon}
      </span>

      <span className="font-medium">
        {label}
      </span>
    </button>
  )
}