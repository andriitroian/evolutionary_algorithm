import { parse, Spec, View } from 'vega';
import * as path from 'path';
import * as fs from 'fs';
import { PlotData, prepareChartData } from './utils';

const getPlotConfig = ({ title, data }: { title: string, data: number[][] }): Spec => {
	return {
		"$schema": "https://vega.github.io/schema/vega/v5.json",
		"description": "A basic line chart example.",
		"width": 500,
		"height": 200,
		"padding": 5,
		"signals": [
			{
				"name": "interpolate",
				"value": "linear",
				"bind": {
					"input": "select",
					"options": [
						"basis",
						"cardinal",
						"catmull-rom",
						"linear",
						"monotone",
						"natural",
						"step",
						"step-after",
						"step-before"
					]
				}
			}
		],
		"data": [
			{
				"name": "table",
				"values": prepareChartData(data)
			}
		],
		"scales": [
			{
				"name": "x",
				"type": "point",
				"range": "width",
				"domain": {"data": "table", "field": "x"}
			},
			{
				"name": "y",
				"type": "linear",
				"range": "height",
				"nice": true,
				"zero": true,
				"domain": {"data": "table", "field": "y"}
			},
			{
				"name": "color",
				"type": "ordinal",
				"range": "category",
				"domain": {"data": "table", "field": "c"}
			}
		],
		"axes": [
			{"orient": "bottom", "scale": "x", "title": "Generation"},
			{"orient": "left", "scale": "y", "title": title}
		],
		"marks": [
			{
				"type": "group",
				"from": {
					"facet": {
						"name": "series",
						"data": "table",
						"groupby": "c"
					}
				},
				"marks": [
					{
						"type": "line",
						"from": {"data": "series"},
						"encode": {
							"enter": {
								"x": {"scale": "x", "field": "x"},
								"y": {"scale": "y", "field": "y"},
								"stroke": {"scale": "color", "field": "c"},
								"strokeWidth": {"value": 2}
							},
							"update": {
								"interpolate": {"signal": "interpolate"},
								"strokeOpacity": {"value": 1}
							},
							"hover": {
								"strokeOpacity": {"value": 0.5}
							}
						}
					}
				]
			}
		]
	}
};

export const plot = ({ title, data, path }: PlotData) => new View(
	parse(getPlotConfig({ title, data })),
	{ renderer: 'none' }
)
	.toSVG()
	.then(svg => {
		fs.mkdirSync(path, {recursive: true});
		fs.writeFileSync(`${path}/${title}.svg`, svg);
	})
	.catch(console.error);
