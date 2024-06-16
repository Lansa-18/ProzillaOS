import { Command, ExecuteParams } from "../command";

export const echo = new Command()
	.setManual({
		purpose: "Display text on the terminal screen"
	})
	.setExecute(function(args, params) {
		const { rawInputValue } = params as ExecuteParams;
		return rawInputValue;
	});