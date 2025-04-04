import { useMemo, useContext } from 'react';
import { localize } from '../../utils'; // Assuming you have localize utility
import { ConfigContext } from '../../utils/configContext'; // Assuming you have ConfigContext
import { FormContext } from '../../utils/formContext'; // Assuming you have FormContext

interface BaseProps {
  content?:
    | string
    | ((el$: any) => string)
    | Record<string, string | ((el$: any) => string)>
    | React.ComponentType<any>
    | React.ReactNode;
}

interface BaseDependencies {
  fieldSlots: React.MutableRefObject<Record<string, any>>; // Type this based on your slot structure
  el$: React.MutableRefObject<any>; // Define the structure of your el$
  form$: React.MutableRefObject<any>; // Define the structure of your form$
}

interface BaseReturn {
  isHtml: boolean;
  componentContent: React.ComponentType<any> | React.ReactNode | undefined;
  slotContent: React.ComponentType<any> | React.ReactNode | undefined;
  resolvedContent: any;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { content } = props;
  const { fieldSlots, el$, form$ } = dependencies;
  const config$ = useContext(ConfigContext);

  const resolvedContent = useMemo(() => {
    let resolved: any = typeof content === 'function' ? content(el$.current) : content;

    if (content && typeof content === 'object' && !React.isValidElement(content) && !(content as React.ComponentType<any>)) {
      if (!('render' in content) && !('template' in content)) {
        resolved = Object.keys(resolved).reduce((prev, curr) => ({
          ...prev,
          [curr]: typeof resolved[curr] === 'function' ? (resolved[curr] as (el: any) => any)(el$.current) : resolved[curr],
        }), {});
        resolved = localize(resolved, config$, form$);
      }
    }

    return form$.current?.$vueform?.sanitize?.(resolved) ?? resolved;
  }, [content, el$, config$, form$]);

  const isHtml = useMemo(() => {
    return typeof resolvedContent === 'string';
  }, [resolvedContent]);

  const resolveComponent = useCallback(
    (component: React.ComponentType<any> | React.ReactNode | undefined) => {
      if (!component) {
        return undefined;
      }

      const resolvedComp: any = { ...component };

      if (!resolvedComp.props) {
        resolvedComp.props = ['el$'];
      } else if (Array.isArray(resolvedComp.props) && !resolvedComp.props.includes('el$')) {
        resolvedComp.props.push('el$');
      } else if (
        typeof resolvedComp.props === 'object' &&
        resolvedComp.props !== null &&
        !('el$' in resolvedComp.props)
      ) {
        resolvedComp.props = {
          ...resolvedComp.props,
          el$: {
            type: Object,
            required: false,
            default: () => ({}),
          },
        };
      }

      return resolvedComp;
    },
    []
  );

  const componentContent = useMemo(() => {
    if (!resolvedContent || (typeof resolvedContent === 'object' && ('render' in resolvedContent || 'template' in resolvedContent))) {
      return resolveComponent(resolvedContent as React.ComponentType<any> | React.ReactNode | undefined);
    }
    return resolvedContent as React.ComponentType<any> | React.ReactNode | undefined;
  }, [resolvedContent, resolveComponent]);

  const slotContent = useMemo(() => {
    const defaultSlot = fieldSlots.current?.default;
    if (!defaultSlot || (typeof defaultSlot === 'object' && ('render' in defaultSlot || 'template' in defaultSlot))) {
      return resolveComponent(defaultSlot as React.ComponentType<any> | React.ReactNode | undefined);
    }
    return defaultSlot as React.ComponentType<any> | React.ReactNode | undefined;
  }, [fieldSlots, resolveComponent]);

  return {
    isHtml,
    componentContent,
    slotContent,
    resolvedContent,
  };
};

export default useBase;