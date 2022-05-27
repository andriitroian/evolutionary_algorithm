import { random, times, uniq, maxBy, cloneDeep, remove } from 'lodash';
import { Population } from '../../interfaces';
import { withRRAndLOD } from '../utils';

export const tournamentWithReturn = (t: number = 2) => (population: Population) => {
	const N = population.length;
	const selectedIndividuals = times(N, () => {
		let selectedChildrenIndex = times(t, () => random(population.length - 1));
		while (uniq(selectedChildrenIndex).length !== t) {
			selectedChildrenIndex = times(t, () => random(population.length - 1));
		}
		const children = selectedChildrenIndex.map(index => ({
			individual: population[index],
			index
		}));
		return maxBy(children, ({individual}) => individual.health);
	});
	return withRRAndLOD(selectedIndividuals);
}

export const tournamentWithoutReturn = (t: number = 2) => (population: Population) => {
	const N = population.length;
	const populationCopies = times(t, () => cloneDeep(population));
	let initialPopulationCopyIndex = 0, currentPopulation = populationCopies[initialPopulationCopyIndex];
	const selectedIndividuals = times(N, () => {
		if (!currentPopulation.length) {
			initialPopulationCopyIndex++;
			currentPopulation = populationCopies[initialPopulationCopyIndex];
		}
		const selectedGroup = times(t, () => {
			const selectedIndividualIndex = random(currentPopulation.length - 1);
			const [individual] = remove(currentPopulation, (_, i) => i === selectedIndividualIndex);
			return { individual, index: selectedIndividualIndex };
		});
		return maxBy(selectedGroup, ({individual}) => individual.health);
	});
	return withRRAndLOD(selectedIndividuals);
};
