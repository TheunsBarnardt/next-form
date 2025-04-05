// lib/validators/UniqueValidator.ts

import Validator from '../validator';

interface UniqueValidationEndpoint {
  url: string;
  method?: 'get' | 'post' | 'put' | 'delete' | string;
}

type UniqueEndpointFunction = (
  value: any,
  name: string,
  requestParams: Record<string, any>,
  // element$: any, // Type this appropriately if you have a shared type
  // form$: any      // Type this appropriately if you have a shared type
) => Promise<boolean>;

type UniqueEndpoint = UniqueValidationEndpoint | UniqueEndpointFunction | null;

interface VueformConfig {
  endpoints?: {
    unique?: UniqueEndpoint;
  };
}

// Assume you have a way to make HTTP requests (e.g., axios)
// import axios from 'axios';

export default class UniqueValidator extends Validator {
  public get isAsync(): boolean {
    return true;
  }

  protected get requestParams(): Record<string, any> {
    const params: Record<string, any> = {};
    this.attributes.forEach((param, key) => {
      let requestParam: string | number = key;

      if (!isNaN(Number(key))) {
        requestParam = param;
      }

      if (requestParam === 'debounce') {
        return;
      }

      // In a React/Next.js context, you would likely access form values differently
      // You might need to pass a function or a ref to the form state
      // For this example, we'll assume you have a way to get form values by name
      const elValue = this.getFormValue(String(requestParam));

      params[Object.keys(params).length] = elValue !== undefined && key !== 0 ? elValue : requestParam;
    });
    return params;
  }

  // Placeholder for a function to get form values (you'll need to implement this)
  protected getFormValue(name: string): any | undefined {
    // This is where you would access your form state or form data
    // Example: If you have a state object `formData` and input names match keys
    // return this.formData[name];
    return undefined; // Replace with your actual form value retrieval logic
  }

  public async check(value: any): Promise<boolean> {
    const name = this.attributeName; // Using attributeName as a likely equivalent to element$.name
    const endpoint: UniqueEndpoint = this.getUniqueEndpoint();
    const method = typeof endpoint !== 'function' && endpoint ? endpoint.method : 'post'; // Default to POST

    let res: boolean | any;

    if (typeof endpoint === 'function') {
      // Assuming you have access to form data and element information here
      // You might need to pass these as arguments to the validator or have them accessible in some other way
      res = await endpoint(value, name, this.requestParams /*, this.element$, this.form$ */);
    } else if (endpoint && endpoint.url) {
      try {
        // Replace with your actual HTTP request library (e.g., axios)
        // const response = await axios.request({
        //   url: endpoint.url,
        //   method,
        //   [method.toLowerCase() === 'get' ? 'params' : 'data']: {
        //     params: this.requestParams,
        //     name,
        //     value,
        //   },
        // });
        // res = response.data;

        // Placeholder for HTTP request - replace with your implementation
        console.log('Making unique validation request to:', endpoint.url, method, {
          params: this.requestParams,
          name,
          value,
        });
        // Simulate a successful unique response for now
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        res = true;
      } catch (error: any) {
        console.error('Unique validation request failed:', error);
        res = false; // Or handle error response based on your API
      }
    } else {
      console.warn('No unique validation endpoint configured.');
      return true; // If no endpoint, consider unique (or handle differently)
    }

    return Boolean(res); // Ensure the result is a boolean
  }

  protected getUniqueEndpoint(): UniqueEndpoint {
    // This assumes you have a global configuration object for your application
    // where the unique endpoint is defined. You'll need to adapt this
    // to how your Next.js application manages configuration.
    // Example:
    // import config from '@/config';
    // return config?.vueform?.endpoints?.unique;
    return null; // Replace with your actual configuration retrieval
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be unique.`;
  }
}