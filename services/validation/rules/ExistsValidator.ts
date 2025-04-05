// lib/validators/ExistsValidator.ts

import Validator from '../validator';

interface ExistsEndpointConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

type ExistsEndpoint = string | ExistsEndpointConfig | ((value: any, fieldName: string, params: Record<string, any>, ...args: any[]) => Promise<any>);

export default class ExistsValidator extends Validator {
  public isAsync: boolean = true;
  private endpoint: ExistsEndpoint | null = null;
  private customParams: Record<string, any> = {};

  public setEndpoint(endpoint: ExistsEndpoint): this {
    this.endpoint = endpoint;
    return this;
  }

  public setCustomParams(params: Record<string, any>): this {
    this.customParams = params;
    return this;
  }

  private getRequestParams(): Record<string, any> {
    const params: Record<string, any> = {};
    this.attributes.forEach((param, index) => {
      let requestParam = param;
      if (typeof param === 'string' && param !== 'debounce') {
        // In React, you'll likely fetch these values from your component's state
        // This is a placeholder - you'll need to implement the logic to get
        // values of other related fields.
        // Example: params[index] = getFieldValue(requestParam);
        params[index] = requestParam; // Placeholder
      } else if (typeof param === 'object' && param !== null) {
        Object.keys(param).forEach((key) => {
          if (key !== 'debounce') {
            params[key] = (param as Record<string, any>)[key]; // Placeholder
          }
        });
      }
    });
    return { ...params, ...this.customParams };
  }

  public async check(value: any, fieldName: string): Promise<boolean> {
    if (!this.endpoint) {
      console.warn('ExistsValidator: Endpoint URL not set.');
      return false;
    }

    const requestParams = this.getRequestParams();

    try {
      let response: any;
      if (typeof this.endpoint === 'function') {
        response = await this.endpoint(value, fieldName, requestParams);
      } else {
        const endpointConfig = typeof this.endpoint === 'string' ? { url: this.endpoint } : this.endpoint;
        const method = endpointConfig.method || 'POST'; // Default to POST

        const requestData: Record<string, any> = {
          ...requestParams,
          [fieldName]: value,
          vueformFieldName: fieldName, // Keeping this name for potential backend compatibility
          value: value,
          name: fieldName,
        };

        const headers = {
          'Content-Type': 'application/json',
        };

        const fetchOptions: RequestInit = {
          method,
          headers,
        };

        if (method.toLowerCase() === 'get') {
          const queryParams = new URLSearchParams(requestData);
          fetchOptions.body = undefined;
          response = await fetch(`${endpointConfig.url}?${queryParams.toString()}`);
        } else {
          fetchOptions.body = JSON.stringify(requestData);
          response = await fetch(endpointConfig.url, fetchOptions);
        }

        if (!response.ok) {
          console.error(`ExistsValidator: Request failed with status ${response.status}`);
          return false;
        }

        response = await response.json();
      }

      return !!response; // Expecting the endpoint to return a truthy value if it exists
    } catch (error) {
      console.error('ExistsValidator: Error during request:', error);
      return false;
    }
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute does not exist.`;
  }
}