import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Window.module.css";
import { faMinus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { ReactSVG } from "react-svg";
import { useWindowsManager } from "../hooks/WindowsManagerContext.js";
import Draggable from "react-draggable";
import { useEffect, useRef, useState } from "react";

export function Window({ id, app, size, position, focused = false }) {
	const windowsManager = useWindowsManager();
	const nodeRef = useRef(null);
	const [maximized, setMaximized] = useState(false);
	const [minimized, setMinimized] = useState(false);

	const [screenWidth, setScreenWidth] = useState(100);
    const [screenHeight, setScreenHeight] = useState(100);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((event) => {
            setScreenWidth(event[0].contentBoxSize[0].inlineSize);
            setScreenHeight(event[0].contentBoxSize[0].blockSize);
        });

        resizeObserver.observe(document.getElementById("root"));
    });

	const classNames = [styles["Window-container"]];
	if (maximized)
		classNames.push(styles.Maximized);
	if (minimized)
		classNames.push(styles.Minimized);

	return (
		<Draggable
			axis="both"
			handle={".Handle"}
			defaultPosition={{ x: position.x, y: position.y }}
			position={null}
			scale={1}
			bounds={{
				top: 0,
				bottom: screenHeight - 55,
				left: -size.x + 85,
				right: screenWidth - 5
			}}
			cancel="button"
			nodeRef={nodeRef}
			disabled={maximized}
		>
			<div
				className={classNames.join(" ")}
				ref={nodeRef}
				style={{
					width: maximized ? screenWidth : size.x,
					height: maximized ? screenHeight : size.y,
				}}
			>
				<div className={`${styles.Header} Handle`}>
					<ReactSVG className={styles["Window-icon"]} src={process.env.PUBLIC_URL + `/media/applications/icons/${app.id}.svg`}/>
					<p>{app.name}</p>
					<button onClick={() => setMinimized(!minimized)}>
						<FontAwesomeIcon icon={faMinus}/>
					</button>
					<button onClick={() => setMaximized(!maximized)}>
						<FontAwesomeIcon icon={faSquare}/>
					</button>
					<button onClick={() => { windowsManager.close(id); }}>
						<FontAwesomeIcon icon={faXmark}/>
					</button>
				</div>
				<div className={styles["Window-content"]}>
					{app.windowContent}
				</div>
			</div>
		</Draggable>
	);
}