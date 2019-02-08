import { lintRunner } from '../helpers/lintRunner';

const RULE = 'function-padding';

describe('LastLineRule', () => {

	it.each([
		[`console.log(true);
		function maria() {
			console.log(1);
		}`, 1],
		[`console.log(true);
		export function maria() {
			console.log(1);
		}`, 1],
		[`console.log(true);

		function maria() {
			console.log(1);
		}`, 0],
		[`console.log(true);

		export function maria() {
			console.log(1);
		}`, 0],
		[`export function maria() {
			console.log(1);
		}`, 0],
		[`console.log(true);
		chama(function () {
			console.log(1);
		})`, 0]
	])('%s', (src, count) => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(count);
	});
});