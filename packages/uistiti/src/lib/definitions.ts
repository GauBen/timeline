// Generated using https://colorcurves.app/
export const colors: Record<
  "neutral" | "success" | "warning" | "danger",
  string[]
> = {
  neutral: [
    "#0b0c0e",
    "#202528",
    "#373c42",
    "#4e535c",
    "#656a75",
    "#7d818d",
    "#9899a3",
    "#b3b2b9",
    "#cdccd0",
    "#e7e6e7",
  ],
  success: [
    "#05130d",
    "#103926",
    "#1c5d3e",
    "#298154",
    "#36a468",
    "#49c278",
    "#6dce8b",
    "#8fdc9f",
    "#b2eab6",
    "#d7f7d5",
  ],
  warning: [
    "#50170b",
    "#762b0e",
    "#9d4311",
    "#c55d12",
    "#eb7815",
    "#f0933a",
    "#f3aa60",
    "#f7c086",
    "#f9d5ad",
    "#fce9d4",
  ],
  danger: [
    "#5c1108",
    "#6e170c",
    "#8c2012",
    "#b52d1b",
    "#dc4734",
    "#e37e71",
    "#eaa9a2",
    "#f1c9c5",
    "#f6dedc",
    "#f8e8e8",
  ],
};

type Props =
  | "color"
  | "color-strong"
  | "color-opposite"
  | "color-interaction"
  | "color-interaction-opposite"
  | "background"
  | "background-strong"
  | "background-hover"
  | "background-active"
  | "border"
  | "border-hover"
  | "border-active";

export const variants: Record<
  "solid" | "soft" | "outline" | "ghost",
  Record<Props, number | null>
> = {
  // Solid is a strong, vibrant style, to create impossible-to-miss elements
  solid: {
    "color": 10,
    "color-strong": 10,
    "color-opposite": 0,
    "color-interaction": 10,
    "color-interaction-opposite": 0,
    "background": 3,
    "background-strong": 2,
    "background-hover": 2,
    "background-active": 1,
    "border": 3,
    "border-hover": 2,
    "border-active": 0,
  },
  // Soft is more subtle than solid, but still a conveyor of emphasis
  soft: {
    "color": 2,
    "color-strong": 2,
    "color-opposite": 10,
    "color-interaction": 2,
    "color-interaction-opposite": 10,
    "background": 9,
    "background-strong": 10,
    "background-hover": 8,
    "background-active": 7,
    "border": 9,
    "border-hover": 8,
    "border-active": 6,
  },
  // Outline is the default style of all content-containing elements
  outline: {
    "color": 2,
    "color-strong": 2,
    "color-opposite": 10,
    "color-interaction": 2,
    "color-interaction-opposite": 10,
    "background": 10,
    "background-strong": 9,
    "background-hover": 8,
    "background-active": 7,
    "border": 8,
    "border-hover": 8,
    "border-active": 6,
  },
  // Ghost is a discreet style
  ghost: {
    "color": 2,
    "color-strong": 2,
    "color-opposite": 10,
    "color-interaction": 2,
    "color-interaction-opposite": 10,
    "background": null,
    "background-strong": 9,
    "background-hover": 9,
    "background-active": 8,
    "border": null,
    "border-hover": 9,
    "border-active": 7,
  },
};

export type CommonProps = {
  color?: keyof typeof colors;
  variant?: keyof typeof variants;
};
