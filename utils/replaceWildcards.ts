export default function normalizeFillable(fillable: string, fill: string): string {
    if (!fill.match(/\.([0-9]+)(?![a-zA-Z]+)/g)) {
      return fillable;
    }
  
    const matches = fill.match(/\.([0-9]+)(?![a-zA-Z]+)/g);
    if (matches) {
      matches.forEach((match) => {
        fillable = fillable.replace(/\.\*/, match);
      });
    }
  
    return fillable;
  }