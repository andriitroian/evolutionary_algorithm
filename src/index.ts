import random from 'random'
import { generatePopulation } from './utils/generatePopulation';
import { FunctionSpec } from './functions';
import { plot } from './utils/plot/plot';

export const run = (fnSpec: FunctionSpec, N: number) => {
	const { OPTIMAL_CHROMOSOM, CHROMOSOM_LENGTH, fn } = fnSpec;
	const population = generatePopulation({
		N,
		chromosomLength: CHROMOSOM_LENGTH,
		optimalChromosom: OPTIMAL_CHROMOSOM
	});
	plot(fnSpec, population.map(c => ({ individual: parseInt(c, 2), health: fn(parseInt(c, 2)) })));
	console.log(population.length);
};
