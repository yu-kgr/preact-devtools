import { h } from "preact";
import s from "./DataInput.css";
import { useCallback, useRef, useState, useMemo } from "preact/hooks";
import { Undo } from "../icons";
import {
	parseValue,
	isStringifiedVNode,
	displayCollection,
	valueToHuman,
} from "./parseValue";
import { focusNext } from "../../../adapter/dom";

export interface InputProps {
	value: any;
	initialValue: any;
	class?: string;
	onChange: (value: any) => void;
}

export function DataInput({
	value,
	onChange,
	initialValue,
	...props
}: InputProps) {
	const hasCheck = typeof value === "boolean";
	const initial = valueToHuman(initialValue);
	const [focus, setFocus] = useState(false);
	const [v, set] = useState(initial);
	const [valid, setValid] = useState(true);
	const ref = useRef<HTMLInputElement>();
	const lastValue = useRef<any>(undefined);

	if (ref.current) {
		ref.current.setCustomValidity(valid ? "" : "Invalid input");
	}

	const onCommit = useCallback((value: any) => {
		try {
			const parsed = typeof value === "string" ? parseValue(value) : value;
			onChange(parsed);
			setValid(true);
		} catch (err) {
			setValid(false);
		}
	}, []);

	let inputVal = useMemo(() => {
		if (!focus) {
			return "" + displayCollection(value);
		} else if (value !== lastValue.current) {
			lastValue.current = value;
			return "" + valueToHuman(value);
		}
		return "" + v;
	}, [v, value, focus]);

	let type: string = typeof value;
	if (value === null) type = "null";
	else if (type === "object" && Array.isArray(value)) type = "array";
	else if (isStringifiedVNode(initial)) {
		type = "vnode";
	} else if (initial.endsWith("()")) {
		type = "function";
	}

	const onKeyDown = useCallback(
		(e: KeyboardEvent) => {
			try {
				if (e.key === "Enter" && !e.shiftKey) {
					focusNext(e.target as any);
					e.preventDefault();
				} else {
					if (typeof parseValue(v) === "number") {
						let next;
						switch (e.key) {
							case "ArrowUp":
								next = "" + (+v + 1);
								break;
							case "ArrowDown":
								next = "" + (+v - 1);
								break;
						}

						if (next !== undefined) {
							set(next);
							onCommit(next);
						}
					}
				}
			} catch (e) {}
		},
		[v],
	);

	const onFocus = useCallback(() => setFocus(true), []);
	const onBlur = useCallback(() => setFocus(false), []);
	const onReset = useCallback(() => {
		setFocus(true);
		if (ref.current) ref.current.focus();
		set(initial);
		onCommit(initial);
	}, [initial, ref]);

	const onInput = useCallback((e: Event) => {
		const next = (e.target as any).value;
		set(next);
		onCommit(next);
	}, []);

	return (
		<div class={s.valueWrapper}>
			{hasCheck && !focus && (
				<input
					class={s.check}
					type="checkbox"
					checked={v === "true"}
					onInput={e => {
						const value = "" + (e.target as any).checked;
						set(value);
						onCommit(value);
					}}
				/>
			)}
			<div class={`${s.innerWrapper} ${hasCheck ? s.withCheck : ""}`}>
				<input
					type="text"
					ref={ref}
					class={`${s.valueInput} ${props.class || ""} ${focus ? s.focus : ""}`}
					value={inputVal}
					onFocus={onFocus}
					onBlur={onBlur}
					onKeyDown={onKeyDown}
					onInput={onInput}
					data-type={type}
				/>
				<button
					class={`${s.undoBtn} ${v !== initial ? s.showUndoBtn : ""}`}
					type="button"
					onClick={onReset}
				>
					<Undo size="s" />
				</button>
			</div>
		</div>
	);
}

export function getEventValue(ev: any) {
	return ev.currentTarget!.checked || ev.currentTarget.value;
}
