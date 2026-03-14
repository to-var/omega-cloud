import { useState } from "react";

/** OmegaT-style menu bar (presentational only). */
const MENU_ITEMS: { label: string; items: string[] }[] = [
  { label: "File", items: ["New project", "Open project", "Save", "Save As…", "Close project", "Export", "Quit"] },
  { label: "Edit", items: ["Undo", "Redo", "Cut", "Copy", "Paste", "Find", "Replace…", "Select All"] },
  { label: "Go To", items: ["Next segment", "Previous segment", "Next untranslated", "Previous untranslated", "Go to segment…"] },
  { label: "View", items: ["Project files", "Glossary", "Dictionary", "Fuzzy matches", "Machine translation", "Segment properties", "Tag validation"] },
  { label: "Tools", items: ["Translate", "Create glossary", "Align documents", "Apply project glossary", "Spell check"] },
  { label: "Options", items: ["Preferences…", "Project properties…", "External dictionaries…"] },
  { label: "Help", items: ["Documentation", "Website", "About OmegaT"] },
];

export default function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="flex shrink-0 items-center border-b border-slate-200 bg-white px-1 text-sm text-slate-700">
      {MENU_ITEMS.map(({ label, items }) => (
        <div
          key={label}
          className="relative"
          onMouseEnter={() => setOpenMenu(label)}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            type="button"
            className="rounded px-3 py-1.5 font-medium hover:bg-slate-100"
            onClick={(e) => {
              e.preventDefault();
              setOpenMenu(openMenu === label ? null : label);
            }}
          >
            {label}
          </button>
          {openMenu === label && (
            <div className="absolute left-0 top-full z-20 min-w-[180px] rounded-md border border-slate-200 bg-white py-1 shadow-lg">
              {items.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="block w-full px-4 py-1.5 text-left text-sm hover:bg-slate-100"
                  onClick={(e) => e.preventDefault()}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
