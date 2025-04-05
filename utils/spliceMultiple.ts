export default function spliceMultiple<T>(array: T[], indexes: number[]): T[] {
    const sortedIndexes = [...indexes].sort((a, b) => b - a); // Sort in descending order to avoid index shifting
  
    for (const index of sortedIndexes) {
      if (index >= 0 && index < array.length) {
        array.splice(index, 1);
      }
    }
  
    return array;
  }