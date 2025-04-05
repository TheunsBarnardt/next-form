const defaultProps = {
    props: {
      formatData: {
        required: false,
        type: [Function],
        default: null
      },
      formatLoad: {
        required: false,
        type: [Function],
        default: null
      },
      submit: {
        required: false,
        type: [Boolean],
        default: true
      },
    }
  }
  export default defaultProps;