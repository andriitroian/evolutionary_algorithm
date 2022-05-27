import { Individual, Population } from '../interfaces';
import { FunctionSpec } from '../functions/interfaces';
import { MUTATION_PROBABILITY } from './constants';
import { random } from 'lodash';

const flip = (bit: '1' | '0') => bit === '1' ? '0' : '1';

const mutateIndividual = ({chromosome}: Individual, { fn, decode }: FunctionSpec, p: number): Individual => {
	const mutated = chromosome
		.split('')
		.map((bit: '1' | '0') => random(true) < p ? flip(bit) : bit)
		.join('')
	return {
		chromosome: mutated,
		health: fn(decode(mutated))
	};
};

const getMutationProbability = ({ id }: FunctionSpec, N: number, selection: string) => {
	const isRankSelection = /rank/.test(selection);
	const probability = isRankSelection ? MUTATION_PROBABILITY.RANK : MUTATION_PROBABILITY.TOURNAMENT;
	return probability[N][id];
};

export const getMutation = (fnSpec: FunctionSpec, selection: string, N: number) => {
	const probability = getMutationProbability(fnSpec, N, selection);
	return !!probability ?
		(population: Population) => (population.map((individual) => mutateIndividual(individual, fnSpec, probability)))
		: null;
};
