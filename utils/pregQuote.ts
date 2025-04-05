export default function pregQuote(str: string, delimiter?: string): string {
  
    return (str + '')
      .replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
  }