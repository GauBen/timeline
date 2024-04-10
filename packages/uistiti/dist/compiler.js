import Color from "colorjs.io";
import { writeFileSync } from "node:fs";
import { colors, variants } from "./definitions.js";
const palettes = Object.fromEntries(Object.entries(colors).map(([name, color]) => {
    return [
        name,
        Array.from({ length: 11 }, (_, i) => {
            const shade = new Color(color);
            if (i < 5)
                shade.oklch.l = (shade.oklch.l * (i + 1)) / 6;
            else if (i > 5)
                shade.oklch.l = shade.oklch.l + ((1 - shade.oklch.l) * (i - 5)) / 6;
            return shade;
        }),
    ];
}));
let output = "/* Definitions */\n:root {\n";
for (const [variant, props] of Object.entries(variants)) {
    for (const [prop, value] of Object.entries(props)) {
        for (const [color, shades] of Object.entries(palettes)) {
            const cssValue = value === null
                ? "transparent"
                : shades[value].toString({ format: "hex" });
            output += `  --${variant}-${color}-${prop}: ${cssValue};\n`;
        }
    }
}
output += "}\n\n";
const defaultColor = Object.keys(palettes)[0];
const defaultVariant = Object.keys(variants)[0];
output += `/* Default color */\n:root {\n`;
for (const [variant, props] of Object.entries(variants)) {
    for (const prop of Object.keys(props)) {
        output += `  --${variant}-${prop}: var(--${variant}-${defaultColor}-${prop});\n`;
    }
}
output += "}\n\n";
output += `/* Default variant */\n:root${Object.keys(colors)
    .map((color) => ",\n.-" + color)
    .join("")} {\n`;
for (const prop of Object.keys(variants[defaultVariant])) {
    output += `  --${prop}: var(--${defaultVariant}-${prop});\n`;
}
output += "}\n\n";
output += `/* Colors */\n`;
for (const color of Object.keys(colors)) {
    output += `.-${color} {\n`;
    for (const [variant, props] of Object.entries(variants)) {
        for (const prop of Object.keys(props)) {
            output += `  --${variant}-${prop}: var(--${variant}-${color}-${prop});\n`;
        }
    }
    output += "}\n\n";
}
output += `/* Variants */\n`;
for (const [variant, props] of Object.entries(variants)) {
    output += `.-${variant} {\n`;
    for (const prop of Object.keys(props)) {
        output += `  --${prop}: var(--${variant}-${prop});\n`;
    }
    output += "}\n\n";
}
writeFileSync(new URL("global.css", import.meta.url), output, "utf-8");
