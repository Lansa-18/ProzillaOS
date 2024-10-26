import { randomRange } from "@prozilla-os/shared";
import { App, openUrl } from "../";
import { Vector2 } from "../math/vector2";
import { SystemManager } from "../system/systemManager";
import { TrackingManager } from "../tracking/trackingManager";
import { VirtualFile } from "../virtual-drive/file";
import { FILE_SCHEMES } from "../../constants/virtualDrive.const";

export interface WindowOptions {
	id?: string;
	app?: App;
	size?: Vector2;
	position?: Vector2;
	fullscreen?: boolean | string;
	options?: object;
	isFocused?: boolean;
	lastInteraction?: number;
	minimized?: boolean;
	[key: string]: unknown;
}

export class WindowsManager {
	windows: { [id: string]: WindowOptions };
	updateWindows: (window: WindowsManager["windows"]) => void;
	startupComplete: boolean;

	#systemManager: SystemManager;
	#trackingManager: TrackingManager;

	constructor(systemManager: SystemManager, trackingManager: TrackingManager) {
		this.#systemManager = systemManager;
		this.#trackingManager = trackingManager;
		this.windows = {};
		this.updateWindows = () => {};
		this.startupComplete = false;
	}

	/**
	 * Open a window for an app
	 */
	open(appId: string, options?: WindowOptions | null): object | null {
		const { appsConfig, windowsConfig, taskbarConfig } = this.#systemManager;
		const app = appsConfig.getAppById(appId);

		if (app == null) {
			console.warn(`Failed to open app ${appId}: app not found`);
			return null;
		}

		const size = options?.size ?? app.windowOptions?.size ?? new Vector2(700, 400);
		
		const availableScreenSpace = new Vector2(
			window.innerWidth - windowsConfig.screenMargin * 2,
			window.innerHeight - windowsConfig.screenMargin * 2 - taskbarConfig.height
		);

		let fullscreen = false;

		if (size.x > availableScreenSpace.x) {
			size.x = availableScreenSpace.x;
			fullscreen = true;
		} else if (size.y > availableScreenSpace.y) {
			size.y = availableScreenSpace.y;
			fullscreen = true;
		}

		const position = new Vector2(
			windowsConfig.screenMargin + randomRange(0, availableScreenSpace.x - size.x),
			windowsConfig.screenMargin + randomRange(0, availableScreenSpace.y - size.y)
		);

		if (options?.fullscreen) {
			if (typeof(options.fullscreen) == "string") {
				fullscreen = options.fullscreen.toLowerCase() === "true";
			} else {
				fullscreen = options.fullscreen;
			}

			delete options.fullscreen;
		}

		let id: number | string = 0;
		while (this.windowIds.includes(id.toString())) {
			id++;
		}

		id = id.toString();

		this.#trackingManager.event({
			category: "Actions",
			action: "Opened window",
			label: app.id,
		});

		console.info(`Opening window ${id}:${app.id}`);

		this.windows[id] = {
			id,
			app,
			size,
			position,
			fullscreen,
			options: options as object | undefined,
		};

		this.focus(id);

		app.isActive = true;

		this.updateWindows(this.windows);
		return this.windows[id];
		// console.log(this);
	}

	/**
	 * Opens a file with the associated app or by a method specified by the file scheme
	 * @returns Opened window
	 */
	openFile(file: VirtualFile, options: object = {}): object | null {
		if (file.source != null) {
			if (file.source.startsWith(FILE_SCHEMES.external)) {
				openUrl(file.source.replace(FILE_SCHEMES.external, ""), "_blank");
				return null;
			} else if (file.source.startsWith(FILE_SCHEMES.app)) {
				return this.open(file.source.replace(FILE_SCHEMES.app, ""));
			}
		}

		if (file.extension == null)
			return null;

		const { appsConfig } = this.#systemManager;
		const app = appsConfig.getAppByFileExtension(file?.extension);
		if (app != null) {
			return this.open(app.id, { file, ...options });
		} else {
			return null;
		}
	}

	/**
	 * Close a window
	 */
	close(windowId: string) {
		windowId = windowId.toString();

		if (!this.windowIds.includes(windowId)) {
			console.warn(`Failed to close window ${windowId}: window not found`);
			return;
		}

		const { app } = this.windows[windowId];
		if (app != null) app.isActive = this.isAppActive(app.id);
		
		console.info(`Closing window ${windowId}`);
		delete this.windows[windowId];

		this.updateWindows(this.windows);
		// console.log(this);
	}

	/**
	 * Focus on a specific window
	 */
	focus(windowId: string) {
		windowId = windowId.toString();

		if (!this.windowIds.includes(windowId)) {
			console.warn(`Failed to focus window ${windowId}: window not found`);
			return;
		}

		Object.values(this.windows).forEach((window) => {
			const isFocused = (window.id === windowId);
			window.isFocused = isFocused;

			if (isFocused) {
				window.lastInteraction = Date.now().valueOf();
				window.minimized = false;
			}
		});

		this.updateWindows(this.windows);
	}

	/**
	 * Check whether a window is focused
	 */
	isFocused(windowId: string) {
		return this.windows[windowId].isFocused;
	}

	/**
	 * Check if any window is focused
	 */
	isAnyFocused() {
		let anyFocused = false;

		Object.values(this.windows).forEach((window) => {
			if (window.isFocused)
				return anyFocused = true;
		});

		return anyFocused;
	}

	/**
	 * Change the minimized state of a window
	 * @param minimized - Leave as undefined to toggle the window's minimization state
	 */
	setMinimized(windowId: string, minimized?: boolean) {
		windowId = windowId.toString();

		if (!this.windowIds.includes(windowId)) {
			console.warn(`Failed to set minimized on window ${windowId}: window not found`);
			return;
		}

		const window = this.windows[windowId];
		window.minimized = minimized ?? !window.minimized;

		this.updateWindows(this.windows);
	}

	/**
	 * Minimize all windows
	 */
	minimizeAll() {
		Object.values(this.windows).forEach((window) => {
			window.minimized = true;
		});

		this.updateWindows(this.windows);
	}

	/**
	 * Check if an app has an open window
	 */
	isAppActive(appId: string): boolean {
		let active = false;

		Object.values(this.windows).forEach((window) => {
			if (window.app?.id === appId) {
				active = true;
				return;
			}
		});

		return active;
	}

	/**
	 * Get an opened window of a certain app
	 */
	getAppWindowId(appId: string): string | null {
		let windowId: string | null = null;

		Object.values(this.windows).forEach((window) => {
			if (window.app?.id == appId)
				windowId = window.id as string;
		});

		return windowId;
	}

	setUpdateWindows(updateWindows: WindowsManager["updateWindows"]) {
		this.updateWindows = updateWindows;
	}

	startup(appIds: string[], options: Record<string, unknown>) {
		if (appIds == null || this.startupComplete)
			return;

		appIds.forEach((appId) => {
			this.open(appId, options);
		});

		this.startupComplete = true;
	}

	get windowIds(): string[] {
		return Object.keys(this.windows);
	}
}