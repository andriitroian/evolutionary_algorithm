import { parse, Spec, View } from 'vega';
import * as path from 'path';
import * as fs from 'fs';
import { FunctionSpec } from '../../functions';

const generateGraphicPivots = ({ min = 0, max = 1, fn }) => {
	const step = (max - min) / 500;
	let individual = min;
	const pivots = [];
	while (individual < max) {
		pivots.push({ individual, health: fn(individual) });
		individual += step;
	}
	return pivots;
};

const getPlotConfig = ({ min = 0, max = 1, fn, population }): Spec => ({
	$schema: 'https://vega.github.io/schema/vega/v5.json',
	description: 'Plots two functions using a generated sequence.',
	width: 1200,
	height: 700,
	axes: [
		{ orient: 'bottom', scale: 'x' },
		{ orient: 'left', scale: 'y' },
	],
	data: [
		{
			name: 'table',
			values: generateGraphicPivots({ min, max, fn })
		},
		{ name: 'population', values: population }
	],
	scales: [
		{
			name: 'x',
			type: 'linear',
			range: 'width',
			nice: true,
			domain: {data: 'table', field: 'individual'}
		},
		{
			name: 'y',
			type: 'linear',
			range: 'height',
			nice: true,
			zero: true,
			domain: { data: 'table', field: 'health' }
		}
	],
	marks: [
		{
			type: 'line',
			from: { data: 'table' },
			encode: {
				enter: {
					x: { scale: 'x', field: 'individual' },
					y: { scale: 'y', field: 'health' },
					strokeWidth: { value: 1 },
					interpolate: { value: 'linear' }
				}
			}
		},
		{
			type: 'symbol',
			from: { data: 'population' },
			encode: {
				enter: {
					x: { scale: 'x', field: 'individual' },
					y: { scale: 'y', field: 'health' },
					size: { value: 40 },
					stroke: { value: 'red' },
					fill: { value: 'transparent' }
					// fill: { value: 'blue' }
				}
			}
		}
	]
});

export const plot = (funcSpec: FunctionSpec, population) => new View(
	parse(getPlotConfig({ min: funcSpec.min, max: funcSpec.max, fn: funcSpec.fn, population })),
	{ renderer: 'none' }
)
	.toSVG()
	.then(svg => {
		const p = path.resolve(
			path.dirname(require.main.filename),
			`results`,
			// TODO: define path
			`test.svg`,
		);
		
		fs.mkdirSync(p.slice(0, p.lastIndexOf('/')), {recursive: true});
		fs.writeFileSync(p, svg);
	})
	.catch(console.error);
