export default (name: string): string | undefined => {
    const parts = name.split('_');
    return parts[parts.length - 2];
  };