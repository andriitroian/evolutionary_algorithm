export interface Individual {
	chromosome: string,
	health: number
}

export type Population = Individual[];

export interface IterationStats {
	iteration: number,
	population: Population,
	intensity: number,
	growth_rate: number,
	reproduction_rate: number,
	loss_of_diversity: number,
	selection_difference: number
}
