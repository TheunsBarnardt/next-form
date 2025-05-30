const defaultProps = {
    props: {
      rules: {
        required: false,
        type: [Array, String, Object],
        default: null
      },
      messages: {
        required: false,
        type: [Object],
        default: () => ({})
      },
      fieldName: {
        required: false,
        type: [String, Object],
        '@default': 'name|label'
      },
      displayErrors: {
        required: false,
        type: [Boolean],
        default: true,
      },
    }
  }

  export default defaultProps;