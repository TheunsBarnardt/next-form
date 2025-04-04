import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import each from 'lodash/each';
import countryPhones from '@vueform/country-phones';

interface BaseProps {
  include?: string[];
  exclude?: string[];
  mask?: any; // Type this based on your mask plugin
}

interface BaseDependencies {
  focus: () => void;
  value: React.MutableRefObject<string | number | null>;
  input: React.MutableRefObject<HTMLInputElement | null>;
  form$: any; // Define the structure of your form$
  el$: any; // Define the structure of your el$
  classes: React.MutableRefObject<any>; // Define the structure of your classes
  emit: (event: string, ...args: any[]) => void;
}

interface CountryOption {
  c: string;
  cc: string;
  l: string;
  n: string;
  p: number;
  m: [number, string][];
  value: string;
  label: string;
  index?: number;
  display: React.FC<any>;
  valueDisplay: React.FC<any>;
}

interface BaseReturn {
  options$: React.MutableRefObject<any>; // Type this based on your options component
  addonOptions: CountryOption[];
  handleOptionSelect: (option: CountryOption) => void;
  addonPlaceholder: React.FC<any>;
  maskPluginInstalled: boolean;
  inputType: 'text' | 'tel';
  mask: any; // Type this based on your mask plugin
  handleOpen: () => void;
  handleClose: () => void;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { include, exclude, mask: maskProp } = props;
  const { focus, value, input, form$, el$, classes, emit } = dependencies;

  const options$ = useRef<any>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  const addonPlaceholder = useMemo(() => {
    return ({ option, el$ }: { option: any; el$: any }) => {
      return (
        <div
          className={classes.current.placeholder}
          style={{
            backgroundPosition: `0 -${(option.p * 20) + 20}px`,
          }}
        />
      );
    };
  }, [classes]);

  const addonOptions = useMemo(() => {
    return countryPhones
      .filter((c) => {
        if (!include?.length && !exclude?.length) {
          return true;
        }

        if (include?.length) {
          return include.map((c) => c.toUpperCase()).indexOf(c.c) !== -1;
        }

        return exclude?.map((c) => c.toUpperCase()).indexOf(c.c) === -1;
      })
      .map((c) => ({
        ...c,
        value: c.c,
        label: form$?.translations?.vueform?.countries?.[c.c] || c.l,
        display: markRaw(({ option, index, selected, pointed, el$ }: any) => (
          <div className={classes.current.option(selected || pointed)}>
            <div className={classes.current.optionWrapper}>
              <div
                className={classes.current.flag}
                style={{
                  backgroundPosition: `0 -${(option.p * 20) + 20}px`,
                }}
              />
              <div className={classes.current.country}>
                {option.label}
                <span className={classes.current.number}>{option.n}</span>
              </div>
            </div>
          </div>
        )),
        valueDisplay: markRaw(({ option, el$ }: any) => (
          <div
            className={classes.current.flag}
            style={{
              backgroundPosition: `0 -${(option.p * 20) + 20}px`,
            }}
          />
        )),
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((c, i) => ({ ...c, index: i }));
  }, [include, exclude, form$, classes]);

  const maskPluginInstalled = useMemo(() => {
    return !!maskProp;
  }, [maskProp]);

  const inputType = useMemo(() => {
    return maskPluginInstalled ? 'text' : 'tel';
  }, [maskPluginInstalled]);

  const masks = useMemo(() => {
    return addonOptions.reduce((prev, curr) => {
      return curr.m.reduce((p, c) => ({ ...p, [c[0]]: curr.c }), { ...prev });
    }, {});
  }, [addonOptions]);

  const mask = useMemo(() => {
    if (!maskPluginInstalled) {
      return undefined;
    }

    const masksByFormat: Record<string, number[]> = {};
    const maskLengths: number[] = [];

    addonOptions.forEach((c) =>
      c.m.forEach((m) => {
        if (!masksByFormat[m[1]]) {
          masksByFormat[m[1]] = [];
        }
        const length = m[0].toString().length;
        if (!masksByFormat[m[1]][length]) {
          masksByFormat[m[1]][length] = [];
        }
        masksByFormat[m[1]][length].push(parseInt(m[0].toString(), 10));
        if (maskLengths.indexOf(length) === -1) {
          maskLengths.push(length);
        }
      })
    );

    maskLengths.sort((a, b) => b - a);

    const maskConfig: any[] = [];

    maskLengths.forEach((length) => {
      Object.keys(masksByFormat).forEach((m) => {
        if (masksByFormat[m][length]) {
          maskConfig.push({
            mask: m,
            startsWith: masksByFormat[m][length],
            placeholder: true,
          });
        }
      });
    });

    maskConfig.push({
      mask: '+9999999[9999999]',
      startsWith: '',
    });

    return { mask: maskConfig };
  }, [maskPluginInstalled, addonOptions]);

  const setFlag = useCallback(() => {
    if (!value.current) {
      if (options$.current?.selected) {
        options$.current.reset();
      }
      return;
    }

    if ((value.current && !String(value.current).startsWith('+')) || value.current === options$.current?.selected?.n) {
      return;
    }

    let number = String(value.current).replace('+', '');
    const lengths = [7, 5, 4, 3, 2, 1].filter((l) => number.length >= l);
    let country: string | undefined;

    lengths.forEach((l) => {
      if (country) {
        return;
      }
      country = masks[number.slice(0, l)];
    });

    if (!country) {
      if (options$.current?.selected) {
        options$.current.reset();
      }
      return;
    }

    if (country === 'MF') {
      country = 'GP';
    }

    const option = addonOptions.find((c) => c.c === country);

    if (option && options$.current?.selected?.index !== option.index) {
      options$.current.selectOption(option);
    }
  }, [value, options$, masks, addonOptions]);

  const handleOptionSelect = useCallback(
    (option: CountryOption) => {
      if (document.activeElement === input.current) {
        emit('select', option, el$.current);
        return;
      }

      if (option.n === undefined) {
        el$.current.clear();
      } else if (maskPluginInstalled) {
        const valueMatchesMask = value.current
          ? option.m.map((m) => `+${m[0]}`).find((m) => String(value.current).startsWith(m))
          : false;

        if (!valueMatchesMask) {
          el$.current.update(option.m.length === 1 ? `+${option.m[0][0]}` : option.n);
        }

        if (document.activeElement?.closest('[data-dropdown-for]')) {
          focus();
          input.current?.setSelectionRange(
            String(input.current?.value).length,
            String(input.current?.value).length
          );
        }
      } else {
        el$.current.update(option.n);
      }

      emit('select', option, el$.current);
    },
    [input, emit, el$, maskPluginInstalled, focus, value]
  );

  const handleOpen = useCallback(() => {
    emit('open', el$);
  }, [emit, el$]);

  const handleClose = useCallback(() => {
    emit('close', el$);
  }, [emit, el$]);

  useEffect(() => {
    setFlag();
  }, [setFlag]);

  useEffect(() => {
    setFlag();
  }, [value, setFlag]);

  return {
    options$,
    addonOptions,
    handleOptionSelect,
    addonPlaceholder,
    maskPluginInstalled,
    inputType,
    mask,
    handleOpen,
    handleClose,
  };
};

// Helper function to mark a React component as raw (similar to markRaw in Vue)
function markRaw<T extends React.FC<any>>(component: T): T {
  (component as any).__raw__ = true;
  return component;
}

export default useBase;