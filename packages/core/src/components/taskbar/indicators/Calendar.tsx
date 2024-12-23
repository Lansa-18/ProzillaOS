import { useEffect, useState } from "react";
import styles from "./Calendar.module.css";
import { OutsideClickListener } from "../../../hooks/_utils/outsideClick";
import { UtilMenu } from "../menus/UtilMenu";
import { useClassNames } from "../../../hooks/_utils/classNames";

interface CalendarProps {
	hideUtilMenus: boolean;
	showUtilMenu: () => void;
}

export function Calendar({ hideUtilMenus, showUtilMenu }: CalendarProps) {
	const [date, setDate] = useState(new Date());
	const [showMenu, setShowMenu] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setDate(new Date());
		}, showMenu ? 500 : 30000);

		return () => {
			clearInterval(interval);
		};
	}, [showMenu]);

	useEffect(() => {
		if (hideUtilMenus && showMenu) {
			setShowMenu(false);
		}
	}, [hideUtilMenus, showMenu]);

	const updateShowMenu = (show: boolean) => {
		if (show)
			showUtilMenu();

		setShowMenu(show);
	};

	return <OutsideClickListener onOutsideClick={() => { updateShowMenu(false); }}>
		<button className={useClassNames([styles.Button], "Taskbar", "Indicator", "Calendar")} title="Date & Time" tabIndex={0} onClick={() => { updateShowMenu(!showMenu); }}>
			<p>
				{date.toLocaleString("en-GB", {
					hour: "numeric",
					minute: "numeric",
					hour12: false,
				})}
			</p>
			<p>
				{date.toLocaleDateString("en-GB", {
					day: "numeric",
					month: "short",
					year: "numeric",
				})}
			</p>
		</button>
		<UtilMenu active={showMenu} setActive={setShowMenu} className={styles.Menu}>
			<p className={styles.Time}>{date.toLocaleString("en-GB", {
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
				hour12: false,
			})}</p>
			<p className={styles.Date}>{date.toLocaleString("en-GB", {
				weekday: "long",
				day: "numeric",
				month: "long",
				year: "numeric",
			})}</p>
		</UtilMenu>
	</OutsideClickListener>;
}