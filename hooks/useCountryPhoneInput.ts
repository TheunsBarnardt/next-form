// src/hooks/useCountryPhoneInput.ts

import { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext
import { ConfigContext, useConfig } from '../contexts/ConfigContext'; // Assuming you have a ConfigContext
import countryPhones from '@vueform/country-phones';

type Country = {
  c: string; // Country code
  n: string; // National dialing code
  p: number; // Position for flag sprite
  m: [number, string][]; // Masks (prefix, mask string)
  label?: string; // Added later
  value?: string; // Added later
  display?: React.ComponentType<any>; // Added later
  valueDisplay?: React.ComponentType<any>; // Added later
  index?: number; // Added later
};

type CountryPhoneInputProps = {
  include?: string[];
  exclude?: string[];
  mask?: any; // Type for mask plugin (adjust if you have specific types)
  focus: () => void;
  value: string | null;
  onValueChange: (newValue: string | null) => void;
  input: React.RefObject<HTMLInputElement>;
  el$: any; // Ref to the element instance (adjust type if needed)
  classes: any; // Classes object (adjust type if needed)
  onSelect: (option: Country, el$: any) => void;
  onOpen: (el$: any) => void;
  onClose: (el$: any) => void;
};

const useCountryPhoneInput = ({
  include: includeProp,
  exclude: excludeProp,
  mask: maskProp,
  focus,
  value,
  onValueChange,
  input,
  el$,
  classes,
  onSelect,
  onOpen,
  onClose,
}: CountryPhoneInputProps) => {
  const { translations } = useContext(FormContext) || {
    translations: { vueform: { countries: {} } },
  };
  const options$ = useRef<any>(null); // Ref for the options component (if you create one)

  const addonPlaceholder = useMemo(() => {
    return ({ option }: { option: Country }) => (
      <div
        className={classes.placeholder}
        style={{ backgroundPosition: `0 -${(option.p * 20) + 20}px` }}
      />
    );
  }, [classes]);

  const addonOptions = useMemo(() => {
    return countryPhones
      .filter((c) => {
        if (!includeProp?.length && !excludeProp?.length) {
          return true;
        }

        if (includeProp?.length) {
          return includeProp.map((code) => code.toUpperCase()).indexOf(c.c) !== -1;
        }

        return excludeProp?.map((code) => code.toUpperCase()).indexOf(c.c) === -1;
      })
      .map((c, index) => ({
        ...c,
        value: c.c,
        label: translations.vueform.countries[c.c] || c.c,
        display: ({ option, selected, pointed }: { option: Country; selected: boolean; pointed: boolean }) => (
          <div className={classes.option(selected || pointed)}>
            <div className={classes.optionWrapper}>
              <div className={classes.flag} style={{ backgroundPosition: `0 -${(option.p * 20) + 20}px` }} />
              <div className={classes.country}>
                {option.label}
                <span className={classes.number}>{option.n}</span>
              </div>
            </div>
          </div>
        ),
        valueDisplay: ({ option }: { option: Country }) => (
          <div className={classes.flag} style={{ backgroundPosition: `0 -${(option.p * 20) + 20}px` }} />
        ),
        index,
      }))
      .sort((a, b) => (a.label || a.c).localeCompare(b.label || b.c));
  }, [includeProp, excludeProp, translations, classes]);

  const maskPluginInstalled = useMemo(() => !!maskProp, [maskProp]);

  const masks = useMemo(() => {
    return addonOptions.reduce((prev, curr) => {
      return curr.m.reduce((p, [prefix, _mask]) => {
        return {
          ...p,
          [prefix]: curr.c,
        };
      }, { ...prev });
    }, {});
  }, [addonOptions]);

  const inputType = useMemo(() => (maskPluginInstalled ? 'text' : 'tel'), [maskPluginInstalled]);

  const setFlag = useCallback(() => {
    if (!value) {
      // Assuming options$ has a reset method if you implement a custom select
      if (options$.current && Object.keys(options$.current.selected || {}).length) {
        options$.current.reset();
      }
      return;
    }

    if ((value && !value.toString().startsWith('+')) || value === options$.current?.selected?.n) {
      return;
    }

    let number = value.replace('+', '');
    const lengths = [7, 5, 4, 3, 2, 1].filter((l) => number.length >= l);
    let country: string | undefined;

    lengths.forEach((l) => {
      if (country) {
        return;
      }
      country = masks[number.slice(0, l)];
    });

    if (!country) {
      if (options$.current && Object.keys(options$.current.selected || {}).length) {
        options$.current.reset();
      }
      return;
    }

    if (country === 'MF') {
      country = 'GP';
    }

    const option = addonOptions.find((c) => c.c === country);

    if (option && options$.current?.selected?.index !== option.index) {
      // Assuming options$ has a selectOption method
      options$.current?.selectOption(option);
    }
  }, [value, addonOptions, masks, options$]);

  const handleOptionSelect = useCallback(
    (option: Country) => {
      if (document.activeElement === input.current) {
        onSelect(option, el$);
        return;
      }

      if (option.n === undefined) {
        // Assuming el$ has a clear method
        el$?.clear();
      } else if (maskPluginInstalled) {
        const valueMatchesMask = value
          ? option.m.map((m) => `+${m[0]}`).find((m) => value.startsWith(m))
          : false;

        if (!valueMatchesMask) {
          // Assuming el$ has an update method
          el$?.update(option.m.length === 1 ? `+${option.m[0][0]}` : option.n);
        }

        if (document.activeElement?.closest('[data-dropdown-for]')) {
          focus();
          input.current?.setSelectionRange(input.current.value.length, input.current.value.length);
        }
      } else {
        // Assuming el$ has an update method
        el$?.update(option.n);
      }

      onSelect(option, el$);
    },
    [input, focus, value, maskPluginInstalled, el$, onSelect]
  );

  const handleOpen = useCallback(() => {
    onOpen(el$);
  }, [el$, onOpen]);

  const handleClose = useCallback(() => {
    onClose(el$);
  }, [el$, onClose]);

  useEffect(() => {
    setFlag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, setFlag]);

  return {
    options$,
    addonOptions,
    handleOptionSelect,
    addonPlaceholder,
    maskPluginInstalled,
    inputType,
    mask: maskProp, // Pass through the mask prop
    handleOpen,
    handleClose,
  };
};

export default useCountryPhoneInput;