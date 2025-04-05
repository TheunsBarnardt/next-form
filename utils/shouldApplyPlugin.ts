import each from 'lodash/each';
import difference from 'lodash/difference';

interface Plugin {
  apply?: string | RegExp | (string | RegExp)[];
  config?: any;
  install?: (/* ...args: any[] */) => void; // Type the install function if needed
  [key: string]: any; // Allow other properties
}

export default function shouldApplyPlugin(name: string, plugin: Plugin): boolean {
  if (!plugin.apply && difference(Object.keys(plugin), ['config', 'install']).length > 0) {
    return true;
  }

  let apply = plugin.apply;

  if (!Array.isArray(apply)) {
    apply = apply ? [apply] : [];
  }

  let shouldApply = false;

  each(apply, (condition) => {
    if (typeof condition === 'string' && condition === name) {
      shouldApply = true;
      return false; // Break out of the each loop
    } else if (typeof condition === 'object' && condition instanceof RegExp && name.match(condition)) {
      shouldApply = true;
      return false; // Break out of the each loop
    }
  });

  return shouldApply;
}