"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { useBuilderStore, Block, SocialLink } from "../../store/builderStore";
import {
  Eye, EyeOff, Trash2, GripVertical, ChevronDown, ChevronUp,
  UserRound, Share2, Type, Minus, FileText, MapPin, Image as ImageIcon,
  MessageSquare, Star, GitCommitHorizontal, Link2, ClipboardList,
  Plus, X, Twitter, Instagram, Linkedin, Youtube, Github, Globe,
  Facebook, Twitch, Headphones, RectangleHorizontal, Video, Square,
  GalleryHorizontal, ChevronsUpDown, StretchVertical, Wand2,
  Info, CheckCircle2, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

// ─── Shared field styles ──────────────────────────────────────────────────────
const INP = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600";
const LBL = "text-[11px] text-zinc-500 block mb-1";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={LBL}>{label}</label>{children}</div>;
}

function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={INP} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${INP} resize-none`} rows={props.rows ?? 2} />;
}

// ─── Social platforms ─────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: "twitter",   name: "X (Twitter)", Icon: Twitter },
  { id: "instagram", name: "Instagram",   Icon: Instagram },
  { id: "github",    name: "GitHub",       Icon: Github },
  { id: "linkedin",  name: "LinkedIn",     Icon: Linkedin },
  { id: "youtube",   name: "YouTube",      Icon: Youtube },
  { id: "facebook",  name: "Facebook",     Icon: Facebook },
  { id: "twitch",    name: "Twitch",       Icon: Twitch },
  { id: "globe",     name: "Website",      Icon: Globe },
];
const PLATFORM_ICON: Record<string, React.ComponentType<{ className?: string }>> = Object.fromEntries(PLATFORMS.map(p => [p.id, p.Icon]));

// ─── Block icon / colour maps ─────────────────────────────────────────────────
const BLOCK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  profile: UserRound, social: Share2, link: Link2, text: Type,
  divider: Minus, photo: ImageIcon, form: ClipboardList, map: MapPin,
  testimonial: Star, timeline: GitCommitHorizontal, file: FileText,
  popup: MessageSquare, audio: Headphones, button: RectangleHorizontal,
  video: Video, card: Square, carousel: GalleryHorizontal,
  accordion: ChevronsUpDown, space: StretchVertical,
};

const BLOCK_COLORS: Record<string, string> = {
  profile: "text-indigo-400", social: "text-pink-400", link: "text-blue-400",
  text: "text-emerald-400", divider: "text-zinc-400", photo: "text-amber-400",
  form: "text-cyan-400", map: "text-red-400", testimonial: "text-yellow-400",
  timeline: "text-purple-400", file: "text-green-400", popup: "text-rose-400",
  audio: "text-violet-400", button: "text-orange-400", video: "text-red-400",
  card: "text-slate-400", carousel: "text-fuchsia-400",
  accordion: "text-teal-400", space: "text-zinc-500",
};

const BLOCK_LABEL: Record<string, string> = {
  profile: "Profile", social: "Social Links", link: "Link", text: "Text",
  divider: "Divider", photo: "Photo", form: "Form", map: "Map",
  testimonial: "Testimonial", timeline: "Timeline", file: "File",
  popup: "Popup", audio: "Audio", button: "Button", video: "Video",
  card: "Card", carousel: "Carousel", accordion: "Accordion", space: "Space",
};

// ─── Image helper ─────────────────────────────────────────────────────────────
// Read a File → resized data URL. Resizes the image client-side so we don't
// stuff multi-MB blobs into localStorage. Browser-only: never call from SSR.
async function readImageAsDataURL(file: File, maxSize = 512, quality = 0.85): Promise<string> {
  const objUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload  = () => resolve(i);
      i.onerror = () => reject(new Error("Image failed to load"));
      i.src = objUrl;
    });
    const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width  * ratio));
    const h = Math.max(1, Math.round(img.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objUrl);
  }
}

// ─── Individual editors ───────────────────────────────────────────────────────

function ProfileEditor({ block }: { block: Block }) {
  const { updateBlock, profile, setProfile } = useBuilderStore();
  const [uploading, setUploading] = useState(false);

  const onPickAvatar = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5_000_000) {
      toast.error("Original file must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readImageAsDataURL(file, 512, 0.85);
      setProfile({ image: dataUrl });
    } catch {
      toast.error("Couldn't read that image — try another one");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-2">
        <Field label="First name">
          <Inp value={profile.firstName} onChange={e => setProfile({ firstName: e.target.value })} placeholder="First" />
        </Field>
        <Field label="Last name">
          <Inp value={profile.lastName} onChange={e => setProfile({ lastName: e.target.value })} placeholder="Last" />
        </Field>
      </div>
      <Field label="Bio">
        <Textarea value={profile.bio} onChange={e => setProfile({ bio: e.target.value })} placeholder="Short description…" />
      </Field>

      <Field label="Avatar">
        <div className="flex items-center gap-3">
          {/* Preview */}
          <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0">
            {profile.image
              ? <img src={profile.image} alt="avatar preview" className="w-full h-full object-cover" />
              : <UserRound className="w-6 h-6 text-zinc-600" />}
          </div>

          {/* Upload + Remove */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <label
              className={`cursor-pointer flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed text-xs transition-colors ${
                uploading
                  ? "border-zinc-700 text-zinc-600 cursor-wait"
                  : "border-zinc-700 text-zinc-400 hover:border-indigo-500 hover:text-indigo-400"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={e => onPickAvatar(e.target.files?.[0])}
                className="hidden"
                disabled={uploading}
              />
              <Plus className="w-3 h-3" />
              {uploading ? "Processing…" : profile.image ? "Change avatar" : "Upload avatar"}
            </label>
            {profile.image && !uploading && (
              <button
                onClick={() => setProfile({ image: null })}
                className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
              >
                Remove avatar
              </button>
            )}
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 mt-1.5">
          Resized to 512×512 · saved in your browser
        </p>
      </Field>

      <div className="pt-2 border-t border-zinc-800 space-y-1.5">
        {(["showAvatar", "showName", "showBio"] as const).map(key => (
          <label key={key} className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
            <input type="checkbox" checked={block.data[key] as boolean ?? true}
              onChange={e => updateBlock(block.id, { [key]: e.target.checked })} className="accent-indigo-500 rounded" />
            {key === "showAvatar" ? "Show avatar" : key === "showName" ? "Show name" : "Show bio"}
          </label>
        ))}
      </div>
    </div>
  );
}

function SocialEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const [selPlatform, setSelPlatform] = useState("twitter");
  const [newUrl, setNewUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("");
  const links = (block.data.links as SocialLink[]) ?? [];
  const isOther = selPlatform === "other";

  const onPickFile = (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|svg\+xml|webp|gif)$/.test(file.type)) {
      toast.error("Please upload a PNG, JPEG, SVG, WebP, or GIF file");
      return;
    }
    if (file.size > 500_000) {
      toast.error("Icon must be under 500 KB");
      return;
    }
    const reader = new FileReader();
    reader.onload  = () => setCustomIcon(reader.result as string);
    reader.onerror = () => toast.error("Failed to read file");
    reader.readAsDataURL(file);
  };

  const addLink = () => {
    const url = newUrl.trim();
    if (!url) return;

    if (isOther) {
      const name = customName.trim();
      if (!name)       { toast.error("Please enter a platform name"); return; }
      if (!customIcon) { toast.error("Please upload an icon");        return; }
      updateBlock(block.id, { links: [...links, { platform: name, url, icon: "other", customIcon }] });
      setNewUrl(""); setCustomName(""); setCustomIcon("");
      return;
    }

    const p = PLATFORMS.find(p => p.id === selPlatform);
    updateBlock(block.id, { links: [...links, { platform: p?.name || selPlatform, url, icon: selPlatform }] });
    setNewUrl("");
  };

  return (
    <div className="space-y-3 pt-2">
      {links.length > 0 && (
        <div className="space-y-1.5">
          {links.map((link, i) => {
            const Icon = PLATFORM_ICON[link.icon?.toLowerCase()] || Globe;
            return (
              <div key={i} className="flex items-center gap-2 bg-zinc-800 rounded-lg px-2.5 py-1.5 group">
                {link.customIcon
                  ? <img src={link.customIcon} alt={link.platform} className="w-3.5 h-3.5 object-contain flex-shrink-0" />
                  : <Icon className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />}
                <span className="text-xs text-zinc-300 flex-1 truncate">{link.platform}</span>
                <span className="text-[10px] text-zinc-600 truncate max-w-[80px]">{link.url}</span>
                <button onClick={() => updateBlock(block.id, { links: links.filter((_, j) => j !== i) })}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/10">
                  <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Field label="Platform">
        <select value={selPlatform} onChange={e => setSelPlatform(e.target.value)} className={INP}>
          {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          <option value="other">Other (custom icon)…</option>
        </select>
      </Field>

      {isOther && (
        <>
          <Field label="Platform name">
            <Inp value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Threads, Bluesky, Mastodon" />
          </Field>
          <Field label="Icon (PNG, JPEG, SVG, WebP — under 500 KB)">
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-zinc-700 text-zinc-500 text-xs hover:border-indigo-500 hover:text-indigo-400 transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                  onChange={e => onPickFile(e.target.files?.[0])}
                  className="hidden"
                />
                <Plus className="w-3 h-3" /> {customIcon ? "Change icon" : "Upload icon"}
              </label>
              {customIcon && (
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                  <img src={customIcon} alt="preview" className="w-4 h-4 object-contain" />
                  <button onClick={() => setCustomIcon("")} title="Remove icon"
                    className="p-0.5 rounded hover:bg-red-500/10">
                    <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                  </button>
                </div>
              )}
            </div>
          </Field>
        </>
      )}

      <Field label="URL">
        <div className="flex gap-1.5">
          <Inp type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addLink()} placeholder="https://…" />
          <button onClick={addLink}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white rounded-lg px-2.5 py-1.5 text-xs flex-shrink-0">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
      </Field>
    </div>
  );
}

function LinkEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const up = (k: string, v: string) => updateBlock(block.id, { [k]: v });
  return (
    <div className="space-y-2 pt-2">
      <div className="flex gap-2">
        <div>
          <label className={LBL}>Emoji</label>
          <Inp value={(block.data.emoji as string) || "🔗"} onChange={e => up("emoji", e.target.value)}
            className={`${INP} w-12 text-center`} maxLength={4} />
        </div>
        <div className="flex-1">
          <Field label="Label">
            <Inp value={(block.data.label as string) || ""} onChange={e => up("label", e.target.value)} placeholder="My Link" />
          </Field>
        </div>
      </div>
      <Field label="URL">
        <Inp type="url" value={(block.data.url as string) || ""} onChange={e => up("url", e.target.value)} placeholder="https://…" />
      </Field>
      <Field label="Description (optional)">
        <Inp value={(block.data.description as string) || ""} onChange={e => up("description", e.target.value)} placeholder="A short subtitle" />
      </Field>
    </div>
  );
}

function TextEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  return (
    <div className="space-y-2 pt-2">
      <Field label="Heading">
        <Inp value={(block.data.title as string) || ""} onChange={e => updateBlock(block.id, { title: e.target.value })} placeholder="My Projects" />
      </Field>
      <Field label="Subtitle (optional)">
        <Textarea value={(block.data.subtitle as string) || ""} onChange={e => updateBlock(block.id, { subtitle: e.target.value })} placeholder="A short description…" />
      </Field>
    </div>
  );
}

function DividerEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  return (
    <div className="pt-2">
      <Field label="Label (optional)">
        <Inp value={(block.data.label as string) || ""} onChange={e => updateBlock(block.id, { label: e.target.value })} placeholder="e.g. Projects" />
      </Field>
    </div>
  );
}

function PhotoEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const up = (k: string, v: string) => updateBlock(block.id, { [k]: v });
  return (
    <div className="space-y-2 pt-2">
      <Field label="Image URL">
        <Inp type="url" value={(block.data.src as string) || ""} onChange={e => up("src", e.target.value)} placeholder="https://…/photo.jpg" />
      </Field>
      {!!block.data.src && (
        <img src={block.data.src as string} alt="preview" className="w-full h-28 object-cover rounded-lg border border-zinc-700" />
      )}
      <Field label="Alt text">
        <Inp value={(block.data.alt as string) || ""} onChange={e => up("alt", e.target.value)} placeholder="Description for screen readers" />
      </Field>
      <Field label="Caption title (optional)">
        <Inp value={(block.data.title as string) || ""} onChange={e => up("title", e.target.value)} placeholder="Photo caption" />
      </Field>
      <Field label="Description (optional)">
        <Textarea value={(block.data.description as string) || ""} onChange={e => up("description", e.target.value)} placeholder="Longer description below photo…" />
      </Field>
    </div>
  );
}

function TestimonialEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const up = (k: string, v: string) => updateBlock(block.id, { [k]: v });
  return (
    <div className="space-y-2 pt-2">
      <Field label="Quote">
        <Textarea value={(block.data.quote as string) || ""} onChange={e => up("quote", e.target.value)} placeholder="Amazing product!" rows={3} />
      </Field>
      <Field label="Author name">
        <Inp value={(block.data.author as string) || ""} onChange={e => up("author", e.target.value)} placeholder="Happy Customer" />
      </Field>
      <Field label="Role / title (optional)">
        <Inp value={(block.data.role as string) || ""} onChange={e => up("role", e.target.value)} placeholder="Product Designer" />
      </Field>
    </div>
  );
}

function TimelineEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const [newDate, setNewDate] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const events = (block.data.events as { date: string; title: string; description?: string }[]) ?? [];

  const addEvent = () => {
    if (!newTitle.trim()) return;
    updateBlock(block.id, { events: [...events, { date: newDate, title: newTitle, description: newDesc || undefined }] });
    setNewDate(""); setNewTitle(""); setNewDesc("");
  };

  const removeEvent = (i: number) => updateBlock(block.id, { events: events.filter((_, j) => j !== i) });

  const updateEvent = (i: number, key: string, val: string) => {
    const next = events.map((e, j) => j === i ? { ...e, [key]: val } : e);
    updateBlock(block.id, { events: next });
  };

  return (
    <div className="space-y-3 pt-2">
      {events.length > 0 && (
        <div className="space-y-2">
          {events.map((ev, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 p-2.5 space-y-1.5 relative group">
              <button onClick={() => removeEvent(i)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/10">
                <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
              </button>
              <div className="grid grid-cols-[72px_1fr] gap-1.5">
                <Inp value={ev.date} onChange={e => updateEvent(i, "date", e.target.value)} placeholder="2024" />
                <Inp value={ev.title} onChange={e => updateEvent(i, "title", e.target.value)} placeholder="Event title" />
              </div>
              <Inp value={ev.description || ""} onChange={e => updateEvent(i, "description", e.target.value)} placeholder="Description (optional)" />
            </div>
          ))}
        </div>
      )}
      <div className="bg-zinc-900/60 rounded-xl border border-dashed border-zinc-700 p-2.5 space-y-1.5">
        <p className={LBL}>Add event</p>
        <div className="grid grid-cols-[72px_1fr] gap-1.5">
          <Inp value={newDate} onChange={e => setNewDate(e.target.value)} placeholder="Year" />
          <Inp value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Event title" />
        </div>
        <Inp value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" />
        <button onClick={addEvent}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors mt-1">
          <Plus className="w-3 h-3" /> Add event
        </button>
      </div>
    </div>
  );
}

function FormEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();

  type FF = {
    id: string;
    type: string;
    label: string;
    placeholder: string;
    required: boolean;
    options?: string[];
  };

  const FIELD_TYPES = [
    { value: "text",     label: "Short text"    },
    { value: "email",    label: "Email"          },
    { value: "phone",    label: "Phone"          },
    { value: "number",   label: "Number"         },
    { value: "textarea", label: "Long text"      },
    { value: "url",      label: "URL"            },
    { value: "select",   label: "Dropdown"       },
    { value: "radio",    label: "Radio buttons"  },
    { value: "checkbox", label: "Checkbox"       },
    { value: "date",     label: "Date"           },
  ];

  // Field types that need an editable list of choices (select, radio).
  const TYPES_WITH_OPTIONS = new Set(["select", "radio"]);
  // Field types where the "Placeholder" field is meaningless.
  const TYPES_WITHOUT_PLACEHOLDER = new Set(["checkbox", "date"]);

  const DEFAULT_FIELDS: FF[] = [
    { id: "f1", type: "text",     label: "Name",    placeholder: "Your name",       required: true  },
    { id: "f2", type: "email",    label: "Email",   placeholder: "your@email.com",  required: true  },
    { id: "f3", type: "textarea", label: "Message", placeholder: "Your message…",   required: false },
  ];

  const fields: FF[] = (block.data.fields as FF[])?.length
    ? (block.data.fields as FF[])
    : DEFAULT_FIELDS;

  const setFields = (next: FF[]) => updateBlock(block.id, { fields: next });
  const addField  = () => setFields([...fields, { id: `f${Date.now()}`, type: "text", label: "New Field", placeholder: "", required: false }]);
  const removeField = (id: string) => setFields(fields.filter(f => f.id !== id));

  // Editing a field — special-case `type` so switching to a choice-based type
  // (Dropdown / Radio) seeds an `options` array if the field doesn't have one.
  const editField = (id: string, key: string, val: unknown) =>
    setFields(fields.map(f => {
      if (f.id !== id) return f;
      const next: FF = { ...f, [key]: val } as FF;
      if (key === "type" && typeof val === "string" && TYPES_WITH_OPTIONS.has(val)
          && (!next.options || next.options.length === 0)) {
        next.options = ["Option 1", "Option 2"];
      }
      return next;
    }));

  // Options helpers (only relevant for select-type fields)
  const editOption = (fieldId: string, idx: number, val: string) => {
    const f = fields.find(x => x.id === fieldId);
    if (!f) return;
    const next = (f.options ?? []).map((o, i) => i === idx ? val : o);
    editField(fieldId, "options", next);
  };
  const addOption = (fieldId: string) => {
    const f = fields.find(x => x.id === fieldId);
    if (!f) return;
    const opts = f.options ?? [];
    editField(fieldId, "options", [...opts, `Option ${opts.length + 1}`]);
  };
  const removeOption = (fieldId: string, idx: number) => {
    const f = fields.find(x => x.id === fieldId);
    if (!f) return;
    const opts = f.options ?? [];
    if (opts.length <= 1) return; // keep at least one
    editField(fieldId, "options", opts.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3 pt-2">
      <Field label="Form title">
        <Inp value={(block.data.title as string) || ""} onChange={e => updateBlock(block.id, { title: e.target.value })} placeholder="Contact Me" />
      </Field>

      {/* Fields list */}
      <div className="space-y-2">
        {fields.map((field, i) => (
          <div key={field.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-2.5 space-y-2 group relative">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Field {i + 1}</span>
              <button onClick={() => removeField(field.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/10">
                <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
              </button>
            </div>
            {/* Type */}
            <div>
              <label className={LBL}>Type</label>
              <select value={field.type} onChange={e => editField(field.id, "type", e.target.value)} className={INP}>
                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {/* Label */}
            <Inp value={field.label} onChange={e => editField(field.id, "label", e.target.value)} placeholder="Label" />
            {/* Placeholder — hidden for checkbox + date (no UX there) */}
            {!TYPES_WITHOUT_PLACEHOLDER.has(field.type) && (
              <Inp
                value={field.placeholder}
                onChange={e => editField(field.id, "placeholder", e.target.value)}
                placeholder={
                  field.type === "select" || field.type === "radio"
                    ? "Prompt (e.g. Select one…)"
                    : "Placeholder text"
                }
              />
            )}

            {/* Options — for Dropdown + Radio */}
            {TYPES_WITH_OPTIONS.has(field.type) && (
              <div className="space-y-1.5 pt-1.5 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className={LBL}>Options</label>
                  <span className="text-[9px] text-zinc-600">{field.options?.length ?? 0} item{(field.options?.length ?? 0) === 1 ? "" : "s"}</span>
                </div>
                {(field.options ?? []).map((opt, idx) => (
                  <div key={idx} className="flex gap-1.5 items-center">
                    <Inp
                      value={opt}
                      onChange={e => editOption(field.id, idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                    />
                    <button
                      onClick={() => removeOption(field.id, idx)}
                      disabled={(field.options?.length ?? 0) <= 1}
                      title={(field.options?.length ?? 0) <= 1 ? "At least one option is required" : "Remove option"}
                      className="p-1 rounded hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOption(field.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-zinc-700 text-zinc-500 text-[11px] hover:border-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add option
                </button>
              </div>
            )}

            {/* Required */}
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
              <input type="checkbox" checked={field.required} onChange={e => editField(field.id, "required", e.target.checked)}
                className="accent-indigo-500 rounded w-3 h-3" />
              Required field
            </label>
          </div>
        ))}
      </div>

      <button onClick={addField}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-zinc-700 text-zinc-500 text-xs hover:border-indigo-500 hover:text-indigo-400 transition-colors">
        <Plus className="w-3 h-3" /> Add field
      </button>

      <Field label="Submit button label">
        <Inp value={(block.data.submitLabel as string) || ""} onChange={e => updateBlock(block.id, { submitLabel: e.target.value })} placeholder="Send" />
      </Field>
    </div>
  );
}

function MapEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const [infoOpen, setInfoOpen] = useState(false);
  const up = (k: string, v: string) => updateBlock(block.id, { [k]: v });
  const address = (block.data.address as string) || "";
  const placeId  = (block.data.placeId  as string) || "";

  return (
    <div className="space-y-2 pt-2">
      <Field label="Address or location">
        <Inp value={address} onChange={e => up("address", e.target.value)} placeholder="San Francisco, CA" />
      </Field>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={LBL}>Place ID (optional)</label>
          <button onClick={() => setInfoOpen(o => !o)} title="What's a Place ID?"
            className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <Info className="w-3 h-3" />
          </button>
        </div>
        {infoOpen && (
          <div className="mb-2 bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-[10px] text-zinc-400 leading-relaxed space-y-1">
            <p>A Place ID pinpoints a specific business or landmark. Get yours at:</p>
            <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-indigo-400 hover:underline">
              Google Place ID Finder <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
        <Inp value={placeId} onChange={e => up("placeId", e.target.value)} placeholder="ChIJrTLr-GyuEmsRBfy61i59si0" />
      </div>

      {address && (
        <div className="flex items-center gap-1 text-[10px] text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          Live map preview enabled
        </div>
      )}
    </div>
  );
}

function FileEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const up = (k: string, v: string) => updateBlock(block.id, { [k]: v });
  return (
    <div className="space-y-2 pt-2">
      <Field label="File name">
        <Inp value={(block.data.name as string) || ""} onChange={e => up("name", e.target.value)} placeholder="Document.pdf" />
      </Field>
      <Field label="File size / type label">
        <Inp value={(block.data.size as string) || ""} onChange={e => up("size", e.target.value)} placeholder="PDF · 1.2 MB" />
      </Field>
      <Field label="Download URL">
        <Inp type="url" value={(block.data.url as string) || ""} onChange={e => up("url", e.target.value)} placeholder="https://…/file.pdf" />
      </Field>
    </div>
  );
}

function PopupEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const up = (k: string, v: unknown) => updateBlock(block.id, { [k]: v });

  type PL = { id: string; emoji: string; label: string; url: string };
  type FF = { id: string; type: string; label: string; placeholder: string; required: boolean };

  const FIELD_TYPES = [
    { value: "text",     label: "Short text" },
    { value: "email",    label: "Email"      },
    { value: "phone",    label: "Phone"      },
    { value: "number",   label: "Number"     },
    { value: "textarea", label: "Long text"  },
    { value: "url",      label: "URL"        },
  ];

  const mode = ((block.data.mode as string) || "text") as "text" | "links" | "form";

  const links: PL[] = (block.data.popupLinks as PL[]) ?? [];
  const fields: FF[] = (block.data.fields as FF[]) ?? [
    { id: "f1", type: "text",  label: "Name",  placeholder: "Your name",      required: true },
    { id: "f2", type: "email", label: "Email", placeholder: "your@email.com", required: true },
  ];

  const setLinks   = (next: PL[]) => updateBlock(block.id, { popupLinks: next });
  const addLink    = () => setLinks([...links, { id: `pl${Date.now()}`, emoji: "🔗", label: "New Link", url: "" }]);
  const removeLink = (id: string) => setLinks(links.filter(l => l.id !== id));
  const editLink   = (id: string, key: keyof PL, val: string) =>
    setLinks(links.map(l => l.id === id ? { ...l, [key]: val } : l));

  const setFields   = (next: FF[]) => updateBlock(block.id, { fields: next });
  const addField    = () => setFields([...fields, { id: `f${Date.now()}`, type: "text", label: "New Field", placeholder: "", required: false }]);
  const removeField = (id: string) => setFields(fields.filter(f => f.id !== id));
  const editField   = (id: string, key: string, val: unknown) =>
    setFields(fields.map(f => f.id === id ? { ...f, [key]: val } : f));

  const MODES = [
    { id: "text",  label: "Text",  Icon: Type          },
    { id: "links", label: "Links", Icon: Link2         },
    { id: "form",  label: "Form",  Icon: ClipboardList },
  ] as const;

  return (
    <div className="space-y-3 pt-2">
      <Field label="Trigger button label">
        <Inp value={(block.data.triggerLabel as string) || ""} onChange={e => up("triggerLabel", e.target.value)} placeholder="Open Popup" />
      </Field>

      {/* Mode selector */}
      <div>
        <label className={LBL}>Popup content type</label>
        <div className="grid grid-cols-3 gap-1.5">
          {MODES.map(m => {
            const Icon = m.Icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => up("mode", m.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg border text-[11px] transition-colors ${
                  active
                    ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Popup heading (optional)">
        <Inp value={(block.data.popupTitle as string) || ""} onChange={e => up("popupTitle", e.target.value)} placeholder="Defaults to trigger label" />
      </Field>

      {/* Mode-specific fields */}
      {mode === "text" && (
        <Field label="Popup content">
          <Textarea value={(block.data.content as string) || ""} onChange={e => up("content", e.target.value)} placeholder="Your popup message here." rows={4} />
        </Field>
      )}

      {mode === "links" && (
        <div className="space-y-2">
          {links.length > 0 && links.map((l, i) => (
            <div key={l.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-2.5 space-y-1.5 group relative">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Link {i + 1}</span>
                <button onClick={() => removeLink(l.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/10">
                  <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                </button>
              </div>
              <div className="grid grid-cols-[56px_1fr] gap-1.5">
                <Inp value={l.emoji} onChange={e => editLink(l.id, "emoji", e.target.value)} maxLength={4} />
                <Inp value={l.label} onChange={e => editLink(l.id, "label", e.target.value)} placeholder="Label" />
              </div>
              <Inp type="url" value={l.url} onChange={e => editLink(l.id, "url", e.target.value)} placeholder="https://…" />
            </div>
          ))}
          <button onClick={addLink}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-zinc-700 text-zinc-500 text-xs hover:border-indigo-500 hover:text-indigo-400 transition-colors">
            <Plus className="w-3 h-3" /> Add link
          </button>
        </div>
      )}

      {mode === "form" && (
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={f.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-2.5 space-y-2 group relative">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Field {i + 1}</span>
                <button onClick={() => removeField(f.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/10">
                  <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                </button>
              </div>
              <div>
                <label className={LBL}>Type</label>
                <select value={f.type} onChange={e => editField(f.id, "type", e.target.value)} className={INP}>
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <Inp value={f.label} onChange={e => editField(f.id, "label", e.target.value)} placeholder="Label" />
              <Inp value={f.placeholder} onChange={e => editField(f.id, "placeholder", e.target.value)} placeholder="Placeholder text" />
              <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                <input type="checkbox" checked={f.required} onChange={e => editField(f.id, "required", e.target.checked)}
                  className="accent-indigo-500 rounded w-3 h-3" />
                Required field
              </label>
            </div>
          ))}
          <button onClick={addField}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-zinc-700 text-zinc-500 text-xs hover:border-indigo-500 hover:text-indigo-400 transition-colors">
            <Plus className="w-3 h-3" /> Add field
          </button>
          <Field label="Submit button label">
            <Inp value={(block.data.submitLabel as string) || ""} onChange={e => up("submitLabel", e.target.value)} placeholder="Send" />
          </Field>
        </div>
      )}
    </div>
  );
}

function AudioEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const up = (k: string, v: string) => updateBlock(block.id, { [k]: v });
  const url = (block.data.url as string) || "";

  // Inline Spotify detector (matches the helper in BlockRenderer.tsx).
  // Accepts share URLs and pasted <iframe src="…"> embed snippets.
  const spotifyEmbed = (() => {
    if (!url) return null;
    const fromSrc = url.match(/src=["'](https?:\/\/open\.spotify\.com\/[^"']+)["']/)?.[1];
    const target  = fromSrc ?? url;
    const m = target.match(/open\.spotify\.com\/(?:embed\/)?(track|album|playlist|episode|show|artist)\/([a-zA-Z0-9]+)/);
    if (!m) return null;
    return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`;
  })();

  return (
    <div className="space-y-2 pt-2">
      <Field label="Track title">
        <Inp value={(block.data.title as string) || ""} onChange={e => up("title", e.target.value)} placeholder="Audio Track" />
      </Field>
      <Field label="Audio URL or Spotify link / embed code">
        <Inp
          type="text"
          value={url}
          onChange={e => up("url", e.target.value)}
          placeholder="https://open.spotify.com/track/… or https://…/audio.mp3"
        />
      </Field>
      {url && spotifyEmbed && (
        <p className="text-[10px] text-green-400">✓ Spotify {spotifyEmbed.includes("/track/") ? "track" : spotifyEmbed.includes("/album/") ? "album" : spotifyEmbed.includes("/playlist/") ? "playlist" : spotifyEmbed.includes("/episode/") ? "episode" : spotifyEmbed.includes("/show/") ? "show" : "link"} detected</p>
      )}
    </div>
  );
}

function ButtonEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const up = (k: string, v: string) => updateBlock(block.id, { [k]: v });
  return (
    <div className="space-y-2 pt-2">
      <Field label="Button label">
        <Inp value={(block.data.label as string) || ""} onChange={e => up("label", e.target.value)} placeholder="Click Me" />
      </Field>
      <Field label="URL (optional)">
        <Inp type="url" value={(block.data.url as string) || ""} onChange={e => up("url", e.target.value)} placeholder="https://…" />
      </Field>
      <Field label="Subtitle (optional)">
        <Inp value={(block.data.description as string) || ""} onChange={e => up("description", e.target.value)} placeholder="Short description below label" />
      </Field>
    </div>
  );
}

function VideoEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const up = (k: string, v: string) => updateBlock(block.id, { [k]: v });
  const url = (block.data.url as string) || "";
  const isYT = /youtube\.com|youtu\.be/.test(url);
  const isVM = /vimeo\.com/.test(url);
  return (
    <div className="space-y-2 pt-2">
      <Field label="Video URL (YouTube or Vimeo)">
        <Inp type="url" value={url} onChange={e => up("url", e.target.value)} placeholder="https://youtube.com/watch?v=…" />
      </Field>
      {url && (isYT || isVM) && (
        <p className="text-[10px] text-green-400">✓ {isYT ? "YouTube" : "Vimeo"} link detected — preview live in canvas</p>
      )}
      <Field label="Fallback title">
        <Inp value={(block.data.title as string) || ""} onChange={e => up("title", e.target.value)} placeholder="My Video" />
      </Field>
    </div>
  );
}

function CardEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const up = (k: string, v: string) => updateBlock(block.id, { [k]: v });
  return (
    <div className="space-y-2 pt-2">
      <Field label="Card title">
        <Inp value={(block.data.title as string) || ""} onChange={e => up("title", e.target.value)} placeholder="Card Title" />
      </Field>
      <Field label="Description">
        <Textarea value={(block.data.description as string) || ""} onChange={e => up("description", e.target.value)} placeholder="Short description…" rows={2} />
      </Field>
      <Field label="Cover image URL (optional)">
        <Inp type="url" value={(block.data.image as string) || ""} onChange={e => up("image", e.target.value)} placeholder="https://…/image.jpg" />
      </Field>
      {!!block.data.image && (
        <img src={block.data.image as string} alt="preview" className="w-full h-20 object-cover rounded-lg border border-zinc-700" />
      )}
      <Field label="CTA button label (optional)">
        <Inp value={(block.data.ctaLabel as string) || ""} onChange={e => up("ctaLabel", e.target.value)} placeholder="Learn More" />
      </Field>
      <Field label="CTA URL (optional)">
        <Inp type="url" value={(block.data.ctaUrl as string) || ""} onChange={e => up("ctaUrl", e.target.value)} placeholder="https://…" />
      </Field>
    </div>
  );
}

function CarouselEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const [newSrc, setNewSrc] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const slides = (block.data.images as { src: string; caption: string }[]) ?? [];

  const addSlide = () => {
    if (!newSrc.trim()) return;
    updateBlock(block.id, { images: [...slides, { src: newSrc.trim(), caption: newCaption }] });
    setNewSrc(""); setNewCaption("");
  };

  const removeSlide = (i: number) => updateBlock(block.id, { images: slides.filter((_, j) => j !== i) });

  const updateSlide = (i: number, key: "src" | "caption", val: string) => {
    const next = slides.map((s, j) => j === i ? { ...s, [key]: val } : s);
    updateBlock(block.id, { images: next });
  };

  return (
    <div className="space-y-3 pt-2">
      {slides.length > 0 && (
        <div className="space-y-2">
          {slides.map((s, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 p-2.5 space-y-1.5 group relative">
              <button onClick={() => removeSlide(i)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/10">
                <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
              </button>
              {s.src && (
                <img src={s.src} alt={s.caption} className="w-full h-16 object-cover rounded-lg" />
              )}
              <Inp value={s.src} onChange={e => updateSlide(i, "src", e.target.value)} placeholder="Image URL" />
              <Inp value={s.caption} onChange={e => updateSlide(i, "caption", e.target.value)} placeholder="Caption (optional)" />
            </div>
          ))}
        </div>
      )}
      <div className="bg-zinc-900/60 rounded-xl border border-dashed border-zinc-700 p-2.5 space-y-1.5">
        <p className={LBL}>Add slide</p>
        <Inp type="url" value={newSrc} onChange={e => setNewSrc(e.target.value)} placeholder="Image URL" />
        <Inp value={newCaption} onChange={e => setNewCaption(e.target.value)} placeholder="Caption (optional)" />
        <button onClick={addSlide}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors mt-1">
          <Plus className="w-3 h-3" /> Add slide
        </button>
      </div>
    </div>
  );
}

function AccordionEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const items = (block.data.items as { title: string; content: string }[]) ?? [];

  const addItem = () => {
    if (!newTitle.trim()) return;
    updateBlock(block.id, { items: [...items, { title: newTitle, content: newContent }] });
    setNewTitle(""); setNewContent("");
  };

  const removeItem = (i: number) => updateBlock(block.id, { items: items.filter((_, j) => j !== i) });

  const updateItem = (i: number, key: "title" | "content", val: string) => {
    const next = items.map((it, j) => j === i ? { ...it, [key]: val } : it);
    updateBlock(block.id, { items: next });
  };

  return (
    <div className="space-y-3 pt-2">
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 p-2.5 space-y-1.5 group relative">
              <button onClick={() => removeItem(i)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/10">
                <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
              </button>
              <Inp value={item.title} onChange={e => updateItem(i, "title", e.target.value)} placeholder="Item title" />
              <Textarea value={item.content} onChange={e => updateItem(i, "content", e.target.value)} placeholder="Item content…" rows={2} />
            </div>
          ))}
        </div>
      )}
      <div className="bg-zinc-900/60 rounded-xl border border-dashed border-zinc-700 p-2.5 space-y-1.5">
        <p className={LBL}>Add item</p>
        <Inp value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Item title" />
        <Textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Item content…" rows={2} />
        <button onClick={addItem}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors mt-1">
          <Plus className="w-3 h-3" /> Add item
        </button>
      </div>
    </div>
  );
}

function SpaceEditor({ block }: { block: Block }) {
  const { updateBlock } = useBuilderStore();
  const height = (block.data.height as number) || 24;
  return (
    <div className="pt-2 space-y-2">
      <div className="flex items-center justify-between">
        <label className={LBL}>Height</label>
        <span className="text-xs text-zinc-300">{height}px</span>
      </div>
      <input
        type="range" min={4} max={120} step={4} value={height}
        onChange={e => updateBlock(block.id, { height: Number(e.target.value) })}
        className="w-full accent-indigo-500"
      />
      <div className="flex justify-between text-[10px] text-zinc-600">
        <span>4px</span><span>120px</span>
      </div>
    </div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────
function BlockEditForm({ block }: { block: Block }) {
  switch (block.type) {
    case "profile":     return <ProfileEditor     block={block} />;
    case "social":      return <SocialEditor      block={block} />;
    case "link":        return <LinkEditor        block={block} />;
    case "text":        return <TextEditor        block={block} />;
    case "divider":     return <DividerEditor     block={block} />;
    case "photo":       return <PhotoEditor       block={block} />;
    case "testimonial": return <TestimonialEditor block={block} />;
    case "timeline":    return <TimelineEditor    block={block} />;
    case "form":        return <FormEditor        block={block} />;
    case "map":         return <MapEditor         block={block} />;
    case "file":        return <FileEditor        block={block} />;
    case "popup":       return <PopupEditor       block={block} />;
    case "audio":       return <AudioEditor       block={block} />;
    case "button":      return <ButtonEditor      block={block} />;
    case "video":       return <VideoEditor       block={block} />;
    case "card":        return <CardEditor        block={block} />;
    case "carousel":    return <CarouselEditor    block={block} />;
    case "accordion":   return <AccordionEditor   block={block} />;
    case "space":       return <SpaceEditor       block={block} />;
    default:
      return (
        <div className="flex flex-col items-center gap-2 py-5 text-center">
          <Wand2 className="w-5 h-5 text-zinc-600" />
          <p className="text-xs text-zinc-500">Editor coming soon</p>
        </div>
      );
  }
}

// ─── Block list item ──────────────────────────────────────────────────────────
function BlockItem({ block }: { block: Block }) {
  const { removeBlock, toggleBlockVisibility } = useBuilderStore();
  const [expanded, setExpanded] = useState(false);
  const Icon = BLOCK_ICONS[block.type] || UserRound;
  const colorClass = BLOCK_COLORS[block.type] || "text-zinc-400";

  const label = (() => {
    if (block.type === "link") return (block.data.label as string) || "Link";
    if (block.type === "button") return (block.data.label as string) || "Button";
    if (block.type === "audio") return (block.data.title as string) || "Audio";
    if (block.type === "video") return (block.data.title as string) || "Video";
    if (block.type === "card")  return (block.data.title as string) || "Card";
    return BLOCK_LABEL[block.type] || block.type;
  })();

  return (
    <Reorder.Item value={block} className="cursor-default">
      <motion.div
        layout
        className={`bg-zinc-900 rounded-xl border overflow-hidden transition-colors ${
          expanded ? "border-zinc-600" : "border-zinc-800 hover:border-zinc-700"
        }`}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab flex-shrink-0 active:cursor-grabbing" />
          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${colorClass}`} />
          <span className="text-xs text-zinc-300 flex-1 truncate">{label}</span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => toggleBlockVisibility(block.id)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              title={block.visible ? "Hide" : "Show"}
            >
              {block.visible
                ? <Eye className="w-3 h-3 text-zinc-500" />
                : <EyeOff className="w-3 h-3 text-zinc-600" />}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              title={expanded ? "Collapse" : "Edit"}
            >
              {expanded
                ? <ChevronUp className="w-3 h-3 text-zinc-400" />
                : <ChevronDown className="w-3 h-3 text-zinc-500" />}
            </button>
            <button
              onClick={() => { removeBlock(block.id); toast.success(`${label} removed`); }}
              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              title="Remove block"
            >
              <Trash2 className="w-3 h-3 text-zinc-600 hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-zinc-800 px-3 pb-3"
            >
              <BlockEditForm block={block} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reorder.Item>
  );
}

// ─── ContentPanel ─────────────────────────────────────────────────────────────
export function ContentPanel() {
  const { blocks, reorderBlocks } = useBuilderStore();

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3.5 border-b border-zinc-800 flex-shrink-0">
        <h2 className="text-sm text-white">Page Content</h2>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          {blocks.length} block{blocks.length !== 1 ? "s" : ""} · drag to reorder · expand to edit
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "none" }}>
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
            <p className="text-zinc-600 text-sm">No blocks yet</p>
            <p className="text-zinc-700 text-xs">Use "Add block" in the left sidebar</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={blocks}
            onReorder={reorderBlocks}
            className="space-y-2"
          >
            {blocks.map(block => <BlockItem key={block.id} block={block} />)}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}