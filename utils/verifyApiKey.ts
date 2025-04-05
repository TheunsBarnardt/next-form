export default function verifyApiKey(license: string): boolean {
    let score = 0;
    const check_digit = license[0];
    let check_digit_count = 0;
    const chunks = license.split('-');
  
    for (const chunk of chunks) {
      if (chunk.length !== 4) {
        return false;
      }
  
      for (const char of chunk) {
        if (char === check_digit) {
          check_digit_count++;
        }
        score += char.codePointAt(0) || 0; // Use 0 as default if codePointAt returns undefined
      }
    }
  
    if (score === 1492 && check_digit_count === 3) {
      return true;
    }
  
    return false;
  }