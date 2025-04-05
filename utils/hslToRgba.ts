/**
 * Converts an HSL color value to RGBA. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l in the HSL string are percentages [0%, 100%] and
 * returns an rgba string with r, g, b in the set [0, 255] and alpha as provided.
 *
 * @param   string  hsl   The HSL color string (e.g., "hsl(120, 60%, 80%)")
 * @param   number  alpha The alpha value (0 to 1)
 * @return  string        The RGBA color string (e.g., "rgba(204,255,153,0.7)")
 */
const hslToRgba = (hsl: string, alpha: number): string => {
    const matches = hsl.match(/hsl\(([0-9\.]+),\s?([0-9\.]+)%,\s?([0-9\.]+)%\)/);
  
    if (!matches) {
      return `rgba(0,0,0,${alpha})`; // Or throw an error for invalid HSL format
    }
  
    const h = parseFloat(matches[1]) / 360;
    const s = parseFloat(matches[2]) / 100;
    const l = parseFloat(matches[3]) / 100;
  
    let r: number, g: number, b: number;
  
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
  
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
  
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
  
    return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${alpha})`;
  };
  
  export default hslToRgba;