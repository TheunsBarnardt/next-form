// lib/validators/DimensionsValidator.ts

import Validator from '../validator';

interface ImageDimensions {
  width: number;
  height: number;
}

export default class DimensionsValidator extends Validator {
  public get isAsync(): boolean {
    return true;
  }

  private async readImage(inputFile: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => {
        reader.abort();
        reject(new DOMException('File cannot be parsed.'));
      };

      reader.onloadend = (event) => {
        resolve(event.target?.result);
      };

      reader.readAsDataURL(inputFile);
    });
  }

  private async loadImage(dataUrl: string | ArrayBuffer | null): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onerror = () => {
        reject(new DOMException('Image could not be loaded.'));
      };

      image.onload = () => {
        resolve({ width: image.width, height: image.height });
      };

      image.src = dataUrl as string;
    });
  }

  private hasAttribute(attribute: string): boolean {
    return Object.keys(this.attributes)
      .map((a) => a.toLowerCase())
      .includes(attribute.toLowerCase());
  }

  public async check(value: any): Promise<boolean> {
    if (!(value instanceof File)) {
      return false;
    }

    const imageSource = await this.readImage(value);
    if (!imageSource) {
      return false;
    }

    try {
      const image = await this.loadImage(imageSource);

      if (this.hasAttribute('min_width') && image.width < Number(this.attributes['min_width'])) {
        return false;
      }

      if (this.hasAttribute('max_width') && image.width > Number(this.attributes['max_width'])) {
        return false;
      }

      if (this.hasAttribute('min_height') && image.height < Number(this.attributes['min_height'])) {
        return false;
      }

      if (this.hasAttribute('max_height') && image.height > Number(this.attributes['max_height'])) {
        return false;
      }

      if (this.hasAttribute('width') && image.width !== Number(this.attributes['width'])) {
        return false;
      }

      if (this.hasAttribute('height') && image.height !== Number(this.attributes['height'])) {
        return false;
      }

      if (this.hasAttribute('ratio')) {
        const ratioStr = this.attributes['ratio'].toString();
        const [numeratorStr, denominatorStr = '1'] = ratioStr.split('/');
        const numerator = parseFloat(numeratorStr);
        const denominator = parseFloat(denominatorStr);

        if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
          console.warn(`Invalid ratio provided: ${ratioStr}`);
          return false;
        }

        const expectedRatio = numerator / denominator;
        const actualRatio = image.width / image.height;
        const precision = 1 / (Math.min(image.width, image.height) + 1);

        if (Math.abs(expectedRatio - actualRatio) > precision) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating image dimensions:', error);
      return false;
    }
  }

  protected get messageParams() {
    const params: Record<string, string | number> = { attribute: this.attributeName };
    for (const key of Object.keys(this.attributes)) {
      params[key.toLowerCase()] = this.attributes[key];
    }
    return params;
  }

  protected getDefaultMessage(): string {
    let message = `The :attribute has invalid dimensions.`;
    if (Object.keys(this.attributes).length > 0) {
      message += ' Expected: ';
      const constraints: string[] = [];
      if (this.hasAttribute('min_width')) constraints.push(`min-width :min_width`);
      if (this.hasAttribute('max_width')) constraints.push(`max-width :max_width`);
      if (this.hasAttribute('width')) constraints.push(`width :width`);
      if (this.hasAttribute('min_height')) constraints.push(`min-height :min_height`);
      if (this.hasAttribute('max_height')) constraints.push(`max-height :max_height`);
      if (this.hasAttribute('height')) constraints.push(`height :height`);
      if (this.hasAttribute('ratio')) constraints.push(`ratio :ratio`);
      message += constraints.join(', ');
    }
    return message;
  }
}