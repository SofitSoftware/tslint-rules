import { lintRunner } from '../helpers/lintRunner';

const RULE = 'method-padding';

describe('Method padding rule', () => {

	it.each([
		[`class Dan {
			public method(){
				console.log(true);
			}
		}`, 1],
		[`class Dan {
			public method(){
				console.log(true);
			}
			public method(){
				console.log(true);
			}
		}`, 2],
		[`class Dan {
			variable: string;
			method(){
				console.log(true);
			}
		}`, 1],
		[`class Dan {
			public static variable: string;
			@Teste()
			method(){
				console.log(true);
			}
		}`, 1]
	])('%s', (src, count) => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(count);
	});

	it.each([
		[`class Dan {

			public method(){
				console.log(true);
			}
		}`],
		[`class Dan {

			public method(){
				console.log(true);
			}

			public method(){
				console.log(true);
			}
		}`],
		[`class Dan {
			variable: string;

			method(){
				console.log(true);
			}
		}`],
		[`class Dan {
			public static variable: string;

			@Teste()
			method(){
				console.log(true);
			}
		}`]
	])('%s', src => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(0);
	});
});