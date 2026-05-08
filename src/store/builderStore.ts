import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BlockType =
  | "profile"
  | "social"
  | "text"
  | "divider"
  | "photo"
  | "form"
  | "map"
  | "timeline"
  | "testimonial"
  | "file"
  | "popup"
  | "link"
  | "audio"
  | "button"
  | "video"
  | "card"
  | "carousel"
  | "accordion"
  | "space";

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  customIcon?: string; // data URL for user-uploaded icon (used when icon === "other")
}

export interface Block {
  id: string;
  type: BlockType;
  visible: boolean;
  data: Record<string, unknown>;
}

export interface Profile {
  firstName: string;
  lastName: string;
  bio: string;
  image: string | null;
  handle: string;
}

export interface Appearance {
  bgColor: string;
  textColor: string;
  accentColor: string;
  buttonStyle: "rounded" | "sharp" | "pill";
  fontFamily: string;
  bgGradient: boolean;
  gradientEnd: string;
  // Extended
  animation: string;
  bgType: "flat" | "gradient" | "image";
  bgColor2: string;
  bgColor3: string;
  gradientAngle: number;
  brightness: number;
  blur: number;
  noise: boolean;
  showMenuButton: boolean;
  bgImageUrl: string;
  // New
  scrollToTop: boolean;
  shadowType: string;
  shadowColor: string;
  typographyFont: string;
  blockStyles: Record<string, Record<string, string | number | boolean>>;
}

export interface Settings {
  pageName: string;
  seoTitle: string;
  seoDescription: string;
  customDomain: string;
  isLocked: boolean;
  // Extended settings
  builtInDomain: string;
  customDomainValue: string;
  googleAnalyticsId: string;
  metaPixelId: string;
  tikTokPixelId: string;
  seoFavicon: string;
  seoThumbnail: string;
}

export interface BuilderState {
  selectedTheme: string;
  onboardingStep: number;
  profile: Profile;
  blocks: Block[];
  appearance: Appearance;
  settings: Settings;
  activeTab: "content" | "appearance" | "settings" | "analytics";
  previewMode: "mobile" | "web";
  recentColors: string[];
  savedPalettes: { id: string; name: string; colors: string[] }[];
  savedBlocks: Block[];          // snapshot used by Discard

  setTheme: (theme: string) => void;
  setOnboardingStep: (step: number) => void;
  setProfile: (profile: Partial<Profile>) => void;
  addBlock: (block: Block) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, data: Partial<Block["data"]>) => void;
  toggleBlockVisibility: (id: string) => void;
  reorderBlocks: (blocks: Block[]) => void;
  setAppearance: (appearance: Partial<Appearance>) => void;
  setSettings: (settings: Partial<Settings>) => void;
  setActiveTab: (tab: BuilderState["activeTab"]) => void;
  setPreviewMode: (mode: "mobile" | "web") => void;
  addRecentColor: (color: string) => void;
  savePalette: (name: string, colors: string[]) => void;
  deletePalette: (id: string) => void;
  saveSession: () => void;
  discardSession: () => void;
}

const defaultBlocks: Block[] = [
  {
    id: "block-profile-1",
    type: "profile",
    visible: true,
    data: {
      showAvatar: true,
      showName: true,
      showBio: true,
    },
  },
  {
    id: "block-social-1",
    type: "social",
    visible: true,
    data: {
      links: [
        { platform: "X (Twitter)", url: "https://twitter.com/ezto", icon: "twitter" },
        { platform: "Instagram", url: "https://instagram.com/ezto", icon: "instagram" },
        { platform: "GitHub", url: "https://github.com/ezto", icon: "github" },
      ],
    },
  },
  {
    id: "block-link-1",
    type: "link",
    visible: true,
    data: {
      label: "My Portfolio",
      url: "https://example.com",
      description: "Check out my work",
      emoji: "🚀",
    },
  },
  {
    id: "block-link-2",
    type: "link",
    visible: true,
    data: {
      label: "Latest Blog Post",
      url: "https://blog.example.com",
      description: "Read my thoughts",
      emoji: "✍️",
    },
  },
  {
    id: "block-text-1",
    type: "text",
    visible: true,
    data: {
      title: "My Projects",
      subtitle: "Check out what I've been working on lately.",
    },
  },
  {
    id: "block-social-2",
    type: "social",
    visible: true,
    data: {
      links: [
        { platform: "LinkedIn", url: "https://linkedin.com/in/ezto", icon: "linkedin" },
        { platform: "YouTube", url: "https://youtube.com/@ezto", icon: "youtube" },
      ],
    },
  },
];

// ── Initial state factory ─────────────────────────────────────────────────────
// Used both at store creation time and when resetting the store for a fresh
// user (see `setBuilderUserScope`). Returns a fresh copy each call.
// Exported so the API sync bridge can reset to defaults when the server
// returns no data for a freshly-signed-in user.
export function buildInitialState() {
  return {
    selectedTheme: "",
    onboardingStep: 1,
    profile: {
      firstName: "Alex",
      lastName: "Morgan",
      bio: "Designer & Developer · Building things for the web",
      image: null as string | null,
      handle: "alexmorgan",
    },
    blocks: defaultBlocks,
    appearance: {
      bgColor: "#ffffff",
      textColor: "#111111",
      accentColor: "#6366f1",
      buttonStyle: "rounded" as const,
      fontFamily: "Inter",
      bgGradient: false,
      gradientEnd: "#f0f4ff",
      animation: "slide-up",
      bgType: "flat" as const,
      bgColor2: "#c7d2fe",
      bgColor3: "#e0e7ff",
      gradientAngle: 135,
      brightness: 0,
      blur: 0,
      noise: false,
      showMenuButton: false,
      bgImageUrl: "",
      scrollToTop: false,
      shadowType: "Soft",
      shadowColor: "#00000008",
      typographyFont: "Outfit",
      blockStyles: {
        accordion:   { bgColor: "#ffffff", labelColor: "#111111", descColor: "#888888", iconColor: "#6366f1", borderType: "Solid",  borderColor: "#e5e7eb", borderWidth: 1,  cornerRadius: 12,   shadow: false },
        button:      { alignment: "Center", bgColor: "#6366f1",  labelColor: "#ffffff", descColor: "#e0e7ff", borderType: "None",   borderColor: "#4f46e5", borderWidth: 0,  cornerRadius: 12,   shadow: false },
        card:        { bgColor: "#ffffff",                                                                      borderType: "None",   borderColor: "#e5e7eb", borderWidth: 0,  cornerRadius: 16,   shadow: false },
        carousel:    { btnBgColor: "#ffffff", btnIconColor: "#111111", btnBorderType: "None", btnBorderColor: "#e5e7eb", btnBorderWidth: 0, btnBorderRadius: 9999, btnShadow: false, indicatorColor: "#6366f1" },
        divider:     { lineColor: "#e5e7eb" },
        file:        { alignment: "Center", bgColor: "#f3f4f6",  labelColor: "#111111", descColor: "#888888", iconColor: "#6366f1", borderType: "None",   borderColor: "#e5e7eb", borderWidth: 0,  cornerRadius: 12,   shadow: false },
        form:        { inputLabelColor: "#111111", inputTextColor: "#111111", inputBgColor: "#f9fafb", inputBorderType: "Solid", inputBorderColor: "#e5e7eb", inputFocusBorderColor: "#6366f1", inputBorderWidth: 1, inputCornerRadius: 8, inputShadow: false, formBtnTextColor: "#ffffff", formBtnBgColor: "#6366f1", formBtnBorderType: "None", formBtnBorderColor: "#4f46e5", formBtnBorderWidth: 0, formBtnCornerRadius: 8, formBtnShadow: false },
        map:         { cornerRadius: 12,  shadow: false },
        photo:       { titleColor: "#111111", descColor: "#888888", cornerRadius: 12,   shadow: false },
        popup:       { alignment: "Center", bgColor: "#6366f1",  labelColor: "#ffffff", descColor: "#e0e7ff", borderType: "None",   borderColor: "#4f46e5", borderWidth: 0,  cornerRadius: 12,   shadow: false, popupBgColor: "#ffffff", popupTitleColor: "#111111", popupCornerRadius: 16, popupCloseBtnColor: "#888888" },
        profile:     { alignment: "Center", textColor: "#111111", photoBorderType: "None", photoBorderColor: "#6366f1", photoBorderWidth: 0, photoRoundness: 9999, photoShadow: false },
        social:      { alignment: "Center", iconColor: "#6366f1" },
        testimonial: { alignment: "Left",   primaryTextColor: "#111111", secondaryTextColor: "#888888", paragraphColor: "#444444", starsColor: "#f59e0b", photoBorderType: "None", photoBorderColor: "#6366f1", photoBorderWidth: 0, photoRoundness: 9999, photoShadow: false },
        text:        { textColor: "#111111", linkColor: "#6366f1", highlightBg: "#fef9c3", codeBg: "#f3f4f6" },
        timeline:    { bulletColor: "#6366f1", lineColor: "#e5e7eb", titleColor: "#111111", descColor: "#888888", dateColor: "#9ca3af" },
        video:       { cornerRadius: 12,  shadow: false },
      } as Record<string, Record<string, string | number | boolean>>,
    },
    settings: {
      pageName: "Alex Morgan",
      seoTitle: "Alex Morgan | Designer & Developer",
      seoDescription: "Personal page of Alex Morgan",
      customDomain: "ez.to/alexmorgan",
      isLocked: false,
      builtInDomain: "ez.to/alexmorgan",
      customDomainValue: "",
      googleAnalyticsId: "",
      metaPixelId: "",
      tikTokPixelId: "",
      seoFavicon: "",
      seoThumbnail: "",
    },
    activeTab: "content" as const,
    previewMode: "mobile" as const,
    recentColors: [] as string[],
    savedPalettes: [] as { id: string; name: string; colors: string[] }[],
    savedBlocks: defaultBlocks,
  };
}

// ── Persist storage helpers ───────────────────────────────────────────────────
export const BUILDER_STORAGE_NAME = "ezto-builder-store";

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      ...buildInitialState(),

      setTheme: (theme) => set({ selectedTheme: theme }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setProfile: (profile) =>
        set((state) => ({ profile: { ...state.profile, ...profile } })),
      addBlock: (block) =>
        set((state) => ({ blocks: [...state.blocks, block] })),
      removeBlock: (id) =>
        set((state) => ({
          // Filter from BOTH blocks and savedBlocks so a deletion is treated
          // as "committed" (not pending Save). The bridge auto-syncs deletes
          // to the server; Discard cannot un-delete.
          blocks: state.blocks.filter((b) => b.id !== id),
          savedBlocks: state.savedBlocks.filter((b) => b.id !== id),
        })),
      updateBlock: (id, data) =>
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, data: { ...b.data, ...data } } : b
          ),
        })),
      toggleBlockVisibility: (id) =>
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, visible: !b.visible } : b
          ),
        })),
      reorderBlocks: (blocks) => set({ blocks }),
      setAppearance: (appearance) =>
        set((state) => ({ appearance: { ...state.appearance, ...appearance } })),
      setSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      addRecentColor: (color) =>
        set((state) => ({
          recentColors: [
            color,
            ...state.recentColors.filter((c) => c.toLowerCase() !== color.toLowerCase()),
          ].slice(0, 16),
        })),
      savePalette: (name, colors) =>
        set((state) => ({
          savedPalettes: [
            ...state.savedPalettes,
            { id: `palette-${Date.now()}`, name, colors },
          ],
        })),
      deletePalette: (id) =>
        set((state) => ({
          savedPalettes: state.savedPalettes.filter((p) => p.id !== id),
        })),
      saveSession: () =>
        set((state) => ({ savedBlocks: [...state.blocks] })),
      discardSession: () =>
        set((state) => ({ blocks: [...state.savedBlocks] })),
    }),
    {
      name: BUILDER_STORAGE_NAME,
      version: 2,
      merge: (persisted, current) => {
        const stored = persisted as Partial<BuilderState>;
        return {
          ...current,
          ...stored,
          appearance: {
            ...current.appearance,
            ...(stored.appearance || {}),
            blockStyles: {
              ...current.appearance.blockStyles,
              ...(stored.appearance?.blockStyles || {}),
            },
          },
        };
      },
    }
  )
);

/**
 * Switch the persisted-storage bucket to one scoped by Clerk user ID.
 *
 *   userId provided  →  bucket = `ezto-builder-store-<userId>`  (per-user)
 *   userId null      →  bucket = `ezto-builder-store`           (anonymous)
 *
 * Behaviour after the switch:
 *   • If the new bucket already has data → rehydrate from it.
 *   • Otherwise → reset the persisted slice to defaults so we never expose
 *     the previous user's blocks/settings/profile to a fresh user.
 *
 * Note: existing pre-Clerk user data lives under the unsuffixed
 * `ezto-builder-store` key (the anonymous bucket). On first sign-in, users
 * start with default content; their old anonymous data is not migrated.
 */
export function setBuilderUserScope(
  userId: string | null | undefined,
  opts: { rehydrate?: boolean } = {},
) {
  const { rehydrate = true } = opts;
  const newName = userId
    ? `${BUILDER_STORAGE_NAME}-${userId}`
    : BUILDER_STORAGE_NAME;

  const current = useBuilderStore.persist.getOptions().name;
  if (current === newName) return;

  useBuilderStore.persist.setOptions({ name: newName });

  // When the API bridge is in charge, the caller will overwrite state with
  // server data right after this returns, so don't race with localStorage
  // hydration here.
  if (!rehydrate) return;

  const hasStoredData =
    typeof localStorage !== "undefined" && !!localStorage.getItem(newName);

  if (hasStoredData) {
    void useBuilderStore.persist.rehydrate();
  } else {
    useBuilderStore.setState(buildInitialState());
  }
}