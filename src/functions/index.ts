import hammingDistance from 'hamming';

export interface FunctionSpec {
	CHROMOSOM_LENGTH: number,
	OPTIMAL_CHROMOSOM: string,
	fn: Function,
	min: number,
	max: number
}

export const FH: FunctionSpec = {
	CHROMOSOM_LENGTH: 100,
	get OPTIMAL_CHROMOSOM() { return new Array(this.CHROMOSOM_LENGTH).fill(0).join('') },
	get fn() { return (x) => this.CHROMOSOM_LENGTH - (hammingDistance(x, this.OPTIMAL_CHROMOSOM) || this.CHROMOSOM_LENGTH) },
	min: 0,
	max: Math.pow(2, 100) - 1
};
