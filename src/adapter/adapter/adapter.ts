import { EmitterFn } from "../hook";
import { Renderer } from "../renderer";
import { copyToClipboard } from "../../shells/shared/utils";
import { createPicker } from "./picker";
import { ID } from "../../view/store/types";
import { createHightlighter } from "./highlight";

export type Path = Array<string | number>;

export interface DevtoolsEvent {
	name: string;
	data: any;
}

export type UpdateType = "props" | "state" | "hooks" | "context";

export interface Adapter {
	highlight(id: ID | null): void;
	inspect(id: ID): void;
	startPickElement(): void;
	stopPickElement(): void;
	log(data: { id: ID; children: ID[] }): void;
	copy(value: string): void;
	update(id: ID, type: UpdateType, path: Path, value: any): void;
	select(id: ID): void;
}

export interface InspectData {
	id: ID;
	name: string;
	type: any;
	context: Record<string, any> | null;
	canEditHooks: boolean;
	hooks: any | null;
	canEditProps: boolean;
	props: Record<string, any> | null;
	canEditState: boolean;
	state: Record<string, any> | null;
}

export function createAdapter(emit: EmitterFn, renderer: Renderer): Adapter {
	const highlight = createHightlighter(renderer);

	const picker = createPicker(
		window,
		renderer,
		id => {
			highlight.highlight(id);
			emit("select-node", id);
		},
		() => {
			emit("stop-picker", null);
			highlight.destroy();
		},
	);

	return {
		inspect(id) {
			if (renderer.has(id)) {
				const data = renderer.inspect(id);
				if (data !== null) {
					emit("inspect-result", data);
				}
			}
		},
		log(data) {
			if (renderer.has(data.id)) {
				renderer.log(data.id, data.children);
			}
		},
		select(id) {
			// Unused
		},
		highlight: id => {
			if (id == null) highlight.destroy();
			else highlight.highlight(id);
		},
		update: renderer.update,
		startPickElement: picker.start,
		stopPickElement: picker.stop,
		copy(value) {
			try {
				const data = JSON.stringify(value, null, 2);
				copyToClipboard(data);
			} catch (err) {
				console.log(err);
			}
		},
	};
}
