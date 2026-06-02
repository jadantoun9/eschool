// Maps a DB Subject.colorKey to the design system's icon-chip variant.
// DB stores: "math" | "phys" | "chem" | "bio" (and possibly others).
// Design classes: icon-chip--math | --physics | --chem | --bio
export function chipClass(colorKey: string | null | undefined): string {
  switch (colorKey) {
    case "phys":
    case "physics":
      return "icon-chip--physics";
    case "chem":
    case "chemistry":
      return "icon-chip--chem";
    case "bio":
    case "biology":
      return "icon-chip--bio";
    case "math":
    case "maths":
    case "mathematics":
      return "icon-chip--math";
    default:
      return "icon-chip--math";
  }
}

export function subjectColor(colorKey: string | null | undefined): string {
  switch (colorKey) {
    case "phys":
    case "physics":
      return "var(--physics)";
    case "chem":
    case "chemistry":
      return "var(--chem)";
    case "bio":
    case "biology":
      return "var(--bio)";
    default:
      return "var(--math)";
  }
}
