import { Population } from '../../interfaces';
import { getAvgHealth } from '../../utils';

const getSigma = (population: Population): number => {
    const avgHealth = getAvgHealth(population);
    const diversity = population.reduce((acc, curr) => acc + Math.pow(curr.health - avgHealth, 2), 0);
    return Math.sqrt((1/(population.length - 1)) * diversity);
};

const getNumberOfOptimalChromosomes = (population: Population, optimal) => population.filter(({ chromosome }) => chromosome === optimal).length;

export const countSelectionIntensity = (prev: Population, curr: Population): number => {
	const sigma = getSigma(prev);
	if (!sigma) { return 0; }
	return (getAvgHealth(curr) - getAvgHealth(prev))/sigma;
}

export const countGrowthRate = (prev: Population, curr: Population, optimal: string) => {
	const currOptimalNumber = getNumberOfOptimalChromosomes(curr, optimal);
	const prevOptimalNumber = getNumberOfOptimalChromosomes(prev, optimal);
    return prevOptimalNumber !== 0 ? currOptimalNumber/prevOptimalNumber : 0;
};

export const countSelectionDifference = (prev: Population, curr: Population) => getAvgHealth(curr) - getAvgHealth(prev);
