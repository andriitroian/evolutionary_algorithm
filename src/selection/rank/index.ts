import { random, sortBy, sumBy, times } from 'lodash';
import { Population } from '../../interfaces';
import { withRRAndLOD } from '../utils';
import { RANK_SELECTION_TYPE } from './constants';

const linearRankProbabilityFactory = (b, N) => (index) => ((2 - b)/N) + ((2 * index * (b - 1))/(N * (N-1)));

const expRankProbabilityFactory = (c, N) => (index) => ((c - 1)/(Math.pow(c, N) - 1)) * Math.pow(c, N - (index + 1));

const PROBABILITY_FUNCTION_FACTORY = {
	[RANK_SELECTION_TYPE.LINEAR]: linearRankProbabilityFactory,
	[RANK_SELECTION_TYPE.EXPONENTIAL]: expRankProbabilityFactory,
}

const sus = (population: { chromosome: string, health: number, probability: number }[]) => {
	const N = population.length;
	const pivots = population.map((a, i, arr) => N * a.probability + sumBy(arr.slice(0, i), ({probability}) => probability * N));
	const randomNumber = random(true);
	const selectedPoints = times(N, (i) => randomNumber + i);
	const selectedIndividualsIndex = selectedPoints.map(point => {
		return pivots.findIndex((pivot, index) => point > (pivots[index - 1] || 0) && point <= pivot);
	});
	return selectedIndividualsIndex.map(index => ({
		individual: {chromosome: population[index].chromosome, health: population[index].health },
		index
	}));
};

export const rank = (type: string) => (param: number) => (population: Population) => {
	const N = population.length;
	const getRankProbability = PROBABILITY_FUNCTION_FACTORY[type](param, N);
	const sortedPopulation = sortBy(population, 'health');
	const populationWithProbabilities = sortedPopulation.map((individual, index) => {
		return { ...individual, probability:getRankProbability(index)};
	});
	return withRRAndLOD(sus(populationWithProbabilities));
};
