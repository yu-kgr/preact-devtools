import { VNode } from "preact";
import { ID } from "../view/store/types";
import { FilterState } from "./adapter/filter";
import { InspectData } from "./adapter/adapter";
import { ObjPath } from "../view/components/sidebar/ElementProps";

export type UpdateType = "props" | "context" | "state";

export interface Renderer {
	getVNodeById(id: ID): VNode | null;
	getDisplayName(vnode: VNode): string;
	findDomForVNode(id: ID): Array<HTMLElement | Text | null> | null;
	findVNodeIdForDom(node: HTMLElement | Text): number;
	applyFilters(filters: FilterState): void;
	has(id: ID): boolean;
	log(id: ID, children: ID[]): void;
	inspect(id: ID): InspectData | null;
	onCommit(vnode: VNode): void;
	onUnmount(vnode: VNode): void;
	flushInitial(): void;
	forceUpdate(id: ID): void;
	update(id: ID, type: UpdateType, path: ObjPath, value: any): void;
}

export enum Elements {
	HTML_ELEMENT = 1,
	CLASS_COMPONENT = 2,
	FUNCTION_COMPONENT = 3,
	FORWARD_REF = 4,
	MEMO = 5,
	SUSPENSE = 6,
}
