export default function isValidJSONString(str: string): boolean {
    try {
      JSON.parse(str);
    } catch (e: any) {
      return false;
    }
  
    return true;
  }