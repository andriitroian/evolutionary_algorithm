import { FH, getFHD, getFn_5_12_x, getFnPowX } from './functions';

export const NUMBER_OF_RUNS = 10;

export const POPULATION_SIZES = [
	100,
	1000
];

export const SELECTION_OPTIONS = [
	{ type: 'tournament_without_return', param: 2, name: 'tournament_without_return; t=2' },
	{ type: 'tournament_with_return', param: 2, name: 'tournament_with_return; t=2' },
	{ type: 'rank_linear', param: 1.6, name: 'rank_linear; ß=1.6' },
	{ type: 'rank_linear', param: 1.2, name: 'rank_linear; ß=1.2' },
	{ type: 'rank_exponential', param: 0.988, name: 'rank_exponential; c=0.988' },
	{ type: 'rank_exponential', param: 0.996, name: 'rank_exponential; c=0.996' },
];

export const FUNCTIONS = [
	FH,
	getFHD(10),
	getFHD(150),
	getFnPowX(1),
	getFnPowX(2),
	getFnPowX(4),
	getFn_5_12_x(4),
	getFn_5_12_x(2),
];
