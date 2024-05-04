import Command from "../command.js";

export const rev = new Command()
	.setManual({
		purpose: "Display the reverse of a text"
	})
	.setExecute(function(args, { rawInputValue }) {
		return rawInputValue.split("").reverse().join("");
	});