// src/utils/validation/rules/completed.ts

import Validator from '../validator';
import { ElementContextValue } from '../../../contexts/ElementContext'; // Adjust path as needed

interface Mask {
  masked: {
    currentMask?: {
      isComplete: boolean;
    };
  };
}

interface CompletedElementContextValue extends ElementContextValue {
  debounce?: number | null;
  Mask?: Mask;
  empty?: boolean;
}

class Completed extends Validator {
  element$!: CompletedElementContextValue; // Explicitly type element$

  get debounce(): number {
    const debounceAttr = this.attributes.debounce;
    if (debounceAttr !== undefined) {
      return typeof debounceAttr === 'string' ? parseInt(debounceAttr, 10) : debounceAttr;
    }

    if (this.element$?.debounce !== null && this.element$?.debounce !== undefined) {
      return this.element$.debounce;
    }

    return 1000;
  }

  check(value: any): boolean {
    if (!this.element$?.Mask) {
      return this.filled(value); // Assuming 'filled' is a method in your base Validator
    }

    const isComplete = this.element$.Mask.masked.currentMask?.isComplete;

    return isComplete === undefined || this.element$?.empty ? true : !!isComplete;
  }
}

export default Completed;