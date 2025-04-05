const getColKey = (name: string): string => {
    const parts = name.split('_');
    return parts[parts.length - 1];
  };

export default getColKey;