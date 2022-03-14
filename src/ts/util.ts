
export function setAllCSSVars(target: HTMLElement | SVGElement, vars: Record<string, string>) {
    for(const k in vars) target.style.setProperty(k, vars[k]);
}

