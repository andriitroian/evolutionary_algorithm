export interface PlotData {
	data: number[][],
	title: string,
	path: string
}

export const prepareChartData = (data) => (
	data.map((values, c) => values.map((y, x) => ({ x, y, c }))).flat()
);
