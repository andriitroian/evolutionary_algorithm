import { getStatsCollector } from './stats';
import { getTerminationCondition } from './termination';
import { buildPath } from './utils';
import { Population } from './interfaces';
import { getSelectionFunction } from './selection';
import { FunctionSpec } from './functions/interfaces';
import { cloneDeep } from 'lodash';

export const run = (
	fnSpec: FunctionSpec,
	mutation: Function,
	_population: Population,
	selectionOptions: {type: string, param: number},
	run: number
) => {
	let population = cloneDeep(_population);
	const N = _population.length;
	const resultsDirPath = buildPath(fnSpec, N, `${selectionOptions.type}_${selectionOptions.param}`, run);
	let stats = getStatsCollector(fnSpec, resultsDirPath);
	let selection = getSelectionFunction(selectionOptions);
	let shouldTerminate = getTerminationCondition(!mutation);
	let iteration = 0;
	while(!shouldTerminate(population, iteration)) {
		const {nextGeneration, reproduction_rate, loss_of_diversity} = selection(population);
		let newGeneration = nextGeneration;
		if (!!mutation) {
			newGeneration = mutation(nextGeneration);
		}
		stats.collect(iteration, population, newGeneration, reproduction_rate, loss_of_diversity);
		population = newGeneration;
		iteration++;
	}
	stats.finish();
	stats = null;
	selection = null;
	shouldTerminate = null;
	global.gc();
};
