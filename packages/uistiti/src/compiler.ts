import Color from "colorjs.io";
import { writeFileSync } from "node:fs";
import { colors, variants } from "./lib/definitions.js";

console.time("Compiled");

let output = "/* Default theme */\n:root {\n";

for (const [name, color] of Object.entries(colors)) {
  for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const shade = new Color(color);
    if (i < 5) shade.oklch.l = (shade.oklch.l * (i + 1)) / 6;
    else if (i > 5)
      shade.oklch.l = shade.oklch.l + ((1 - shade.oklch.l) * (i - 5)) / 5;
    output += `  --ui-${name}-${i}: ${shade.toString({ format: "hex" })};\n`;
  }
}

output += "}\n\n";

output += `/* Colors */\n`;

for (const [i, name] of Object.keys(colors).entries()) {
  output += (i === 0 ? ":root, " : "") + `[data-color=${name}] {\n`;
  for (const j of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    output += `  --ui-color-${j}: var(--ui-${name}-${j});\n`;
  }
  output += "}\n\n";
}

output += `/* Variants */\n`;

for (const [name, variant] of Object.entries(variants)) {
  output += `[data-variant=${name}] {\n`;
  for (const [prop, value] of Object.entries(variant)) {
    output += `  --ui-${prop}: ${value === null ? "transparent" : `var(--ui-color-${value})`};\n`;
  }
  output += "}\n\n";
}

writeFileSync(new URL("../dist/global.css", import.meta.url), output, "utf-8");

output = "";

for (const i of [0, 1, 2, 4, 8]) {
  output += `._stack-${i} {\n  display: flex;\n  flex-direction: column;\n  gap: ${i / 4}rem;\n}\n\n`;
  output += `._row-${i} {\n  display: flex;\n  align-items:center;\n  gap: ${i / 4}rem;\n}\n\n`;
}

writeFileSync(new URL("../dist/utils.css", import.meta.url), output, "utf-8");

console.timeEnd("Compiled");
