import each from 'lodash/each';
import cloneDeep from 'lodash/cloneDeep';
import isPlainObject from 'lodash/isPlainObject';
import get from 'lodash/get';
import set from 'lodash/set';
import union from 'lodash/union';
import flattenDeep from 'lodash/flattenDeep';
import { Ref } from 'react'; // Using React's Ref type

interface MergeClassesOptions {
  config?: {
    presets?: Record<string, any>;
    classHelpers?: boolean;
    env?: string;
  };
  component?: string;
  component$?: Ref<any>; // React Ref
  locals?: Record<string, any>;
  view?: string;
  theme?: {
    classes: Record<string, any>;
  };
  templates?: Record<string, any>;
  merge?: any[];
}

const MERGE_KEYS = [
  'presets', 'usePresets', 'addClasses', 'prependClasses', 'removeClasses',
  'replaceClasses', 'overrideClasses'
];

const LOCALS_KEYS = [
  'addClass', 'removeClass', 'replaceClass', 'overrideClass'
];

export default class MergeClasses {
  options: MergeClassesOptions;
  componentClasses: Record<string, any>;

  constructor(options: MergeClassesOptions = {}) {
    this.options = options;

    if (this.shouldMergeTemplateClasses) {
      this.componentClasses = this.templateClasses;

      this.merge({
        overrideClasses: {
          [this.component]: this.themeClasses
        }
      });
    } else {
      this.componentClasses = this.templateClasses;
    }

    this.merge(this.config);

    each(options.merge, (merge) => {
      this.merge(merge);
    });

    // Assuming component$.current holds the relevant object in React
    this.merge(this.locals || this.component$?.current, true);

    if (this.config.classHelpers && this.config.env !== 'production') {
      this.merge({
        prependClasses: {
          [this.component]: this.getClassHelpers(this.componentClasses, [this.component])
        }
      });
    }
  }

  get classes(): Record<string, any> {
    return new Proxy(this.componentClasses, {
      get: (target, prop) => {
        if (typeof prop !== 'string') {
          return target[prop];
        }

        return this.getDynamicClasses(target, prop);
      }
    });
  }

  get config(): MergeClassesOptions['config'] {
    return this.options.config || {};
  }

  get component(): string {
    return this.options.component || '';
  }

  get component$(): Ref<any> | undefined {
    return this.options.component$;
  }

  get locals(): Record<string, any> | undefined {
    return this.options.locals;
  }

  get view(): string | undefined {
    return this.options.view;
  }

  get theme(): MergeClassesOptions['theme'] {
    return this.options.theme || { classes: {} };
  }

  get presets(): Record<string, any> | undefined {
    return this.config?.presets;
  }

  get templates(): Record<string, any> {
    return this.options.templates || {};
  }

  get template(): Record<string, any> {
    return this.view && this.templates[`${this.component}_${this.view}`]
      ? this.templates[`${this.component}_${this.view}`]
      : (this.templates[this.component] || {});
  }

  get themeClasses(): Record<string, any> {
    return cloneDeep(this.toArray(this.view && this.theme.classes[`${this.component}_${this.view}`]
      ? this.theme.classes[`${this.component}_${this.view}`]
      : this.theme.classes[this.component] || {}));
  }

  get templateClasses(): Record<string, any> {
    return cloneDeep(this.toArray(this.defaultClasses));
  }

  get shouldMergeTemplateClasses(): boolean {
    let merge = typeof this.template.data === 'function' && this.template.data().merge !== undefined
      ? this.template.data().merge
      : this.component$?.current?.merge; // Accessing .current for React Ref

    return merge !== undefined ? merge : false;
  }

  get defaultClasses(): Record<string, any> {
    return typeof this.template.data === 'function' && this.template.data().defaultClasses
      ? this.template.data().defaultClasses
      : this.component$?.current?.defaultClasses || {}; // Accessing .current for React Ref
  }

  get mainClass(): string {
    const defaultClasses = typeof this.template.data === 'function' && this.template.data().defaultClasses
      ? this.template.data().defaultClasses
      : this.component$?.current?.defaultClasses || {}; // Accessing .current for React Ref

    return Object.keys(defaultClasses)[0] || '';
  }

  merge(merge: any, locals: boolean = false): void {
    each(this.pick(merge, locals ? LOCALS_KEYS : MERGE_KEYS), (mergables, key) => {
      if (typeof mergables === 'function') {
        mergables = mergables(this.component$?.current?.form$, 'el$' in (this.component$?.current || {}) && typeof this.component$?.current?.el$ === 'object' ? this.component$?.current?.el$ : undefined, this.component$?.current); // Accessing .current for React Ref
      }

      switch (key) {
        case 'addClasses':
        case 'prependClasses':
        case 'overrideClasses':
          if (!mergables || mergables[this.component] === undefined) {
            return;
          }

          this.mergeComponentClasses(this.toArray(mergables[this.component]), key);
          break;

        case 'removeClasses':
        case 'replaceClasses':
          if (!mergables || mergables[this.component] === undefined) {
            return;
          }

          this.mergeComponentClasses(mergables[this.component], key);
          break;

        case 'addClass':
        case 'removeClass':
        case 'replaceClass':
        case 'overrideClass':
          if (!mergables) {
            return;
          }

          if (typeof mergables === 'string' || Array.isArray(mergables)) {
            let classesArray = Array.isArray(mergables) ? mergables : (mergables.length > 0 ? mergables.split(' ') : []);

            this.mergeComponentClasses({
              [this.mainClass]: classesArray
            }, `${key}es`);
          } else if (key === 'replaceClass') {
            this.mergeComponentClasses(mergables, `${key}es`);
          } else if (isPlainObject(mergables)) {
            this.mergeComponentClasses(this.toArray(mergables), `${key}es`);
          } else {
            // Handle other cases if needed
          }
          break;

        case 'presets':
        case 'usePresets':
          if (!Array.isArray(mergables)) {
            return;
          }

          each(mergables, (presetName) => {
            this.merge(this.presets?.[presetName]);
          });
          break;
      }
    });
  }

  mergeComponentClasses(componentClasses: Record<string, any>, key: string): void {
    each(componentClasses, (classes, className) => {
      (this as any)[key](classes, [className]);
    });
  }

  addClasses(add: any, levels: string[]): void {
    let base = get(this.componentClasses, levels.join('.'));

    if (add?.length === 1 && !add[0]) {
      return;
    }

    if (isPlainObject(base)) {
      each(add, (subclasses, subclassName) => {
        this.addClasses(subclasses, levels.concat(subclassName));
      });
    } else {
      set(this.componentClasses, levels.join('.'), union(
        Array.isArray(base) ? base : [],
        Array.isArray(add) ? add : [add]
      ));
    }
  }

  prependClasses(prepend: any, levels: string[]): void {
    let base = get(this.componentClasses, levels.join('.'));

    if (prepend?.length === 1 && !prepend[0]) {
      return;
    }

    if (isPlainObject(base)) {
      each(prepend, (subclasses, subclassName) => {
        this.prependClasses(subclasses, levels.concat(subclassName));
      });
    } else {
      set(this.componentClasses, levels.join('.'), union(
        Array.isArray(prepend) ? prepend : [prepend],
        Array.isArray(base) ? base : []
      ));
    }
  }

  removeClasses(remove: any, levels: string[]): void {
    let base = get(this.componentClasses, levels.join('.'));

    if (isPlainObject(base)) {
      each(remove, (subclasses, subclassName) => {
        this.removeClasses(subclasses, levels.concat(subclassName));
      });
    } else if (Array.isArray(base) && Array.isArray(remove)) {
      set(this.componentClasses, levels.join('.'), base.filter((c) => {
        return typeof c !== 'string' || remove.indexOf(c) === -1;
      }));
    }
  }

  replaceClasses(replace: any, levels: string[]): void {
    let base = get(this.componentClasses, levels.join('.'));

    if (Array.isArray(replace)) {
      let tempReplace: Record<string, string> = {};

      replace.forEach((r) => {
        tempReplace = {
          ...tempReplace,
          ...(isPlainObject(r) ? r : {}),
        };
      });

      replace = tempReplace;
    }

    if (isPlainObject(base)) {
      each(replace, (subclasses, subclassName) => {
        this.replaceClasses(subclasses, levels.concat(subclassName));
      });
    } else if (Array.isArray(base) && isPlainObject(replace)) {
      set(this.componentClasses, levels.join('.'), base.map((c) => {
        return typeof c !== 'string' || !(c in replace)
          ? c
          : replace[c];
      }));
    }
  }

  overrideClasses(override: any, levels: string[]): void {
    let base = get(this.componentClasses, levels.join('.'));

    if (isPlainObject(base)) {
      each(override, (subclasses, subclassName) => {
        this.overrideClasses(subclasses, levels.concat(subclassName));
      });
    } else {
      set(this.componentClasses, levels.join('.'), override);
    }
  }

  toArray(componentClasses: Record<string, any>): Record<string, any> {
    let arrayClasses: Record<string, any> = {};

    each(componentClasses, (classes, className) => {
      arrayClasses[className] = this.classesToArray(classes, [className]);
    });

    return arrayClasses;
  }

  classesToArray(classes: any, path: string[]): any {
    let arrayClasses = classes;
    let base = path ? get(this.componentClasses, path.join('.')) : undefined;

    if (typeof classes === 'string') {
      arrayClasses = classes.length > 0 ? classes.split(' ') : [];
    } else if (isPlainObject(classes)) {
      if (base && Array.isArray(base)) {
        arrayClasses = [classes];
      } else if (!base || isPlainObject(base)) {
        arrayClasses = {};

        each(classes, (subclasses, subclassName) => {
          arrayClasses[subclassName] = this.classesToArray(subclasses, path.concat([subclassName]));
        });
      }
    } else if (typeof classes === 'boolean' || (typeof classes === 'object' && [
      'ComputedRefImpl', 'RefImpl' // These are still Vue's Ref implementations
    ].indexOf(classes?.constructor?.name) !== -1)) {
      throw Error(`Cannot add conditional class to ${this.component}: '${path.join('.')}'`);
    }

    return arrayClasses;
  }

  getDynamicClasses(target: Record<string, any>, prop: string, mainTarget?: Record<string, any>): any {
    if (!mainTarget) {
      mainTarget = target;
    }

    let classes = Array.isArray(target[prop]) ? flattenDeep(target[prop]) : target[prop];

    if (target[`$${prop}`]) {
      let propVal = target[`$${prop}`](mainTarget, this.component$?.current); // Accessing .current for React Ref

      return typeof propVal === 'function' ? propVal : flattenDeep(propVal);
    }

    if (isPlainObject(classes)) {
      classes = cloneDeep(classes);

      each(classes, (classList, className) => {
        classes[className] = this.getDynamicClasses(classes, className, target);
      });
    }

    return classes;
  }

  getClassHelpers(componentClasses: Record<string, any>, path: string[]): Record<string, string[]> {
    let classHelpers: Record<string, string[]> = {};

    each(componentClasses, (classes, className) => {
      if (className.match(/[$]/)) {
        return;
      }

      if (isPlainObject(classes)) {
        classHelpers[className] = this.getClassHelpers(componentClasses[className], path.concat([className]));
      } else {
        classHelpers[className] = [`${path.join('.')}.${className}-->`];
      }
    });

    return classHelpers;
  }

  pick(from: Record<string, any> | undefined, picks: string[]): Record<string, any> {
    let picked: Record<string, any> = {};

    if (!from) {
      return picked;
    }

    each(picks, (pick) => {
      if (pick in from) {
        picked[pick] = from[pick];
      }
    });

    return picked;
  }
}