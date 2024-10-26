import { OptionalInterface } from "../../../types/utils";

export interface TrackingConfigOptions {
	/**
	 * Enable tracking
	 * @default true
	*/
	enabled: boolean;

	/** Google Analytics measurement ID */
	GAMeasurementId: string;
}

export class TrackingConfig {
	enabled: TrackingConfigOptions["enabled"];
	googleAnalyticsMeasurementId: TrackingConfigOptions["GAMeasurementId"];

	constructor(options: OptionalInterface<TrackingConfigOptions> = {}) {
		const { enabled, GAMeasurementId } = options as TrackingConfigOptions;
		
		this.enabled = enabled ?? true;
		this.googleAnalyticsMeasurementId = GAMeasurementId ?? "G-ZFQRR9DP3C";
	}
}