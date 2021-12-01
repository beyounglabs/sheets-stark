import { useRef, useEffect, useCallback, useState } from 'react';

export function useCache<T>(
  key: string,
  _data: T,
  fallback: T
): [() => T, (any: T) => void] {
  const firstRender = useRef(true);
  const unloadAdded = useRef(false);
  const [data, setData] = useState<any>(_data);

  useEffect(() => {
    if (unloadAdded.current) {
      return;
    }

    function handler(e) {
      if (process.env.NODE_ENV === 'production') {
        window.localStorage.clear();
      }
    }

    window.addEventListener('unload', handler);

    unloadAdded.current = true;

    return () => {
      window.removeEventListener('unload', handler);
    };
  }, []);

  useEffect(() => {
    if (data == null) {
      return;
    }

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(data));

    return () => {
      window.localStorage.removeItem(key);
    };
  }, [data]);

  return [
    useCallback(() => {
      try {
        return JSON.parse(window.localStorage.getItem(key) || '');
      } catch (e) {
        return fallback;
      }
    }, []),
    setData,
  ];
}
