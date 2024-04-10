import { SvelteComponent } from "svelte";
import type { CommonProps } from "./definitions.js";
declare const __propDef: {
    props: CommonProps & import("svelte/elements").HTMLButtonAttributes;
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type ButtonProps = typeof __propDef.props;
export type ButtonEvents = typeof __propDef.events;
export type ButtonSlots = typeof __propDef.slots;
export default class Button extends SvelteComponent<ButtonProps, ButtonEvents, ButtonSlots> {
}
export {};
