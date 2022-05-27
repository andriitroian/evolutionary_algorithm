import { random, times } from 'lodash';
import { Individual, Population } from '../interfaces';
import { FunctionSpec } from '../functions/interfaces';
import { calculateHealth } from '../utils';
import distribution from 'random';

const generateIndividual = (chromosomeLength: number) => times(chromosomeLength, () => random()).join('');

export const generatePopulation = (fnSpec: FunctionSpec, N: number): { population: Population, last: Individual, optimal: Individual } => {
	const { chromosomeLength, optimal, fn, reverseFn, decode, encode, max, min } = fnSpec;
	let population, lastChromosome;

	// Only FH, FHD, FConst has length of chromosome == 100
	if (chromosomeLength === 100) {
		population = times(N-1, () => generateIndividual(chromosomeLength));
		lastChromosome = generateIndividual(chromosomeLength);
	} else {
		const inBounds = (x) => typeof x === 'number' && x >= min && x <= max;
		const normal = distribution.normal(fn(decode(optimal)) / 2, fn(decode(optimal)) / 5);
		population = [];
		while (population.length < N-1) {
			const x = reverseFn(normal());
			if (inBounds(x)) {
				population.push(encode(x));
			}
		}
		while (!inBounds(lastChromosome)) {
			lastChromosome = normal();
		}
	}

	return {
		population: population.map(calculateHealth(fnSpec)),
		last: calculateHealth(fnSpec)(encode(lastChromosome)),
		optimal: calculateHealth(fnSpec)(optimal)
	};
};
