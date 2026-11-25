import { h } from "../../lib/ui.ts";
export function mount(el: HTMLElement) { el.append(h("h1", {}, "준비 중")); }
