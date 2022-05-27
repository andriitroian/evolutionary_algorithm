import { Population } from '../interfaces';
import { countGrowthRate, countSelectionDifference, countSelectionIntensity } from './pressure';
import * as fs from 'fs';
import { FunctionSpec } from '../functions/interfaces';

const ndjson = require('ndjson');

export const getStatsCollector = ({ optimal }: FunctionSpec, resultsPath: string) => {
	const stream = ndjson.stringify();
	stream.on('data', (line) => {
		fs.mkdirSync(resultsPath, {recursive: true});
		fs.appendFileSync(`${resultsPath}/stats.ndjson`, line);
	});
	return {
		collect: (iteration: number, prev: Population, curr: Population, reproduction_rate: number, loss_of_diversity: number) => {
			const stats = {
				iteration,
				intensity: countSelectionIntensity(prev, curr),
				growth_rate: countGrowthRate(prev, curr, optimal),
				reproduction_rate,
				loss_of_diversity,
				selection_difference: countSelectionDifference(prev, curr),
				population: curr
			};

			stream.write(stats);
		},
		finish: () => {
			stream.end();
		}
	}
}
