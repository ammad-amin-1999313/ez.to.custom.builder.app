"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useBuilderStore } from "../store/builderStore";
import {
  Upload, User, AtSign, FileText, Link2,
  ChevronRight, ChevronLeft, Zap,
  Twitter, Instagram, Linkedin, Youtube, Github, Copy, CheckCircle2,
} from "lucide-react";
import { MiniPreview } from "../components/preview/MiniPreview";
import { toast } from "sonner";

const TOTAL_STEPS = 4;

const socialPlatforms = [
  { id: "twitter",   label: "Twitter / X", icon: Twitter,   placeholder: "twitter.com/username"      },
  { id: "instagram", label: "Instagram",   icon: Instagram, placeholder: "instagram.com/username"    },
  { id: "linkedin",  label: "LinkedIn",    icon: Linkedin,  placeholder: "linkedin.com/in/username"  },
  { id: "youtube",   label: "YouTube",     icon: Youtube,   placeholder: "youtube.com/@channel"      },
  { id: "github",    label: "GitHub",      icon: Github,    placeholder: "github.com/username"       },
];

// ─── Inline copy button for step 4 ────────────────────────────────────────────
function CopyUrlButton({ url }: { url: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };
  return (
    <button
      onClick={handleCopy}
      className="text-zinc-500 hover:text-zinc-300 transition-colors"
      title="Copy link"
    >
      <Copy className="w-4 h-4" />
    </button>
  );
}

export function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile, setOnboardingStep, blocks, updateBlock, addBlock } = useBuilderStore();
  const [step, setStep] = useState(1);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    github: "",
  });
  const [links, setLinks] = useState([
    { label: "My Portfolio", url: "https://example.com" },
    { label: "", url: "" },
  ]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const progress = (step / TOTAL_STEPS) * 100;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfile({ image: ev.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  // Commit step data to the store before advancing
  const commitStepData = (fromStep: number) => {
    if (fromStep === 2) {
      const filledLinks = Object.entries(socialLinks)
        .filter(([, url]) => url.trim())
        .map(([platformId, url]) => ({
          platform: socialPlatforms.find(p => p.id === platformId)?.label || platformId,
          url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
          icon: platformId,
        }));
      const socialBlock = blocks.find(b => b.type === "social");
      if (socialBlock && filledLinks.length > 0) {
        updateBlock(socialBlock.id, { links: filledLinks });
      }
    }

    if (fromStep === 3) {
      const validLinks = links.filter(l => l.label.trim() && l.url.trim());
      const existingLinkBlocks = blocks.filter(b => b.type === "link");
      validLinks.forEach((link, i) => {
        const url = link.url.trim().startsWith("http") ? link.url.trim() : `https://${link.url.trim()}`;
        if (i < existingLinkBlocks.length) {
          updateBlock(existingLinkBlocks[i].id, { label: link.label, url, description: "", emoji: "🔗" });
        } else {
          addBlock({
            id: `block-link-${Date.now()}-${i}`,
            type: "link",
            visible: true,
            data: { label: link.label, url, description: "", emoji: "🔗" },
          });
        }
      });
    }
  };

  const nextStep = () => {
    commitStepData(step);
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      setOnboardingStep(step + 1);
    } else {
      router.push("/builder");
    }
  };

  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const hasSocialLinks = Object.values(socialLinks).some(v => v.trim());
  const hasLinks = links.some(l => l.label.trim() && l.url.trim());

  const stepLabels = ["Profile", "About", "Links", "Done!"];

  if (!mounted) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl tracking-tight">EZ<span className="text-indigo-400">.to</span></span>
        </div>
        <button onClick={() => router.push("/builder")}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          Skip onboarding →
        </button>
      </div>

      {/* Progress */}
      <div className="px-8 pt-6 pb-2 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-zinc-400">
            Step <span className="text-white">{step}</span> of {TOTAL_STEPS} — {stepLabels[step - 1]}
          </span>
          <span className="text-sm text-zinc-500">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                i + 1 < step ? "bg-indigo-500 text-white"
                : i + 1 === step ? "bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400"
                : "bg-zinc-800 text-zinc-600"
              }`}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i + 1 <= step ? "text-zinc-300" : "text-zinc-600"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-8 px-8 py-6 max-w-5xl mx-auto w-full">
        {/* Form Side */}
        <div className="flex-1 max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* ── Step 1: Profile ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl tracking-tight mb-1">Set up your profile</h2>
                    <p className="text-zinc-400 text-sm">This is how people will find and recognize you.</p>
                  </div>

                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-600 hover:border-indigo-500 transition-colors cursor-pointer flex items-center justify-center overflow-hidden relative group"
                      onClick={() => fileRef.current?.click()}
                    >
                      {profile.image ? (
                        <>
                          <img src={profile.image} alt="avatar" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="w-6 h-6 text-zinc-500" />
                          <span className="text-xs text-zinc-500">Upload</span>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <p className="text-xs text-zinc-500">JPG, PNG · Max 5MB</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block">First name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input type="text" value={profile.firstName}
                          onChange={(e) => setProfile({ firstName: e.target.value })}
                          placeholder="Alex"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block">Last name</label>
                      <input type="text" value={profile.lastName}
                        onChange={(e) => setProfile({ lastName: e.target.value })}
                        placeholder="Morgan"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 mb-1.5 block">Your handle</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input type="text" value={profile.handle}
                        onChange={(e) => setProfile({ handle: e.target.value.toLowerCase().replace(/\s/g, "") })}
                        placeholder="alexmorgan"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                    <p className="text-xs text-zinc-600 mt-1.5">ez.to/{profile.handle || "yourhandle"}</p>
                  </div>
                </div>
              )}

              {/* ── Step 2: Bio ── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl tracking-tight mb-1">Tell your story</h2>
                    <p className="text-zinc-400 text-sm">A short bio appears below your name on your page.</p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1.5 block">Bio</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                      <textarea value={profile.bio}
                        onChange={(e) => setProfile({ bio: e.target.value })}
                        placeholder="Designer & Developer · Building things for the web..."
                        rows={4}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className={`text-xs ${profile.bio.length > 120 ? "text-red-400" : "text-zinc-600"}`}>
                        {profile.bio.length}/150
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 mb-3 block">Social profiles</label>
                    <div className="space-y-2.5">
                      {socialPlatforms.map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <div key={platform.id} className="relative">
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input type="text"
                              value={socialLinks[platform.id] || ""}
                              onChange={(e) => setSocialLinks({ ...socialLinks, [platform.id]: e.target.value })}
                              placeholder={platform.placeholder}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 3: Links ── */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl tracking-tight mb-1">Add your links</h2>
                    <p className="text-zinc-400 text-sm">Add links to your portfolio, blog, shop, or anything else.</p>
                  </div>
                  <div className="space-y-3">
                    {links.map((link, i) => (
                      <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-2.5">
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input type="text" value={link.label}
                            onChange={(e) => {
                              const updated = [...links];
                              updated[i] = { ...updated[i], label: e.target.value };
                              setLinks(updated);
                            }}
                            placeholder="Link title"
                            className="w-full bg-zinc-800 border border-zinc-600 rounded-lg pl-9 pr-4 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                        </div>
                        <input type="url" value={link.url}
                          onChange={(e) => {
                            const updated = [...links];
                            updated[i] = { ...updated[i], url: e.target.value };
                            setLinks(updated);
                          }}
                          placeholder="https://..."
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                      </div>
                    ))}
                    <button
                      onClick={() => setLinks([...links, { label: "", url: "" }])}
                      className="w-full py-2.5 border border-dashed border-zinc-700 rounded-xl text-sm text-zinc-500 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
                    >
                      + Add another link
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 4: Done ── */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                      <span className="text-3xl">🎉</span>
                    </div>
                    <h2 className="text-2xl tracking-tight mb-1">You're all set!</h2>
                    <p className="text-zinc-400 text-sm">
                      Your page is ready to customize. Head to the builder to add blocks, tweak your design, and publish.
                    </p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
                    <h3 className="text-sm text-zinc-300">Your page URL</h3>
                    <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                      <span className="text-indigo-400 text-sm flex-1 truncate">
                        ez.to/{profile.handle || "alexmorgan"}
                      </span>
                      <CopyUrlButton url={`https://ez.to/${profile.handle || "alexmorgan"}`} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Profile set up", done: !!(profile.firstName && profile.lastName) },
                      { label: "Social links added", done: hasSocialLinks },
                      { label: "Link blocks created", done: hasLinks },
                      { label: "Customize in the Builder", done: false, pending: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-sm">
                        {item.pending ? (
                          <span className="text-indigo-400">🔧</span>
                        ) : item.done ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-zinc-600 flex-shrink-0" />
                        )}
                        <span className={item.done ? "text-zinc-300" : item.pending ? "text-zinc-400" : "text-zinc-600"}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-8">
            {step > 1 && (
              <button onClick={prevStep}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={nextStep}
              className="flex-1 flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600 transition-colors"
            >
              {step === TOTAL_STEPS ? "Open Builder" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Live Preview Side */}
        <div className="hidden lg:flex flex-col items-center gap-4 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-zinc-400">Live preview</span>
          </div>
          <MiniPreview />
        </div>
      </div>
    </div>
  );
}