const defaultProps = {
    name: {
      required: true,
      type: [String, Number],
    },
    conditions: {
      required: false,
      type: [Array],
      default: () => ([]),
      // In React, you don't typically mark props as 'private' in the same way Vue does.
      // This would be more of a convention or handled within the component's logic.
    },
    onBeforeCreate: {
      required: false,
      type: [Function],
      default: null,
      // private: true,
    },
    onCreated: {
      required: false,
      type: [Function],
      default: null,
      // private: true,
    },
    onBeforeMount: {
      required: false,
      type: [Function],
      default: null,
      // private: true,
    },
    onMounted: {
      required: false,
      type: [Function],
      default: null,
      // private: true,
    },
    onBeforeUpdate: {
      required: false,
      type: [Function],
      default: null,
      // private: true,
    },
    onUpdated: {
      required: false,
      type: [Function],
      default: null,
      // private: true,
    },
    onBeforeUnmount: {
      required: false,
      type: [Function],
      default: null,
      // private: true,
    },
    onUnmounted: {
      required: false,
      type: [Function],
      default: null,
      // private: true,
    },
  };
  
  export default defaultProps;