// src/utils/AlgoliaPlaces.ts

import isPlainObject from 'lodash/isPlainObject';
import values from 'lodash/values';
import keys from 'lodash/keys';

// Extend the Window interface to include the algolia places object
interface AlgoliaPlacesWindow extends Window {
  places?: (options: any) => AlgoliaPlacesInstance;
}

// Define the structure of the Algolia Places instance
interface AlgoliaPlacesInstance {
  on: (event: string, callback: (e: AlgoliaChangeEvent) => void) => void;
  destroy: () => void;
}

// Define the structure of the Algolia Places change event
interface AlgoliaChangeEvent {
  suggestion: AlgoliaSuggestion;
}

// Define the structure of the Algolia Places suggestion object
interface AlgoliaSuggestion {
  name: string;
  country: string;
  countryCode?: string;
  administrative: string;
  city: string;
  postcode: string;
  value: string;
  latlng: {
    lat: number;
    lng: number;
  };
}

interface AlgoliaPlacesOptions {
  container: string | HTMLElement;
  [key: string]: any; // Allow other Algolia Places options
}

interface FormattedSuggestion {
  country: string;
  country_code: string | null;
  state: string | null;
  state_code: string | null;
  city: string | null;
  zip: string | null;
  address: string | null;
  formatted_address: string;
  lat: number;
  lng: number;
}

class AlgoliaPlaces {
  private places: AlgoliaPlacesInstance | null = null;
  private options: Record<string, any> = {};

  init(container: string | HTMLElement, onChange: (value: FormattedSuggestion, suggestion: AlgoliaSuggestion) => void, options: AlgoliaPlacesOptions) {
    const algoliaWindow = window as AlgoliaPlacesWindow;
    if (algoliaWindow.places === undefined) {
      throw new Error(
        'Algolia Places API missing. Please include script in your project from https://community.algolia.com/places/documentation.html#cdn-script or install via npm and set to `window.places`.'
      );
    }

    this.options = options;

    this.places = algoliaWindow.places(
      Object.assign(
        {},
        {
          container,
        },
        options
      )
    );

    this.places.on('change', (e) => {
      onChange(this.formatValue(e.suggestion), e.suggestion);
    });
  }

  destroy() {
    if (this.places) {
      this.places.destroy();
      this.places = null;
    }
  }

  formatValue(value: AlgoliaSuggestion | any): FormattedSuggestion | any {
    if (!isPlainObject(value)) {
      return value;
    }

    return {
      country: value.country,
      country_code: value.countryCode ? value.countryCode.toUpperCase() : null,
      state: value.countryCode === 'us' ? value.administrative : null,
      state_code: value.countryCode === 'us' ? this.stateCode(value.administrative?.toLowerCase()) : null,
      city: value.city || null,
      zip: value.postcode || null,
      address: value.name || null,
      formatted_address: value.value,
      lat: value.latlng.lat,
      lng: value.latlng.lng,
    };
  }

  stateCode(name: string | undefined | null): string | null {
    if (!name) {
      return null;
    }
    const states: Record<string, string> = {
      AL: 'alabama', AK: 'alaska', AZ: 'arizona', AR: 'arkansas', CA: 'california', CO: 'colorado',
      CT: 'connecticut', DE: 'delaware', DC: 'district of columbia', FL: 'florida', GA: 'georgia',
      HI: 'hawaii', ID: 'idaho', IL: 'illinois', IN: 'indiana', IA: 'iowa', KS: 'kansas', KY: 'kentucky',
      LA: 'louisiana', ME: 'maine', MD: 'maryland', MA: 'massachusetts', MI: 'michigan', MN: 'minnesota',
      MS: 'mississippi', MO: 'missouri', MT: 'montana', NE: 'nebraska', NV: 'nevada', NH: 'new hampshire',
      NJ: 'new jersey', NM: 'new mexico', NY: 'new york', NC: 'north carolina', ND: 'north dakota',
      OH: 'ohio', OK: 'oklahoma', OR: 'oregon', PA: 'pennsylvania', RI: 'rhode island', SC: 'south carolina',
      SD: 'south dakota', TN: 'tennessee', TX: 'texas', UT: 'utah', VT: 'vermont', VA: 'virginia',
      WA: 'washington', WV: 'west virginia', WI: 'wisconsin', WY: 'wyoming',
    };

    if (values(states).indexOf(name) === -1) {
      return null;
    }

    return keys(states)[values(states).indexOf(name)] || null;
  }
}

export default AlgoliaPlaces;