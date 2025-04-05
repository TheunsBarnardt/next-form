const findScrollableParent = (element: Element): Element | null => {
    let currentElement: Element | HTMLElement | null = element.parentElement;
  
    while (currentElement && currentElement !== document.body) {
      const style = window.getComputedStyle(currentElement);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;
  
      const isScrollableY = (overflowY === 'scroll' || overflowY === 'auto') && currentElement.scrollHeight > currentElement.clientHeight;
      const isScrollableX = (overflowX === 'scroll' || overflowX === 'auto') && currentElement.scrollWidth > currentElement.clientWidth;
  
      if (isScrollableY || isScrollableX) {
        return currentElement;
      }
  
      currentElement = currentElement.parentElement;
    }
  
    return null;
  };

export default findScrollableParent;