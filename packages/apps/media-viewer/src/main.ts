import { App, AppsConfig, IMAGE_EXTENSIONS } from "@prozilla-os/core";
import { AUDIO_EXTENSIONS } from "./components/MediaViewer";
import { MediaViewer, MediaViewerProps } from "./components/MediaViewer";

const mediaViewer = new App<MediaViewerProps>("Media Viewer", "media-viewer", MediaViewer)
	.setIconUrl("https://os.prozilla.dev/assets/apps/icons/media-viewer.svg")
	.setRole(AppsConfig.APP_ROLES.MediaViewer)
	.setAssociatedExtensions([...AUDIO_EXTENSIONS, ...IMAGE_EXTENSIONS]);

export { mediaViewer };