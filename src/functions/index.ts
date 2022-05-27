import hammingDistance from 'hamming';
import { FunctionSpec } from './interfaces';
import { toDecimal, toGrayCode } from '../encode';

export const FH: FunctionSpec = {
	id: 'fh',
	name: 'FH',
	chromosomeLength: 100,
	get optimal() { return new Array(this.chromosomeLength).fill(0).join('') },
	get fn() { return (x) => this.chromosomeLength - hammingDistance(x, this.optimal); },
	encode: (chromosome) => chromosome,
	decode: (chromosome) => chromosome,
};

export const getFHD = (b: number): FunctionSpec => ({
	id: `fhd_${b}`,
	name: `FHD; ∂=${b}`,
	chromosomeLength: 100,
	get optimal() { return new Array(this.chromosomeLength).fill(0).join('') },
	get fn() { return (x) => {
		const k = x.split('').filter(c => c === '0').length;
		const l = x.length;
		return (l - k) + k * b;
	}},
	encode: (chromosome) => chromosome,
	decode: (chromosome) => chromosome,
});

export const getFnPowX = (pow: number): FunctionSpec => ({
	id: `x_pow_${pow}`,
	name: pow === 1 ? 'y=x' : `y=x^${pow}`,
	chromosomeLength: 10,
	get optimal() { return this.encode(10.23) },
	get encode() { return (x) => toGrayCode(x * 100) },
	get decode() { return (x) => toDecimal(x) / 100 },
	get fn() { return (x) => Math.pow(x, pow); },
	get reverseFn() { return (y) => Math.pow(y, 1/pow); },
	min: 0,
	max: 10.23
});

export const getFn_5_12_x = (pow: number): FunctionSpec => ({
	id: `5.12_pow_${pow}_-_x_pow_${pow}`,
	name: `y=((5.12)^${pow})-x^${pow}`,
	chromosomeLength: 10,
	get optimal() { return this.encode(0) },
	get encode() { return (x) => toGrayCode((x + 5.11) * 100) },
	get decode() { return (x) => toDecimal(x) / 100 - 5.11 },
	get fn() { return (x) => Math.pow(5.12, pow) - Math.pow(x, pow); },
	get reverseFn() { return (y) => Math.pow(Math.pow(5.12, pow) - y, 1/pow); },
	min: -5.11,
	max: 5.12
});
