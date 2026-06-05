export default function Topbar() {
  return (
    <header class="bg-surface flex justify-between items-center w-full px-section-gap sticky top-0 z-30 h-20 border-b-2 border-on-surface">

<div className="relative w-96 group">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none group-focus-within:text-primary transition-colors">search</span>
<input className="w-full bg-surface-container-low border-2 border-on-surface rounded-full py-2.5 pl-12 pr-4 font-body-ui text-body-ui text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-0 transition-colors shadow-sm" placeholder="Search library, authors, tags..." type="text"/>
</div>
<div className="flex items-center gap-4">
<button aria-label="notifications" className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined">notifications</span>
</button>
<button aria-label="cloud_upload" class="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">
<span class="material-symbols-outlined">cloud_upload</span>
</button>
<button class="bg-primary text-on-primary font-label-bold text-label-bold px-6 py-2.5 rounded-full border-2 border-on-surface hover:shadow-[4px_4px_0px_0px_rgba(19,27,46,1)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2">
<span class="material-symbols-outlined text-[20px]">add</span>
                    Add Book
                </button>
</div>
</header>
  );
}