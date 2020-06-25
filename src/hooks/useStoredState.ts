import { useState, useCallback } from 'react';

// eslint-disable-next-line import/prefer-default-export
export function useStoredState<T extends string>(key: string, defaultValue: T): [
    T,
    (v: T) => void,
] {
    const previousValue = localStorage.getItem(key) as T;

    const [value, setValue] = useState<T>(previousValue || defaultValue);

    const setValueAndStore = useCallback(
        (v: T) => {
            setValue(v);
            localStorage.setItem(key, v);
        },
        [key],
    );

    return [value, setValueAndStore];
}
