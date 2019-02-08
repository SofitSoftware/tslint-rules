import { lintRunner } from '../helpers/lintRunner';

const RULE = 'max-method-lines';

describe('MaxMethodLine', () => {

	it.each([
		[`class Dan {
			public maria() {

				console.log(1);
			}
		}`, 0],
		[`class Dan {
			public maria() {

				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
			}
		}`, 0],
		[`class Dan {
			public maria() {

				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
				console.log(1);
			}
		}`, 1]
	])('%s', (src, count) => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(count);
	});
});