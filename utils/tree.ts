export interface FlattenSourceItem {
    path: string;
    children?: FlattenSourceItem[];
  }
  
  export const flatten = (source: FlattenSourceItem[]): string[] => {
    let collection: string[] = [];
  
    source.forEach((item) => {
      collection.push(item.path);
  
      if (item.children) {
        flatten(item.children).forEach((child) => {
          collection.push(child);
        });
      }
    });
  
    return collection;
  };
  
  export interface CollectElements {
    [key: string]: {
      type: 'group' | 'object' | 'list' | string; // Add other possible types if known
      schema?: CollectElements;
      element?: CollectElements['0']; // Type of element within a list
    };
  }
  
  export interface CollectPages {
    [key: string]: {
      elements: string[];
    };
  }
  
  export interface CollectedMember {
    name: string;
    path: string;
    type: string;
    children?: CollectedMember[];
  }
  
  export const collect = (
    elements: CollectElements,
    pages: CollectPages | null,
    prefix: string = ''
  ): CollectedMember[] => {
    const createMember = (name: string): CollectedMember => {
      let element = elements[name];
      let path = prefix.length ? `${prefix}.${name}` : name;
  
      let member: CollectedMember = {
        name,
        path,
        type: element.type,
      };
  
      if (['group', 'object'].includes(element.type) && element.schema && Object.keys(element.schema).length) {
        member.children = collect(element.schema, null, path);
      }
  
      if (element.type === 'list' && element.element && Object.keys(element.element).length) {
        member.children = collect({ 0: element.element }, null, path);
      }
  
      return member;
    };
  
    let children: CollectedMember[] = [];
  
    if (pages && Object.keys(pages).length) {
      Object.values(pages).forEach((page) => {
        page.elements.forEach((name) => {
          children.push(createMember(name));
        });
      });
    } else {
      Object.keys(elements).forEach((name) => {
        children.push(createMember(name));
      });
    }
  
    return children;
  };