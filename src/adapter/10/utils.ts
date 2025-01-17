import { getActualChildren } from "./vnode";
import { VNode } from "preact";
import { ObjPath } from "../../view/components/sidebar/ElementProps";

export function traverse(vnode: VNode, fn: (vnode: VNode) => void) {
	fn(vnode);
	const children = getActualChildren(vnode);
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (child != null) {
			fn(child);
		}
	}
}

export interface SerializedVNode {
	type: "vnode";
	name: string;
}

export function jsonify(
	data: any,
	getVNode: (x: any) => SerializedVNode | null,
): any {
	const vnode = getVNode(data);
	if (vnode != null) return vnode;

	if (Array.isArray(data)) {
		return data.map(x => jsonify(x, getVNode));
	}
	switch (typeof data) {
		case "string":
			return data.length > 300 ? data.slice(300) : data;
		case "function": {
			return {
				type: "function",
				name: data.displayName || data.name || "anonymous",
			};
		}
		case "object":
			if (data === null) return null;
			const out = { ...data };
			Object.keys(out).forEach(key => {
				out[key] = jsonify(out[key], getVNode);
			});
			return out;
		default:
			return data;
	}
}

export function cleanProps(props: any) {
	if (typeof props === "string" || !props) return null;
	const out = { ...props };
	if (!Object.keys(out).length) return null;
	return out;
}

let reg = /__cC\d+/;
export function cleanContext(context: Record<string, any>) {
	let res: Record<string, any> = {};
	for (let key in context) {
		if (reg.test(key)) continue;
		res[key] = context[key];
	}

	if (Object.keys(res).length == 0) return null;
	return res;
}

/**
 * Deeply mutate a property by walking down an array of property keys
 */
export function setIn(obj: Record<string, any>, path: ObjPath, value: any) {
	let last = path.pop();
	let parent = path.reduce((acc, attr) => (acc ? acc[attr] : null), obj);
	if (parent && last) {
		parent[last] = value;
	}
}
