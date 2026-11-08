export type SectionId =
  | "concept"
  | "personality"
  | "color"
  | "type"
  | "logo"
  | "copy"
  | "imagery"
  | "library";

/** A generated or user-written block of text. Unlocked text may be regenerated; locked text is never touched. */
export type LockedText = { text: string; locked: boolean };

/** Text whose unlocked value is composed live from the brand. `override` is set once the user edits it (and it becomes locked). */
export type LiveText = { override: string | null; locked: boolean; seed: number };

export type Swatch = { hex: string; locked: boolean };

export type TypeSlot = {
  classification: string;
  personality: string[];
  shape: string[];
  /** null = follow the top recommendation automatically */
  font: string | null;
  locked: boolean;
};

export type LogoConcept = {
  id: string;
  title: string;
  direction: string;
  graphic: string;
  description: string;
  promptOverride: string | null;
  locked: boolean;
  seed: number;
  /** Set from the card's own dropdowns; re-rolls and chip changes keep a pinned value. */
  pinDirection?: string;
  pinGraphic?: string;
};

export type Ratio = "1:1" | "4:5" | "3:4" | "9:16" | "16:9" | "3:2";

export type ImageConcept = {
  id: string;
  kind: string;
  subject: string;
  /** Typed by the user; when set it replaces the generated subject in every prompt. */
  subjectOverride?: string;
  ratio: Ratio;
  lighting: string;
  camera: string;
  composition: string;
  atmosphere: string;
  promptOverride: string | null;
  locked: boolean;
  seed: number;
};

export type Stage = "explore" | "develop" | "produce";

export type BrandState = {
  id: string;
  industry: string;
  name: string;
  nameLocked: boolean;
  nameSuggestions: string[];
  traits: string[];
  traitsLocked: boolean;
  colorDirection: string | null;
  palette: Swatch[];
  display: TypeSlot;
  body: TypeSlot;
  logoDirections: string[];
  graphicLanguage: string[];
  logoConcepts: LogoConcept[];
  selectedLogo: number; // -1 = none chosen yet
  /** False until the user asks for concepts (or picks a direction); cards show hints until then. */
  logoConceptsReady?: boolean;
  taglines: LockedText[];
  selectedTagline: number;
  description: LockedText;
  marketing: LockedText;
  voice: LockedText[];
  imageKinds: string[];
  imageConcepts: ImageConcept[];
  dna: LiveText;
  deliverable: string;
  /** Prompt Studio: a brief for a board, or a prompt for one asset. Old drafts have neither and read as "brief". */
  studioMode?: "brief" | "asset";
  customRequest: string;
  stage: Stage;
  fullBrief: LiveText;
  miniPrompt: LiveText;
  /** Specific asset request for the Mini Asset Prompt (e.g. “A bag of coffee on a wooden table”). */
  assetRequest?: string;
  /** The industry that generated content was last written for (used to re-sync stale content). */
  contentIndustry?: string;
  /** Version of the industry re-sync last applied. */
  contentSync?: number;
};

export type SavedBrand = { id: string; name: string; savedAt: number; state: BrandState };
