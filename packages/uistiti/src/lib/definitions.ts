export const colors = {
  neutral: "#9191A0",
  success: "#37bd22",
  warning: "#fae22d",
  danger: "#ed1515",
};

export const variants: Record<
  "solid" | "outline" | "ghost",
  Record<"color" | "background" | "border", number | null>
> = {
  solid: {
    color: 2,
    background: 10,
    border: 10,
  },
  outline: {
    color: 3,
    background: null,
    border: 3,
  },
  ghost: {
    color: 3,
    background: null,
    border: null,
  },
};

export type CommonProps = {
  color?: keyof typeof colors;
  variant?: keyof typeof variants;
};