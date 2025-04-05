import each from 'lodash/each';
import { Slots, Emits } from 'vue'; // Assuming this is for Vue.js

interface ResolveDepsOptions {
  deps?: Record<string, any>;
  [key: string]: any; // Allow other arbitrary options
}

interface ResolveDepsContext {
  emits: Emits;
  slots: Slots;
  features: ((props: Record<string, any>, context: ResolveDepsContext, deps: Record<string, any>, options: ResolveDepsOptions) => Record<string, any>)[];
}

export default function resolveDeps(
  props: Record<string, any>,
  context: ResolveDepsContext,
  options: ResolveDepsOptions
): Record<string, any> {
  let deps = options.deps || {};
  options = {
    ...options,
    events: context.emits,
    slots: context.slots,
  };

  context.features.forEach((feature) => {
    each(feature(props, context, deps, options), (featureDep, key) => {
      deps[key] = featureDep;
    });
  });

  return deps;
}