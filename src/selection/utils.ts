import { uniq, difference } from 'lodash';

export const withRRAndLOD = (generation) => {
	const N = generation.length;
	const nextGeneration = [];
	let selectedIndividualsIndex = [];

	generation.forEach(({index, individual}) => {
		nextGeneration.push(individual);
		selectedIndividualsIndex.push(index);
	});
	selectedIndividualsIndex = uniq(selectedIndividualsIndex);
	const skippedIndividualsIndex = uniq(difference(Array.from(Array(N).keys()), selectedIndividualsIndex));
	return {
		nextGeneration,
		reproduction_rate: selectedIndividualsIndex.length/N,
		loss_of_diversity: skippedIndividualsIndex.length/N
	};
}
