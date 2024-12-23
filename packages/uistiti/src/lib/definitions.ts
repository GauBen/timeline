export const colors = {
  neutral: "#9191A0",
  success: "#58de6a",
  warning: "#ffe56a",
  danger: "#ed1515",
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
  "solid" | "outline" | "ghost",
  Record<Props, number | null>
> = {
  solid: {
    "color": 9,
    "color-strong": 10,
    "color-opposite": 0,
    "color-interaction": 10,
    "color-interaction-opposite": 0,
    "background": 4,
    "background-strong": 3,
    "background-hover": 3,
    "background-active": 2,
    "border": 4,
    "border-hover": 2,
    "border-active": 1,
  },
  outline: {
    "color": 3,
    "color-strong": 2,
    "color-opposite": 10,
    "color-interaction": 10,
    "color-interaction-opposite": 0,
    "background": 10,
    "background-strong": 8,
    "background-hover": 3,
    "background-active": 2,
    "border": 4,
    "border-hover": 2,
    "border-active": 1,
  },
  ghost: {
    "color": 3,
    "color-strong": 2,
    "color-opposite": 10,
    "color-interaction": 10,
    "color-interaction-opposite": 0,
    "background": null,
    "background-strong": 9,
    "background-hover": 3,
    "background-active": 2,
    "border": null,
    "border-hover": 2,
    "border-active": 1,
  },
};

export type CommonProps = {
  color?: keyof typeof colors;
  variant?: keyof typeof variants;
};
