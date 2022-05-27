import { Population } from '../interfaces';
import { getAvgHealth } from '../utils';
import { EPS, HISTORY_LENGTH, MAX_NUMBER_OF_ITERATIONS } from './constants';

const avgHealthIsStable = (avgHealthHistory) => {
	return avgHealthHistory.length === HISTORY_LENGTH
    && avgHealthHistory.every((h, i) => {
        if (i === 0) { return true; }
        return Math.abs(h - avgHealthHistory[i-1]) <= EPS;
    });
}

export const populationConverged = (population: Population) => population.every(({ chromosome }) => chromosome === population[0].chromosome);

export const getTerminationCondition = (shouldConverge = false) => {
    let avgHealthHistory = [];
    return (population: Population, iteration: number = 0) => {
        const avgHealth = getAvgHealth(population);
		if (avgHealthHistory.length > HISTORY_LENGTH) {
			throw new Error('Invalid history length');
		}
        if (avgHealthHistory.length === HISTORY_LENGTH) {
            avgHealthHistory.shift();
        }
        avgHealthHistory.push(avgHealth);

		const healthUniform = shouldConverge ? populationConverged(population) : avgHealthIsStable(avgHealthHistory);
		const terminate = iteration >= MAX_NUMBER_OF_ITERATIONS || healthUniform;
		if (terminate) { avgHealthHistory = null; }
        return terminate;
    };
}
