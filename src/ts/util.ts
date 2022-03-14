
export function setAllCSSVars(target: HTMLElement | SVGElement, vars: Record<string, string>) {
    for(const k in vars) target.style.setProperty(k, vars[k]);
}

export function random_element_from<T>(from: Array<T>): T {
	return from[Math.floor(Math.random() * from.length)];
}

