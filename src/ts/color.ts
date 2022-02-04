const b_exp = 1.414;
const b_thresh = 0.022;
const r_scale = 1.14;
const w_thresh = 0.035991;
const w_factor = 1 / w_thresh;
const w_offset = 0.027;
const p_in = 0.0005;
const p_out = 0.001;

function rgb_to_y(r: number, g: number, b: number): number {
	return (
		Math.pow(r/255, 2.4) * 0.2126729 +
		Math.pow(g/255, 2.4) * 0.7151522 +
		Math.pow(b/255, 2.4) * 0.0721750
	);
}

function f_clamp(y_c: number): number {
	if(y_c >= b_thresh) return y_c;
	else return y_c + Math.pow(b_thresh - y_c, b_exp);
}

export function sRGBToAPCA(fg: [number, number, number], bg: [number, number, number]): number {
	const y_txt = f_clamp(rgb_to_y(...fg));
	const y_bg = f_clamp(rgb_to_y(...bg));

	const s_norm = Math.pow(y_bg, 0.56) - Math.pow(y_txt, 0.57);
	const s_rev = Math.pow(y_bg, 0.65) - Math.pow(y_txt, 0.62);

	const h = Math.abs(y_bg - y_txt);

	let c: number;
	if(h < p_in) c = 0;
	else if(y_txt < y_bg) c = s_norm * r_scale;
	else if(y_txt > y_bg) c = s_rev * r_scale;
	else c = 0;

	let s_apc: number;
	if(Math.abs(c) < p_out) s_apc = 0;
	else if(Math.abs(c) <= w_thresh) s_apc = c - (c * w_factor) * w_offset;
	else if(c > w_thresh) s_apc = c - w_offset;
	else if(c < -w_thresh) s_apc = c + w_offset;
	else s_apc = 0.0;

	const l_c = s_apc * 100;

	return l_c;
}

export function hexToSRGB(s: string): [number, number, number] {
	if(s.startsWith('#')) s = s.slice(1, s.length);
	return [ Number.parseInt(s.slice(0, 2), 16), Number.parseInt(s.slice(2, 4), 16), Number.parseInt(s.slice(4, 6), 16) ];
}

export function srgbToHex([r, g, b]: [number, number, number]): string {
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

