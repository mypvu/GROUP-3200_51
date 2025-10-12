import { Plot } from "../core/models/specturm.model";
import { DEFAULT_BOUNDS_SPEC } from "./rw";

export function getUpperLowerBound(standard: Plot, bounds = DEFAULT_BOUNDS_SPEC): { lower: Plot; upper: Plot } {
  const bound_val = bounds["ABS_Bound"];  
  const lower_val = 1 - bound_val;
  const upper_val = 1 + bound_val;
    
  const lower: Plot = standard.map(p => ({
    x: p.x,
    y: p.y * lower_val
  }));    

  const upper: Plot = standard.map(p => ({
    x: p.x,
    y: p.y * upper_val
  }));
    return { lower, upper };
}

export function getConfidence(standard: Plot, unknown: Plot): number {
  const start = Math.max(standard[0].x, unknown[0].x);
  const end = Math.min(standard[standard.length - 1].x, unknown[unknown.length - 1].x);
  const standardInRange = standard.filter(p => p.x >= start && p.x <= end);
  const unknownInRange = unknown.filter(p => p.x >= start && p.x <= end); 
  const length = standardInRange.length;

  const { lower, upper } = getUpperLowerBound(standardInRange, DEFAULT_BOUNDS_SPEC);
  let count = 0;
  for (let i = 0; i < length; i++) {
    const unkY = unknownInRange[i].y;
    const lowY = lower[i].y;
    const upY = upper[i].y;
    if (lowY != null && unkY != null && upY != null) {
      if (lowY <= unkY && unkY <= upY) {
        count++;
      }
    }
  }
  return Number(((count / length) * 100).toFixed(2));
}