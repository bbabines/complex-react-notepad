import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
	// Checking if the value exists yet.
	const [value, setValue] = useState<T>(() => {
		const jsonValue = localStorage.getItem(key);
		if (jsonValue === null) {
			if (typeof initialValue === "function") {
				// initialValue is a fxn that returns a type
				return (initialValue as () => T)();
			} else {
				return initialValue;
			}
		} else {
			return JSON.parse(jsonValue);
		}
	});

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [value, key]);

	return [value, setValue] as [T, typeof setValue];
}
