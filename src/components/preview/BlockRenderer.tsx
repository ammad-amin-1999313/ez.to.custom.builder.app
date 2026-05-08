"use client";

import { useState } from "react";
import { Block, Profile, Appearance } from "../../store/builderStore";
import {
  Twitter, Instagram, Linkedin, Youtube, Github, Globe, Facebook, Twitch,
  Minus, FileText, Link2, MessageSquare, MapPin, Image as ImageIcon,
  X as XIcon, Headphones, Video, ChevronDown, Square, GalleryHorizontal,
  ExternalLink, Star,
} from "lucide-react";

// ─── Style helpers ────────────────────────────────────────────────────────────
function shadowCSS(type: string, color = "#000"): string {
  switch (type) {
    case "Soft":     return `0 2px 8px ${color}33`;
    case "Medium":   return `0 4px 16px ${color}44`;
    case "Hard":     return `0 6px 20px ${color}55`;
    case "Elevated": return `0 12px 40px ${color}66`;
    default:         return "none";
  }
}

function borderCSS(type: string, color: string, width: number): string {
  if (!type || type === "None") return "none";
  return `${Math.max(1, width)}px ${type.toLowerCase()} ${color}`;
}

function toFlexAlign(a: string): string {
  return a === "Left" ? "flex-start" : a === "Right" ? "flex-end" : "center";
}

function toTextAlign(a: string): "left" | "center" | "right" {
  return a === "Left" ? "left" : a === "Right" ? "right" : "center";
}

// Typed helpers to read from appearance.blockStyles
function bsStr(a: Appearance, bt: string, key: string, fb: string): string {
  const v = a.blockStyles?.[bt]?.[key];
  return typeof v === "string" ? v : fb;
}
function bsNum(a: Appearance, bt: string, key: string, fb: number): number {
  const v = a.blockStyles?.[bt]?.[key];
  return typeof v === "number" ? v : fb;
}
function bsBool(a: Appearance, bt: string, key: string, fb: boolean): boolean {
  const v = a.blockStyles?.[bt]?.[key];
  return typeof v === "boolean" ? v : fb;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const SocialIcon = ({ platform }: { platform: string }) => {
  const map: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    twitter: Twitter, instagram: Instagram, linkedin: Linkedin,
    youtube: Youtube, github: Github, facebook: Facebook, twitch: Twitch, globe: Globe,
  };
  const Icon = map[platform.toLowerCase()] || Globe;
  return <Icon className="w-4 h-4" />;
};

function getVideoEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

// Accepts either a Spotify share URL (https://open.spotify.com/track/...)
// or a pasted embed-iframe HTML snippet. Returns the canonical embed URL
// (with Spotify's dark theme) or null if not Spotify.
export function getSpotifyEmbed(input: string): string | null {
  if (!input) return null;
  // If user pasted the full <iframe …> snippet, pull the src out first.
  const fromSrc = input.match(/src=["'](https?:\/\/open\.spotify\.com\/[^"']+)["']/)?.[1];
  const target  = fromSrc ?? input;
  const m = target.match(/open\.spotify\.com\/(?:embed\/)?(track|album|playlist|episode|show|artist)\/([a-zA-Z0-9]+)/);
  if (!m) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`;
}

// ─── AccordionBlock ───────────────────────────────────────────────────────────
function AccordionBlock({ block, appearance, compact, btnRadius }: {
  block: Block; appearance: Appearance; compact?: boolean; btnRadius: string;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const { textColor, accentColor } = appearance;
  const items = (block.data.items as { title: string; content: string }[]) ?? [];

  const bgColor     = bsStr(appearance, "accordion", "bgColor",     `${textColor}07`);
  const labelColor  = bsStr(appearance, "accordion", "labelColor",  textColor);
  const descColor   = bsStr(appearance, "accordion", "descColor",   `${textColor}90`);
  const iconColor   = bsStr(appearance, "accordion", "iconColor",   accentColor);
  const borderType  = bsStr(appearance, "accordion", "borderType",  "None");
  const borderColor = bsStr(appearance, "accordion", "borderColor", `${textColor}15`);
  const borderWidth = bsNum(appearance, "accordion", "borderWidth", 1);
  const cornerR     = bsNum(appearance, "accordion", "cornerRadius", 10);
  const shadow      = bsBool(appearance, "accordion", "shadow",      false);

  const border    = borderCSS(borderType, borderColor, borderWidth);
  const boxShadow = shadow ? shadowCSS(appearance.shadowType, appearance.shadowColor) : "none";

  if (items.length === 0) {
    return <div style={{ padding: 12, textAlign: "center" }}>
      <p style={{ fontSize: compact ? 9 : 11, color: textColor, opacity: 0.4 }}>No items yet</p>
    </div>;
  }

  return (
    <div className="space-y-1.5">
      {items.slice(0, compact ? 2 : items.length).map((item, i) => (
        <div key={i} style={{ borderRadius: compact ? 6 : cornerR, backgroundColor: bgColor, border, boxShadow, overflow: "hidden" }}>
          <div
            style={{ padding: compact ? "6px 10px" : "11px 14px", cursor: compact ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            onClick={() => !compact && setOpenIdx(openIdx === i ? null : i)}
          >
            <p style={{ fontSize: compact ? 9 : 13, color: labelColor, fontWeight: 500 }}>{item.title}</p>
            {!compact && (
              <ChevronDown style={{ width: 14, height: 14, color: iconColor, transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }} />
            )}
          </div>
          {!compact && openIdx === i && item.content && (
            <div style={{ padding: "0 14px 12px", paddingTop: 8, fontSize: 12, color: descColor, lineHeight: 1.65, borderTop: `1px solid ${textColor}08` }}>
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── PopupBlock ───────────────────────────────────────────────────────────────
function PopupBlock({ block, appearance, compact, btnRadius }: {
  block: Block; appearance: Appearance; compact?: boolean; btnRadius: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Per-field state for the popup form (mode === "form"), keyed by field.id.
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});
  const setFormField = (id: string, val: string | boolean) =>
    setFormValues((prev) => ({ ...prev, [id]: val }));
  const { textColor, accentColor } = appearance;

  const align       = bsStr(appearance, "popup", "alignment",  "Center");
  const bgColor     = bsStr(appearance, "popup", "bgColor",     accentColor);
  const labelColor  = bsStr(appearance, "popup", "labelColor",  "#ffffff");
  const descColor   = bsStr(appearance, "popup", "descColor",   "rgba(255,255,255,0.65)");
  const borderType  = bsStr(appearance, "popup", "borderType",  "None");
  const borderColor = bsStr(appearance, "popup", "borderColor", accentColor);
  const borderWidth = bsNum(appearance, "popup", "borderWidth", 0);
  const cornerR     = bsNum(appearance, "popup", "cornerRadius", 12);
  const shadow      = bsBool(appearance, "popup", "shadow",      false);
  const popupBg     = bsStr(appearance, "popup", "popupBgColor",     "#ffffff");
  const popupTitle  = bsStr(appearance, "popup", "popupTitleColor",  "#111111");
  const popupR      = bsNum(appearance, "popup", "popupCornerRadius", 16);
  const closeColor  = bsStr(appearance, "popup", "popupCloseBtnColor","#6b7280");

  const border    = borderCSS(borderType, borderColor, borderWidth);
  const boxShadow = shadow ? shadowCSS(appearance.shadowType, appearance.shadowColor) : "none";

  const mode = ((block.data.mode as string) || "text") as "text" | "links" | "form";
  const triggerLabel = (block.data.triggerLabel as string) || "Open Popup";
  const heading = (block.data.popupTitle as string) || triggerLabel;

  type PL = { id: string; emoji: string; label: string; url: string };
  type FF = { id: string; type: string; label: string; placeholder: string; required: boolean; options?: string[] };
  const popupLinks = (block.data.popupLinks as PL[]) ?? [];
  const fields = (block.data.fields as FF[]) ?? [];

  return (
    <>
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        style={{ backgroundColor: bgColor, borderRadius: `${cornerR}px`, padding: compact ? "8px 12px" : "11px 16px", border, boxShadow, justifyContent: toFlexAlign(align) }}
        onClick={() => !compact && setOpen(true)}
      >
        <MessageSquare style={{ width: compact ? 12 : 18, height: compact ? 12 : 18, color: labelColor, flexShrink: 0 }} />
        <p style={{ fontSize: compact ? 9 : 13, color: labelColor }}>
          {triggerLabel}
        </p>
        {!compact && block.data.description && (
          <p style={{ fontSize: 11, color: descColor }}>{block.data.description as string}</p>
        )}
      </div>

      {!compact && open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.65)" }} onClick={() => { setOpen(false); setSubmitted(false); setFormValues({}); }}>
          <div className="relative w-full max-w-sm shadow-2xl" style={{ backgroundColor: popupBg, borderRadius: popupR, padding: 28, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setOpen(false); setSubmitted(false); setFormValues({}); }} className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f3f4f6" }}>
              <XIcon className="w-3.5 h-3.5" style={{ color: closeColor }} />
            </button>

            <p style={{ color: popupTitle, fontSize: 16, fontWeight: 600, marginBottom: mode === "text" ? 10 : 14, paddingRight: 28 }}>
              {heading}
            </p>

            {mode === "text" && (
              <p style={{ color: popupTitle, fontSize: 14, lineHeight: 1.65, opacity: 0.7 }}>
                {(block.data.content as string) || "Your popup message here."}
              </p>
            )}

            {mode === "links" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {popupLinks.length === 0 && (
                  <p style={{ color: popupTitle, fontSize: 13, opacity: 0.5 }}>No links added yet</p>
                )}
                {popupLinks.map(l => (
                  <a key={l.id} href={l.url || "#"} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, backgroundColor: accentColor, textDecoration: "none" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{l.emoji || "🔗"}</span>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 500, flex: 1 }}>{l.label || "Link"}</span>
                    <ExternalLink style={{ width: 12, height: 12, color: "rgba(255,255,255,0.65)", flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            )}

            {mode === "form" && (
              submitted ? (
                <p style={{ color: popupTitle, fontSize: 14, opacity: 0.7, padding: "16px 0" }}>
                  Thanks — your message has been sent.
                </p>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {fields.length === 0 && (
                    <p style={{ color: popupTitle, fontSize: 13, opacity: 0.5 }}>No fields added yet</p>
                  )}
                  {fields.map(f => {
                    const baseInputStyle: React.CSSProperties = {
                      width: "100%",
                      boxSizing: "border-box",
                      borderRadius: 8,
                      border: `1px solid ${popupTitle}22`,
                      backgroundColor: `${popupTitle}06`,
                      padding: "8px 10px",
                      fontSize: 13,
                      color: popupTitle,
                      outline: "none",
                      fontFamily: "inherit",
                    };

                    const labelEl = (
                      <label style={{ fontSize: 11, color: popupTitle, opacity: 0.75, display: "block", marginBottom: 4, fontWeight: 500 }}>
                        {f.label}{f.required && <span style={{ color: accentColor, marginLeft: 2 }}>*</span>}
                      </label>
                    );

                    if (f.type === "textarea") {
                      return (
                        <div key={f.id}>
                          {labelEl}
                          <textarea
                            required={f.required}
                            placeholder={f.placeholder}
                            rows={3}
                            value={(formValues[f.id] as string) ?? ""}
                            onChange={(e) => setFormField(f.id, e.target.value)}
                            style={{ ...baseInputStyle, resize: "none" }}
                          />
                        </div>
                      );
                    }

                    if (f.type === "select") {
                      return (
                        <div key={f.id}>
                          {labelEl}
                          <select
                            required={f.required}
                            value={(formValues[f.id] as string) ?? ""}
                            onChange={(e) => setFormField(f.id, e.target.value)}
                            style={{ ...baseInputStyle, appearance: "auto" }}
                          >
                            <option value="" disabled>{f.placeholder || "Select…"}</option>
                            {(f.options ?? []).map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    if (f.type === "radio") {
                      return (
                        <div key={f.id}>
                          {labelEl}
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 2 }}>
                            {(f.options ?? []).map((opt, i) => (
                              <label
                                key={i}
                                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: popupTitle, cursor: "pointer" }}
                              >
                                <input
                                  type="radio"
                                  name={f.id}
                                  value={opt}
                                  required={f.required && i === 0}
                                  checked={formValues[f.id] === opt}
                                  onChange={() => setFormField(f.id, opt)}
                                  style={{ accentColor }}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (f.type === "checkbox") {
                      return (
                        <div key={f.id}>
                          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: popupTitle, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              required={f.required}
                              checked={!!formValues[f.id]}
                              onChange={(e) => setFormField(f.id, e.target.checked)}
                              style={{ accentColor }}
                            />
                            {f.label}
                            {f.required && <span style={{ color: accentColor, marginLeft: 2 }}>*</span>}
                          </label>
                        </div>
                      );
                    }

                    if (f.type === "date") {
                      return (
                        <div key={f.id}>
                          {labelEl}
                          <input
                            type="date"
                            required={f.required}
                            value={(formValues[f.id] as string) ?? ""}
                            onChange={(e) => setFormField(f.id, e.target.value)}
                            style={baseInputStyle}
                          />
                        </div>
                      );
                    }

                    // Default: text-style inputs (text, email, phone, number, url)
                    return (
                      <div key={f.id}>
                        {labelEl}
                        <input
                          type={f.type}
                          required={f.required}
                          placeholder={f.placeholder}
                          value={(formValues[f.id] as string) ?? ""}
                          onChange={(e) => setFormField(f.id, e.target.value)}
                          style={baseInputStyle}
                        />
                      </div>
                    );
                  })}
                  {fields.length > 0 && (
                    <button
                      type="submit"
                      style={{ marginTop: 4, padding: "10px 16px", borderRadius: 8, backgroundColor: accentColor, color: "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer" }}
                    >
                      {(block.data.submitLabel as string) || "Send"}
                    </button>
                  )}
                </form>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── FormBlock ───────────────────────────────────────────────────────────────
// Real, working form. Each field's value is held in `values` keyed by field.id,
// so every field has its own independent state — typing in one doesn't bleed
// into the others.
function FormBlock({ block, appearance, compact, btnRadius }: {
  block: Block; appearance: Appearance; compact?: boolean; btnRadius: string;
}) {
  type FF = {
    id: string;
    type: string;
    label: string;
    placeholder: string;
    required: boolean;
    options?: string[];
  };

  const { textColor, accentColor, shadowType, shadowColor } = appearance;
  const radius = btnRadius;

  const fields: FF[] = (block.data.fields as FF[]) ?? [
    { id: "f1", type: "text",     label: "Name",    placeholder: "Your name",       required: true  },
    { id: "f2", type: "email",    label: "Email",   placeholder: "your@email.com",  required: true  },
    { id: "f3", type: "textarea", label: "Message", placeholder: "Your message…",   required: false },
  ];

  // Per-field state, keyed by field.id.
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const setField = (id: string, val: string | boolean) =>
    setValues((prev) => ({ ...prev, [id]: val }));

  // ── Appearance reads ──
  const inputLabelC  = bsStr(appearance, "form", "inputLabelColor",   textColor);
  const inputBg      = bsStr(appearance, "form", "inputBgColor",      `${textColor}07`);
  const inputBrdType = bsStr(appearance, "form", "inputBorderType",   "Solid");
  const inputBrdC    = bsStr(appearance, "form", "inputBorderColor",  `${textColor}18`);
  const inputBrdW    = bsNum(appearance, "form", "inputBorderWidth",  1);
  const inputR       = bsNum(appearance, "form", "inputCornerRadius", 8);
  const inputShadow  = bsBool(appearance, "form", "inputShadow",      false);

  const btnTextC  = bsStr(appearance, "form", "formBtnTextColor",     "#ffffff");
  const btnBg     = bsStr(appearance, "form", "formBtnBgColor",       accentColor);
  const btnBrdT   = bsStr(appearance, "form", "formBtnBorderType",    "None");
  const btnBrdC   = bsStr(appearance, "form", "formBtnBorderColor",   accentColor);
  const btnBrdW   = bsNum(appearance, "form", "formBtnBorderWidth",   0);
  const btnR      = bsNum(appearance, "form", "formBtnCornerRadius",  8);
  const btnShadow = bsBool(appearance, "form", "formBtnShadow",       false);

  const inputBorder    = borderCSS(inputBrdType, inputBrdC, inputBrdW);
  const inputBoxShadow = inputShadow ? shadowCSS(shadowType, shadowColor) : "none";
  const btnBorder      = borderCSS(btnBrdT, btnBrdC, btnBrdW);
  const btnBoxShadow   = btnShadow ? shadowCSS(shadowType, shadowColor) : "none";

  const fieldInputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: inputR,
    border: inputBorder,
    backgroundColor: inputBg,
    boxShadow: inputBoxShadow,
    padding: "8px 12px",
    fontSize: 13,
    color: textColor,
    outline: "none",
    fontFamily: "inherit",
  };

  // Compact preview (mini canvas) — keep the existing visual mockup, no inputs.
  if (compact) {
    return (
      <div style={{ backgroundColor: `${textColor}05`, borderRadius: radius, padding: "10px 12px" }}>
        <p style={{ fontSize: 9, color: textColor, fontWeight: 500 }}>
          {(block.data.title as string) || "Contact Me"}
        </p>
        {fields.slice(0, 2).map((f) => (
          <div key={f.id} style={{ height: 12, borderRadius: 4, backgroundColor: `${textColor}10`, marginTop: 6 }} />
        ))}
        <div style={{ height: 12, width: "60%", borderRadius: 4, backgroundColor: `${btnBg}55`, marginTop: 8 }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: `${textColor}05`, borderRadius: radius, padding: 16 }}>
      <p style={{ fontSize: 15, color: textColor, fontWeight: 600, marginBottom: 14 }}>
        {(block.data.title as string) || "Contact Me"}
      </p>

      {submitted ? (
        <p style={{ fontSize: 13, color: textColor, opacity: 0.7, padding: "12px 0" }}>
          Thanks — your form has been received.
        </p>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {fields.map((f) => {
            const labelEl = (
              <label style={{ fontSize: 11, color: inputLabelC, display: "block", marginBottom: 4, fontWeight: 500, opacity: 0.8 }}>
                {f.label}
                {f.required && <span style={{ color: accentColor, marginLeft: 2 }}>*</span>}
              </label>
            );

            if (f.type === "textarea") {
              return (
                <div key={f.id}>
                  {labelEl}
                  <textarea
                    required={f.required}
                    placeholder={f.placeholder}
                    rows={3}
                    value={(values[f.id] as string) ?? ""}
                    onChange={(e) => setField(f.id, e.target.value)}
                    style={{ ...fieldInputStyle, resize: "none" }}
                  />
                </div>
              );
            }

            if (f.type === "select") {
              return (
                <div key={f.id}>
                  {labelEl}
                  <select
                    required={f.required}
                    value={(values[f.id] as string) ?? ""}
                    onChange={(e) => setField(f.id, e.target.value)}
                    style={{ ...fieldInputStyle, appearance: "auto" }}
                  >
                    <option value="" disabled>{f.placeholder || "Select…"}</option>
                    {(f.options ?? []).map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            }

            if (f.type === "radio") {
              return (
                <div key={f.id}>
                  {labelEl}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 2 }}>
                    {(f.options ?? []).map((opt, i) => (
                      <label
                        key={i}
                        style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: textColor, cursor: "pointer" }}
                      >
                        <input
                          type="radio"
                          name={f.id}
                          value={opt}
                          required={f.required && i === 0}
                          checked={values[f.id] === opt}
                          onChange={() => setField(f.id, opt)}
                          style={{ accentColor }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              );
            }

            if (f.type === "checkbox") {
              return (
                <div key={f.id}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: textColor, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      required={f.required}
                      checked={!!values[f.id]}
                      onChange={(e) => setField(f.id, e.target.checked)}
                      style={{ accentColor }}
                    />
                    {f.label}
                    {f.required && <span style={{ color: accentColor, marginLeft: 2 }}>*</span>}
                  </label>
                </div>
              );
            }

            if (f.type === "date") {
              return (
                <div key={f.id}>
                  {labelEl}
                  <input
                    type="date"
                    required={f.required}
                    value={(values[f.id] as string) ?? ""}
                    onChange={(e) => setField(f.id, e.target.value)}
                    style={fieldInputStyle}
                  />
                </div>
              );
            }

            // Default: text-style inputs (text, email, phone, number, url)
            return (
              <div key={f.id}>
                {labelEl}
                <input
                  type={f.type}
                  required={f.required}
                  placeholder={f.placeholder}
                  value={(values[f.id] as string) ?? ""}
                  onChange={(e) => setField(f.id, e.target.value)}
                  style={fieldInputStyle}
                />
              </div>
            );
          })}

          <button
            type="submit"
            style={{
              marginTop: 4,
              padding: "10px 16px",
              borderRadius: btnR,
              backgroundColor: btnBg,
              textAlign: "center",
              color: btnTextC,
              fontSize: 13,
              fontWeight: 500,
              border: btnBorder,
              boxShadow: btnBoxShadow,
              cursor: "pointer",
            }}
          >
            {(block.data.submitLabel as string) || "Send"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Main BlockRenderer ───────────────────────────────────────────────────────
interface BlockRendererProps {
  block: Block;
  profile: Profile;
  appearance: Appearance;
  compact?: boolean;
  btnRadius?: string;
}

export function BlockRenderer({ block, profile, appearance, compact, btnRadius }: BlockRendererProps) {
  const { accentColor, textColor, shadowType, shadowColor } = appearance;
  const radius = btnRadius ?? "12px";
  const muted  = { color: textColor, opacity: 0.5 as number };
  const pageShadow = shadowCSS(shadowType, shadowColor);

  if (!block.visible) return null;

  switch (block.type) {

    /* ───────────────────────── PROFILE ──────────────────────────── */
    case "profile": {
      const align         = bsStr(appearance, "profile", "alignment",       "Center");
      const bsText        = bsStr(appearance, "profile", "textColor",       textColor);
      const borderType    = bsStr(appearance, "profile", "photoBorderType", "None");
      const borderColor   = bsStr(appearance, "profile", "photoBorderColor", accentColor);
      const borderWidth   = bsNum(appearance, "profile", "photoBorderWidth",  0);
      const photoRound    = bsNum(appearance, "profile", "photoRoundness",    9999);
      const photoShadow   = bsBool(appearance, "profile", "photoShadow",      false);
      const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase();
      const avatarBorder  = borderCSS(borderType, borderColor, borderWidth);
      const avatarShadow  = photoShadow ? shadowCSS(shadowType, shadowColor) : "none";

      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: toFlexAlign(align), gap: compact ? 6 : 10, paddingTop: compact ? 4 : 12, paddingBottom: compact ? 4 : 12 }}>
          {block.data.showAvatar !== false && (
            <div style={{ width: compact ? 52 : 80, height: compact ? 52 : 80, borderRadius: photoRound, backgroundColor: `${accentColor}18`, border: avatarBorder, boxShadow: avatarShadow, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {profile.image
                ? <img src={profile.image} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: compact ? 16 : 26, color: accentColor }}>{initials || "👤"}</span>}
            </div>
          )}
          {block.data.showName !== false && (
            <div style={{ textAlign: toTextAlign(align) }}>
              <p style={{ fontSize: compact ? 13 : 18, color: bsText, fontWeight: 600, lineHeight: 1.2 }}>
                {profile.firstName} {profile.lastName}
              </p>
              {block.data.showBio !== false && profile.bio && (
                <p style={{ fontSize: compact ? 9 : 12, color: bsText, opacity: 0.6, lineHeight: 1.5, marginTop: compact ? 2 : 4, maxWidth: 240 }}>
                  {profile.bio}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    /* ───────────────────────── SOCIAL ───────────────────────────── */
    case "social": {
      const links      = (block.data.links as { platform: string; url: string; icon: string; customIcon?: string }[]) ?? [];
      const align      = bsStr(appearance, "social", "alignment",  "Center");
      const iconColor  = bsStr(appearance, "social", "iconColor",   accentColor);
      return (
        <div style={{ display: "flex", justifyContent: toFlexAlign(align), flexWrap: "wrap", gap: compact ? 8 : 12, paddingTop: 6, paddingBottom: 6 }}>
          {links.length === 0 && <p style={{ fontSize: compact ? 8 : 11, ...muted }}>Add social links</p>}
          {links.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noreferrer"
              style={{ width: compact ? 28 : 40, height: compact ? 28 : 40, borderRadius: "50%", backgroundColor: `${iconColor}20`, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              {link.customIcon
                ? <img src={link.customIcon} alt={link.platform}
                    style={{ width: compact ? 14 : 20, height: compact ? 14 : 20, objectFit: "contain" }} />
                : <SocialIcon platform={link.icon || link.platform} />}
            </a>
          ))}
        </div>
      );
    }

    /* ───────────────────────── LINK ──────────────────────────────── */
    case "link": {
      const emoji = (block.data.emoji as string) || "🔗";
      return (
        <div style={{ display: "flex", alignItems: "center", gap: compact ? 8 : 12, width: "100%", backgroundColor: accentColor, borderRadius: radius, padding: compact ? "8px 12px" : "12px 16px", cursor: "pointer", boxShadow: pageShadow }}>
          <span style={{ fontSize: compact ? 14 : 18, flexShrink: 0 }}>{emoji}</span>
          <div style={{ flex: 1, textAlign: "left" }}>
            <p style={{ color: "#fff", fontSize: compact ? 11 : 14, fontWeight: 500 }}>
              {(block.data.label as string) || "Link Title"}
            </p>
            {!compact && block.data.description && (
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 }}>
                {block.data.description as string}
              </p>
            )}
          </div>
          <Link2 style={{ flexShrink: 0, width: compact ? 10 : 14, height: compact ? 10 : 14, color: "rgba(255,255,255,0.55)" }} />
        </div>
      );
    }

    /* ───────────────────────── TEXT ──────────────────────────────── */
    case "text": {
      const bsText  = bsStr(appearance, "text", "textColor", textColor);
      return (
        <div style={{ padding: compact ? "4px 2px" : "8px 4px", textAlign: "center" }}>
          <p style={{ fontSize: compact ? 11 : 15, color: bsText, opacity: 0.9, fontWeight: 600, lineHeight: 1.3 }}>
            {(block.data.title as string) || "Heading"}
          </p>
          {block.data.subtitle && (
            <p style={{ fontSize: compact ? 8 : 12, color: bsText, opacity: 0.5, lineHeight: 1.5, marginTop: compact ? 2 : 4 }}>
              {block.data.subtitle as string}
            </p>
          )}
        </div>
      );
    }

    /* ───────────────────────── DIVIDER ───────────────────────────── */
    case "divider": {
      const lineColor = bsStr(appearance, "divider", "lineColor", `${textColor}22`);
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
          <div style={{ flex: 1, height: 1, backgroundColor: lineColor }} />
          {block.data.label && (
            <span style={{ fontSize: compact ? 8 : 11, color: textColor, opacity: 0.4 }}>{block.data.label as string}</span>
          )}
          <div style={{ flex: 1, height: 1, backgroundColor: lineColor }} />
        </div>
      );
    }

    /* ───────────────────────── PHOTO ──────────────────────────────── */
    case "photo": {
      const cornerR     = bsNum(appearance, "photo", "cornerRadius", 12);
      const shadow      = bsBool(appearance, "photo", "shadow",       false);
      const titleColor  = bsStr(appearance, "photo", "titleColor",   textColor);
      const descColor   = bsStr(appearance, "photo", "descColor",    `${textColor}88`);
      const boxShadow   = shadow ? shadowCSS(shadowType, shadowColor) : "none";

      return (
        <div style={{ borderRadius: cornerR, overflow: "hidden", backgroundColor: `${accentColor}10`, boxShadow }}>
          {block.data.src
            ? <img src={block.data.src as string} alt={(block.data.alt as string) || "photo"} style={{ width: "100%", height: compact ? 60 : 160, objectFit: "cover", display: "block" }} />
            : <div style={{ height: compact ? 50 : 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...muted }}>
                <ImageIcon style={{ width: compact ? 16 : 28, height: compact ? 16 : 28 }} />
                {!compact && <p style={{ fontSize: 11, marginTop: 4 }}>Add a photo URL</p>}
              </div>}
          {!compact && (block.data.title || block.data.description) && (
            <div style={{ padding: "10px 14px" }}>
              {block.data.title && <p style={{ fontSize: 13, color: titleColor, fontWeight: 500 }}>{block.data.title as string}</p>}
              {block.data.description && <p style={{ fontSize: 11, color: descColor, marginTop: 3, lineHeight: 1.5 }}>{block.data.description as string}</p>}
            </div>
          )}
        </div>
      );
    }

    /* ───────────────────────── TESTIMONIAL ───────────────────────── */
    case "testimonial": {
      const align       = bsStr(appearance, "testimonial", "alignment",          "Left");
      const primaryC    = bsStr(appearance, "testimonial", "primaryTextColor",   textColor);
      const secondaryC  = bsStr(appearance, "testimonial", "secondaryTextColor", `${textColor}88`);
      const paraC       = bsStr(appearance, "testimonial", "paragraphColor",     `${textColor}cc`);
      const starsC      = bsStr(appearance, "testimonial", "starsColor",         "#f59e0b");
      const rating      = (block.data.rating as number) ?? 5;
      const ta          = toTextAlign(align);

      return (
        <div style={{ padding: compact ? "8px 10px" : "14px 16px", backgroundColor: `${textColor}06`, borderRadius: radius, borderLeft: align === "Left" ? `3px solid ${accentColor}` : "none", textAlign: ta }}>
          {!compact && (
            <div style={{ display: "flex", justifyContent: toFlexAlign(align), gap: 2, marginBottom: 8 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} style={{ width: 12, height: 12, color: i < rating ? starsC : `${starsC}44`, fill: i < rating ? starsC : "transparent" }} />
              ))}
            </div>
          )}
          <p style={{ fontSize: compact ? 9 : 13, color: paraC, fontStyle: "italic", lineHeight: 1.5 }}>
            "{(block.data.quote as string) || "An amazing testimonial."}"
          </p>
          <p style={{ fontSize: compact ? 8 : 12, color: primaryC, fontWeight: 600, marginTop: compact ? 4 : 8 }}>
            — {(block.data.author as string) || "Happy Customer"}
          </p>
          {!compact && block.data.role && (
            <p style={{ fontSize: 10, color: secondaryC, marginTop: 2 }}>{block.data.role as string}</p>
          )}
        </div>
      );
    }

    /* ───────────────────────── TIMELINE ─────────────────────────── */
    case "timeline": {
      const events = (block.data.events as { date: string; title: string; description?: string }[]) ?? [];
      const bulletC = bsStr(appearance, "timeline", "bulletColor", accentColor);
      const lineC   = bsStr(appearance, "timeline", "lineColor",   `${accentColor}30`);
      const titleC  = bsStr(appearance, "timeline", "titleColor",  textColor);
      const descC   = bsStr(appearance, "timeline", "descColor",   `${textColor}80`);
      const dateC   = bsStr(appearance, "timeline", "dateColor",   accentColor);

      return (
        <div style={{ padding: "4px 8px" }}>
          {events.length === 0 && <p style={{ fontSize: compact ? 9 : 11, ...muted }}>No events yet</p>}
          {events.slice(0, compact ? 2 : events.length).map((ev, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: bulletC, flexShrink: 0 }} />
                {i < events.length - 1 && <div style={{ width: 1.5, height: compact ? 12 : 20, backgroundColor: lineC, marginTop: 2 }} />}
              </div>
              <div style={{ paddingBottom: i < events.length - 1 ? (compact ? 8 : 14) : 0 }}>
                <p style={{ fontSize: compact ? 8 : 10, color: dateC }}>{ev.date}</p>
                <p style={{ fontSize: compact ? 9 : 13, color: titleC, fontWeight: 500 }}>{ev.title}</p>
                {!compact && ev.description && <p style={{ fontSize: 11, color: descC, lineHeight: 1.4, marginTop: 2 }}>{ev.description}</p>}
              </div>
            </div>
          ))}
        </div>
      );
    }

    /* ───────────────────────── FORM ─────────────────────────────── */
    case "form":
      return <FormBlock block={block} appearance={appearance} compact={compact} btnRadius={radius} />;

    /* ───────────────────────── MAP ────────────────────────────────── */
    case "map": {
      const address  = (block.data.address as string) || "";
      const placeId  = (block.data.placeId  as string) || "";
      const query    = placeId || address;
      const embedSrc = query ? `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=14&ie=UTF8&iwloc=&output=embed` : "";
      const cornerR  = bsNum(appearance, "map", "cornerRadius", 12);
      const shadow   = bsBool(appearance, "map", "shadow", false);
      const boxShadow = shadow ? shadowCSS(shadowType, shadowColor) : "none";

      if (compact) {
        return (
          <div style={{ height: 52, borderRadius: cornerR, backgroundColor: `${accentColor}12`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, boxShadow }}>
            <MapPin style={{ width: 14, height: 14, color: accentColor }} />
            {address && <p style={{ fontSize: 8, color: textColor, opacity: 0.5 }}>{address}</p>}
          </div>
        );
      }

      return (
        <div style={{ borderRadius: cornerR, overflow: "hidden", border: `1px solid ${textColor}10`, boxShadow }}>
          {embedSrc
            ? <div style={{ height: 180, position: "relative" }}>
                <iframe src={embedSrc} style={{ width: "100%", height: "100%", border: "none", display: "block" }} loading="lazy" title="Map" />
              </div>
            : <div style={{ height: 140, backgroundColor: `${accentColor}10`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <MapPin style={{ width: 22, height: 22, color: accentColor }} />
                <p style={{ fontSize: 12, color: textColor, opacity: 0.45 }}>Add an address to show map</p>
              </div>}
          {address && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: `${textColor}05`, borderTop: `1px solid ${textColor}08` }}>
              <p style={{ fontSize: 12, color: textColor, opacity: 0.7 }}>{address}</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer"
                style={{ fontSize: 11, color: accentColor, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                Open Maps <ExternalLink style={{ width: 10, height: 10 }} />
              </a>
            </div>
          )}
        </div>
      );
    }

    /* ───────────────────────── FILE ──────────────────────────────── */
    case "file": {
      const align      = bsStr(appearance, "file", "alignment",    "Center");
      const bgColor    = bsStr(appearance, "file", "bgColor",      `${textColor}08`);
      const labelC     = bsStr(appearance, "file", "labelColor",   textColor);
      const descC      = bsStr(appearance, "file", "descColor",    `${textColor}80`);
      const iconC      = bsStr(appearance, "file", "iconColor",    accentColor);
      const brdType    = bsStr(appearance, "file", "borderType",   "None");
      const brdColor   = bsStr(appearance, "file", "borderColor",  `${textColor}20`);
      const brdWidth   = bsNum(appearance, "file", "borderWidth",  0);
      const cornerR    = bsNum(appearance, "file", "cornerRadius", 12);
      const shadow     = bsBool(appearance, "file", "shadow",      false);
      const border     = borderCSS(brdType, brdColor, brdWidth);
      const boxShadow  = shadow ? shadowCSS(shadowType, shadowColor) : "none";

      return (
        <a href={(block.data.url as string) || "#"} target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", gap: compact ? 8 : 12, padding: compact ? "8px 10px" : "12px 14px", backgroundColor: bgColor, borderRadius: cornerR, border, boxShadow, textDecoration: "none", justifyContent: toFlexAlign(align) }}>
          <div style={{ width: compact ? 24 : 36, height: compact ? 24 : 36, borderRadius: 8, backgroundColor: `${iconC}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileText style={{ width: compact ? 12 : 18, height: compact ? 12 : 18, color: iconC }} />
          </div>
          <div>
            <p style={{ fontSize: compact ? 9 : 13, color: labelC, fontWeight: 500 }}>{(block.data.name as string) || "Download File"}</p>
            {!compact && <p style={{ fontSize: 10, color: descC, marginTop: 2 }}>{(block.data.size as string) || "PDF · 2.4 MB"}</p>}
          </div>
        </a>
      );
    }

    /* ───────────────────────── POPUP ─────────────────────────────── */
    case "popup":
      return <PopupBlock block={block} appearance={appearance} compact={compact} btnRadius={radius} />;

    /* ───────────────────────── AUDIO ─────────────────────────────── */
    case "audio": {
      const src = (block.data.url as string) || "";
      const spotifyEmbed = getSpotifyEmbed(src);

      // Spotify branch — render the official embed (theme is owned by Spotify).
      if (spotifyEmbed) {
        if (compact) {
          // Compact thumbnail in the phone-canvas mini view.
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", backgroundColor: `${accentColor}12`, borderRadius: radius }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#1DB954", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Headphones style={{ width: 12, height: 12, color: "#fff" }} />
              </div>
              <p style={{ fontSize: 10, color: textColor, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {(block.data.title as string) || "Spotify"}
              </p>
            </div>
          );
        }
        return (
          <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: pageShadow }}>
            <iframe
              src={spotifyEmbed}
              style={{ width: "100%", height: 152, border: "none", display: "block" }}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              title={(block.data.title as string) || "Spotify embed"}
            />
          </div>
        );
      }

      // Fallback: direct audio file (.mp3, .ogg, .wav or any HTML5-streamable URL).
      return (
        <div style={{ display: "flex", alignItems: "center", gap: compact ? 8 : 12, padding: compact ? "8px 10px" : "12px 14px", backgroundColor: `${accentColor}12`, borderRadius: radius, boxShadow: pageShadow }}>
          <div style={{ width: compact ? 28 : 42, height: compact ? 28 : 42, borderRadius: "50%", backgroundColor: accentColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Headphones style={{ width: compact ? 12 : 18, height: compact ? 12 : 18, color: "#fff" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: compact ? 10 : 13, color: textColor, fontWeight: 500 }} className="truncate">
              {(block.data.title as string) || "Audio Track"}
            </p>
            {!compact && (src
              ? <audio controls src={src} style={{ width: "100%", height: 28, marginTop: 8 }} />
              : <div style={{ display: "flex", alignItems: "flex-end", gap: 2, marginTop: 8 }}>
                  {[3, 6, 4, 8, 5, 7, 4, 6, 3].map((h, i) => (
                    <div key={i} style={{ width: 2, height: h * 2, borderRadius: 2, backgroundColor: `${accentColor}55` }} />
                  ))}
                  <p style={{ fontSize: 10, color: textColor, opacity: 0.35, marginLeft: 4 }}>No audio URL set</p>
                </div>
            )}
          </div>
        </div>
      );
    }

    /* ───────────────────────── BUTTON ────────────────────────────── */
    case "button": {
      const align    = bsStr(appearance, "button", "alignment",    "Center");
      const bgColor  = bsStr(appearance, "button", "bgColor",      accentColor);
      const labelC   = bsStr(appearance, "button", "labelColor",   "#ffffff");
      const descC    = bsStr(appearance, "button", "descColor",    "rgba(255,255,255,0.58)");
      const brdType  = bsStr(appearance, "button", "borderType",   "None");
      const brdColor = bsStr(appearance, "button", "borderColor",  accentColor);
      const brdWidth = bsNum(appearance, "button", "borderWidth",  0);
      const cornerR  = bsNum(appearance, "button", "cornerRadius", 12);
      const shadow   = bsBool(appearance, "button", "shadow",      false);
      const border   = borderCSS(brdType, brdColor, brdWidth);
      const boxShadow = shadow ? shadowCSS(shadowType, shadowColor) : "none";

      return (
        <div style={{ display: "flex", justifyContent: toFlexAlign(align) }}>
          <div style={{ backgroundColor: bgColor, borderRadius: cornerR, padding: compact ? "8px 12px" : "12px 20px", border, boxShadow, cursor: "pointer", textAlign: toTextAlign(align), minWidth: compact ? 0 : "60%" }}>
            <p style={{ color: labelC, fontSize: compact ? 11 : 14, fontWeight: 500 }}>{(block.data.label as string) || "Click Me"}</p>
            {!compact && block.data.description && <p style={{ color: descC, fontSize: 11, marginTop: 2 }}>{block.data.description as string}</p>}
          </div>
        </div>
      );
    }

    /* ───────────────────────── VIDEO ─────────────────────────────── */
    case "video": {
      const url      = (block.data.url as string) || "";
      const embedUrl = getVideoEmbed(url);
      const cornerR  = bsNum(appearance, "video", "cornerRadius", 12);
      const shadow   = bsBool(appearance, "video", "shadow",      false);
      const boxShadow = shadow ? shadowCSS(shadowType, shadowColor) : "none";

      return (
        <div style={{ borderRadius: cornerR, overflow: "hidden", backgroundColor: `${textColor}07`, position: "relative", height: compact ? 60 : undefined, aspectRatio: compact ? undefined : "16/9", boxShadow }}>
          {embedUrl && !compact
            ? <iframe src={embedUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            : <div style={{ width: "100%", minHeight: compact ? 60 : 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ width: compact ? 24 : 44, height: compact ? 24 : 44, borderRadius: "50%", backgroundColor: `${accentColor}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Video style={{ width: compact ? 12 : 20, height: compact ? 12 : 20, color: accentColor }} />
                </div>
                {!compact && <p style={{ fontSize: 11, color: textColor, opacity: 0.4, textAlign: "center", maxWidth: 180 }}>
                  {url ? "Preview unavailable" : (block.data.title as string) || "Paste a YouTube or Vimeo URL"}
                </p>}
              </div>}
        </div>
      );
    }

    /* ───────────────────────── CARD ──────────────────────────────── */
    case "card": {
      const imgSrc   = block.data.image as string;
      const bgColor  = bsStr(appearance, "card", "bgColor",      `${textColor}06`);
      const brdType  = bsStr(appearance, "card", "borderType",   "None");
      const brdColor = bsStr(appearance, "card", "borderColor",  `${textColor}15`);
      const brdWidth = bsNum(appearance, "card", "borderWidth",  0);
      const cornerR  = bsNum(appearance, "card", "cornerRadius", 16);
      const shadow   = bsBool(appearance, "card", "shadow",      false);
      const border   = borderCSS(brdType, brdColor, brdWidth);
      const boxShadow = shadow ? shadowCSS(shadowType, shadowColor) : "none";

      return (
        <div style={{ borderRadius: cornerR, overflow: "hidden", backgroundColor: bgColor, border, boxShadow }}>
          {!compact && (imgSrc
            ? <img src={imgSrc} alt={(block.data.title as string) || "card"} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
            : <div style={{ height: 80, backgroundColor: `${accentColor}0e`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Square style={{ color: accentColor, opacity: 0.3, width: 24, height: 24 }} />
              </div>)}
          <div style={{ padding: compact ? "7px 10px" : "12px 14px" }}>
            <p style={{ fontSize: compact ? 10 : 14, color: textColor, fontWeight: 500 }}>{(block.data.title as string) || "Card Title"}</p>
            {!compact && block.data.description && <p style={{ fontSize: 12, color: textColor, opacity: 0.55, marginTop: 4, lineHeight: 1.55 }}>{block.data.description as string}</p>}
            {!compact && block.data.ctaLabel && (
              <div style={{ marginTop: 12, padding: "8px 0", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 500, backgroundColor: accentColor, borderRadius: 8 }}>
                {block.data.ctaLabel as string}
              </div>
            )}
          </div>
        </div>
      );
    }

    /* ───────────────────────── CAROUSEL ──────────────────────────── */
    case "carousel": {
      const slides       = (block.data.images as { src: string; caption: string }[]) ?? [];
      const indicatorC   = bsStr(appearance, "carousel", "indicatorColor", accentColor);
      const btnBg        = bsStr(appearance, "carousel", "btnBgColor",     `${textColor}12`);
      const btnIconC     = bsStr(appearance, "carousel", "btnIconColor",   textColor);
      const btnR         = bsNum(appearance, "carousel", "btnBorderRadius", 9999);
      const btnShadow    = bsBool(appearance, "carousel", "btnShadow",      false);
      const btnBoxShadow = btnShadow ? shadowCSS(shadowType, shadowColor) : "none";

      if (compact) {
        return (
          <div style={{ display: "flex", gap: 6, height: 52 }}>
            {slides.slice(0, 3).map((s, i) => (
              <div key={i} style={{ width: 52, height: 52, borderRadius: 6, overflow: "hidden", backgroundColor: `${accentColor}15`, flexShrink: 0 }}>
                {s.src && <img src={s.src} alt={s.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
            ))}
            {slides.length === 0 && (
              <div style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: `${accentColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GalleryHorizontal style={{ width: 16, height: 16, color: accentColor, opacity: 0.5 }} />
              </div>
            )}
          </div>
        );
      }

      return (
        <div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
            {slides.length === 0
              ? <div style={{ width: "100%", height: 120, borderRadius: radius, backgroundColor: `${accentColor}0e`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <GalleryHorizontal style={{ color: accentColor, opacity: 0.35, width: 28, height: 28 }} />
                  <p style={{ fontSize: 11, color: textColor, opacity: 0.4 }}>Add slides below</p>
                </div>
              : slides.map((s, i) => (
                  <div key={i} style={{ width: 180, height: 120, borderRadius: radius, overflow: "hidden", backgroundColor: `${accentColor}10`, flexShrink: 0 }}>
                    {s.src ? <img src={s.src} alt={s.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <GalleryHorizontal style={{ color: accentColor, opacity: 0.25, width: 22, height: 22 }} />
                        </div>}
                  </div>
                ))}
          </div>
          {/* Dot indicators */}
          {slides.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
              {slides.map((_, i) => (
                <div key={i} style={{ width: i === 0 ? 14 : 6, height: 6, borderRadius: 99, backgroundColor: i === 0 ? indicatorC : `${indicatorC}40`, transition: "all 0.2s" }} />
              ))}
            </div>
          )}
        </div>
      );
    }

    /* ───────────────────────── ACCORDION ─────────────────────────── */
    case "accordion":
      return <AccordionBlock block={block} appearance={appearance} compact={compact} btnRadius={radius} />;

    /* ───────────────────────── SPACE ─────────────────────────────── */
    case "space": {
      const h = (block.data.height as number) || 24;
      return <div style={{ height: compact ? Math.min(Math.round(h / 2), 16) : h }} />;
    }

    default:
      return null;
  }
}
