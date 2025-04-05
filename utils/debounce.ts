export default function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    onStart?: () => void
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
  
    return function(...args: Parameters<T>): void {
      if (!timeout && onStart) {
        onStart();
      } else if (timeout) {
        clearTimeout(timeout);
      }
  
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(this, args);
      }, wait);
    };
  }