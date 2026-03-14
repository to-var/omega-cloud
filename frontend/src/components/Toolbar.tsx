/** Presentational toolbar with OmegaT-style icons (no functionality). */
const ICONS = [
  { icon: "fa-floppy-disk", title: "Save" },
  { icon: "fa-magnifying-glass", title: "Search" },
  { icon: "fa-rotate-left", title: "Undo" },
  { icon: "fa-rotate-right", title: "Redo" },
  { icon: "fa-copy", title: "Copy" },
  { icon: "fa-paste", title: "Paste" },
  { icon: "fa-scissors", title: "Cut" }
];

export default function Toolbar() {
  return (
    <div className="flex shrink-0 items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      {ICONS.map(({ icon, title }) => (
        <button
          key={icon}
          type="button"
          title={title}
          className="rounded p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          onClick={(e) => e.preventDefault()}
        >
          <i className={`fas ${icon}`} aria-hidden />
        </button>
      ))}
    </div>
  );
}
