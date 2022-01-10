import { minmax } from './util';

// https://www.w3.org/TR/WCAG21/

// TODO only does '#RRGGBB' ones for now, do we ever need to handle anything else?
// TODO needs some error checking
export function parseHexColor(c: string): [number, number, number] {
    return [parseInt(c.slice(1,3), 16)/255, parseInt(c.slice(3,5), 16)/255, parseInt(c.slice(5,7), 16)/255];
}

export function rgbToLinear(rgb: [number, number, number]){
    // TODO " Draft publications by sRGB's creators further rounded to 12.92, resulting in
    //                a small discontinuity in the curve "
    //            - https://en.wikipedia.org/wiki/SRGB
    //            should i use the more accurate value? probably doesnt matter for 8bpp color lol
    return rgb.map(n=>(n<=0.03928)?(n/12.92): Math.pow((n+0.055)/1.055, 2.4) );
}

export function relativeLuminance(rgb: [number, number, number]) {
    const [r, g, b] = rgbToLinear(rgb);
    return 0.2126*r + 0.7152*g + 0.0722*b;
}

export function contrastRatio(c1: [number, number, number], c2: [number, number, number]){
    const [l2, l1] = minmax(relativeLuminance(c1), relativeLuminance(c2));
    return (l1 + 0.05) / (l2 + 0.05);
}


