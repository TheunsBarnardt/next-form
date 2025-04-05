/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosInstance } from "axios";
import Validator from "../Validator";

interface EndpointFunction {
  (value: any, element: any, form: any): Promise<boolean>;
}

interface StaticEndpoint {
  method: 'get' | 'post' | 'put' | 'delete';
  url: string;
}

type Endpoint = EndpointFunction | StaticEndpoint;

export default class ActiveUrlValidator extends Validator {
  get isAsync(): boolean {
    return true;
  }

  async check(value: any): Promise<boolean> {
    const endpoint: Endpoint = this.form$?.$vueform?.config?.endpoints?.activeUrl;

    if (!endpoint) {
      console.warn('[active_url] No endpoint defined in config.');
      return false;
    }

    let response: any;

    try {
      if (typeof endpoint === 'function') {
        response = await endpoint(value, this.element$, this.form$);
      } else {
        const axios: AxiosInstance = this.form$?.$vueform?.services?.axios;

        if (!axios) {
          throw new Error('[active_url] Axios service not found.');
        }

        const method = endpoint.method.toLowerCase();
        const payloadKey = method === 'get' ? 'params' : 'data';

        response = await axios.request({
          url: endpoint.url,
          method,
          [payloadKey]: { url: value },
        });

        response = response.data;
      }
    } catch (error) {
      console.error('[active_url] Validation error:', error);
      return false;
    }

    return Boolean(response);
  }
}
