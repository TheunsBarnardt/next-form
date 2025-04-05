// src/utils/GooglePlacesAutocomplete.ts

import isPlainObject from 'lodash/isPlainObject';

// Extend the Window interface to include the Google Maps object
interface GoogleMapsWindow extends Window {
  google?: {
    maps?: {
      places?: {
        Autocomplete?: new (input: HTMLInputElement, options?: google.maps.places.AutocompleteOptions) => google.maps.places.Autocomplete;
        PlaceResult?: google.maps.places.PlaceResult;
      };
      event?: {
        removeListener: (listener: google.maps.MapsEventListener) => void;
        clearInstanceListeners: (instance: any) => void;
      };
      Geocoder?: new () => google.maps.Geocoder;
      GeocoderRequest?: google.maps.GeocoderRequest;
      GeocoderResult?: google.maps.GeocoderResult;
      GeocoderStatus?: google.maps.GeocoderStatus;
      LatLng?: new (lat: number, lng: number) => google.maps.LatLng;
    };
  };
}

interface GooglePlacesAutocompleteOptions extends google.maps.places.AutocompleteOptions {
  container: HTMLInputElement;
  [key: string]: any; // Allow other Autocomplete options
}

interface FormattedPlace {
  country: string | null;
  country_code: string | null;
  state: string | null;
  state_code: string | null;
  city: string | null;
  zip: string | null;
  address: string | null;
  formatted_address: string | null;
  lat: number | null;
  lng: number | null;
}

class GooglePlacesAutocomplete {
  private autocomplete: google.maps.places.Autocomplete | null = null;
  private autocompleteListener: google.maps.MapsEventListener | null = null;
  private options: Record<string, any> = {};

  init(container: HTMLInputElement, onChange: (value: FormattedPlace, place: google.maps.places.PlaceResult | undefined) => void, options: GooglePlacesAutocompleteOptions) {
    const googleWindow = window as GoogleMapsWindow;
    if (
      googleWindow.google === undefined ||
      googleWindow.google.maps === undefined ||
      googleWindow.google.maps.places === undefined ||
      googleWindow.google.maps.places.Autocomplete === undefined
    ) {
      console.warn('Google Places API missing. Ensure the Google Maps JavaScript API is loaded with the places library.');
      return;
    }

    this.options = options;

    this.autocomplete = new googleWindow.google.maps.places.Autocomplete(container, options);

    this.autocompleteListener = this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();
      onChange(this.formatValue(place), place);
    });
  }

  destroy() {
    const googleWindow = window as GoogleMapsWindow;
    if (this.autocompleteListener && googleWindow.google?.maps?.event) {
      googleWindow.google.maps.event.removeListener(this.autocompleteListener);
      this.autocompleteListener = null;
    }
    if (this.autocomplete && googleWindow.google?.maps?.event) {
      googleWindow.google.maps.event.clearInstanceListeners(this.autocomplete);
      this.autocomplete = null;
    }

    const pac = document.querySelector('.pac-container');
    if (pac) {
      pac.remove();
    }
  }

  formatValue(value: google.maps.places.PlaceResult | undefined): FormattedPlace {
    if (!value || !isPlainObject(value)) {
      return {
        country: null,
        country_code: null,
        state: null,
        state_code: null,
        city: null,
        zip: null,
        address: null,
        formatted_address: null,
        lat: null,
        lng: null,
      };
    }

    const addressComponents = value.address_components || [];

    const streetComponent = this.addressComponent(addressComponents, 'street');
    const streetNumberComponent = this.addressComponent(addressComponents, 'street_number');

    let address: string | null = null;

    if (streetComponent !== null) {
      address = streetComponent;
    }

    if (streetNumberComponent !== null) {
      address += (streetComponent !== null ? ' ' : '') + streetNumberComponent;
    }

    return {
      country: this.addressComponent(addressComponents, 'country'),
      country_code: this.addressComponent(addressComponents, 'country_code'),
      state: this.addressComponent(addressComponents, 'state'),
      state_code: this.addressComponent(addressComponents, 'state_code'),
      city: this.addressComponent(addressComponents, 'city'),
      zip: this.addressComponent(addressComponents, 'zip'),
      address: address,
      formatted_address: value.formatted_address || null,
      lat: value.geometry?.location?.lat() || null,
      lng: value.geometry?.location?.lng() || null,
    };
  }

  addressComponent(addressComponents: google.maps.places.PlaceResult['address_components'], type: keyof TypeMap): string | null {
    const typeMap: TypeMap = {
      country: { field: 'country', type: 'long_name' },
      country_code: { field: 'country', type: 'short_name' },
      state: { field: 'administrative_area_level_1', type: 'long_name' },
      state_code: { field: 'administrative_area_level_1', type: 'short_name' },
      city: { field: 'locality', type: 'long_name' },
      zip: { field: 'postal_code', type: 'long_name' },
      street: { field: 'route', type: 'long_name' },
      street_number: { field: 'street_number', type: 'long_name' },
    };

    let addressComponent: string | null = null;

    each(addressComponents, (component) => {
      if (component.types.includes(typeMap[type].field)) {
        if (['state', 'state_code'].includes(type) && this.addressComponent(addressComponents, 'country_code') !== 'US') {
          return;
        }
        addressComponent = component[typeMap[type].type] || null;
      }
    });

    return addressComponent;
  }
}

interface TypeDescriptor {
  field: string;
  type: 'long_name' | 'short_name';
}

interface TypeMap {
  country: TypeDescriptor;
  country_code: TypeDescriptor;
  state: TypeDescriptor;
  state_code: TypeDescriptor;
  city: TypeDescriptor;
  zip: TypeDescriptor;
  street: TypeDescriptor;
  street_number: TypeDescriptor;
}

export default GooglePlacesAutocomplete;