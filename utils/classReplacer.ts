/* eslint-disable @typescript-eslint/no-explicit-any */
const classify: (classes: string | string[] | Record<string, any>) => string[] = (classes) => {
  if (typeof classes === 'string') {
    return classes.split(' ');
  } else if (Array.isArray(classes)) {
    return classes.flatMap(c => classify(c));
  } else {
    return Object.keys(classes).filter(c => !!classes[c]);
  }
};

export default function createClassReplacer(
  map: Record<string, string>,
  initialClasses: Record<string, string | string[] | Record<string, any>>
): (newClasses: Record<string, string | string[] | Record<string, any>>) => void {
  const elMap: Record<string, Element[]> = {};
  const observers: Record<string, Record<number, MutationObserver>> = {};
  let mapped = false;

  const replace = (classes: Record<string, string | string[] | Record<string, any>>) => {
    Object.keys(map).forEach((entry) => {
      const mapEntry = map[entry];
      if (mapEntry.includes('|')) {
        const [selector, targetClassWithDot] = mapEntry.split('|');
        const targetClass = targetClassWithDot.replace('.', '');

        if (!observers[entry]) {
          observers[entry] = {};
        }

        (elMap[entry] || Array.from(document.querySelectorAll(selector))).forEach((el, i) => {
          const fixClass = (target: Element) => {
            const currentClasses = classify(classes[entry]);
            currentClasses.forEach((c) => {
              if (c.length) {
                el.classList[target.classList.contains(targetClass) ? 'add' : 'remove'](c);
              }
            });
          };

          const handle: MutationCallback = (mutationsList) => {
            for (const mutation of mutationsList) {
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                fixClass(mutation.target as Element);
                getObserver()?.disconnect();
                observe();
                break;
              }
            }
          };

          const registerObserver = () => {
            observers[entry][i] = new MutationObserver(handle);
          };

          const getObserver = (): MutationObserver | undefined => {
            return observers[entry]?.[i];
          };

          const observe = () => {
            getObserver()?.observe(el, {
              attributes: true,
              attributeFilter: ['class'],
              childList: false,
              characterData: false,
            });
          };

          fixClass(el);

          getObserver()?.disconnect();
          registerObserver();
          observe();

          if (!mapped && !elMap[entry]) {
            elMap[entry] = Array.from(document.querySelectorAll(selector));
          }
        });
      } else {
        if (!mapped) elMap[entry] = [];

        (mapped ? elMap[entry] : Array.from(document.querySelectorAll(mapEntry))).forEach((el) => {
          el.className.split(' ').filter(c => !['editor-active'].includes(c)).forEach((c) => {
            if (c.length) el.classList.remove(c);
          });

          classify(classes[entry]).forEach((c) => {
            if (c.length) el.classList.add(c);
          });

          if (!mapped) elMap[entry].push(el);
        });
      }
    });

    mapped = true;
  };

  replace(initialClasses);

  return replace;
}