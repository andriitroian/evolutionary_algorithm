const generateIndividual = (chromosomLength) => new Array(chromosomLength)
	.fill(null)
	.map(() => Math.round(Math.random()))
	.join('');

export const generatePopulation = ({ N, chromosomLength = 10, optimalChromosom }) => {
	const population = new Array(N).fill(null).map(() => generateIndividual(chromosomLength))
	let indexOfOptChromosom = population.indexOf(optimalChromosom);
	while (indexOfOptChromosom >= 0) {
		population[indexOfOptChromosom] = generateIndividual(chromosomLength);
		indexOfOptChromosom = population.indexOf(optimalChromosom);
	}
	population[Math.round(Math.random() * N)] = optimalChromosom;
	return population;
};
