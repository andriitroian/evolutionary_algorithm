import { FunctionSpec } from '../functions/interfaces';

export const FConst: FunctionSpec = {
	id: `f_const`,
	name: `FConst`,
	chromosomeLength: 100,
	optimal: '',
	get fn() { return (_) => 0},
	encode: (chromosome) => chromosome,
	decode: (chromosome) => chromosome,
};
