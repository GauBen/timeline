export declare const colors: {
    neutral: string;
    success: string;
    warning: string;
    danger: string;
};
export declare const variants: Record<"solid" | "outline" | "ghost", Record<"color" | "background" | "border", number | null>>;
export type CommonProps = {
    color?: keyof typeof colors;
    variant?: keyof typeof variants;
};
