import { lintRunner } from '../helpers/lintRunner';

const RULE = 'block-padding';

describe('blockPadding Rule', () => {

	describe('desc', () => {

		it.each([
			[`if (true) {
				console.log(true);
			}`, 1],
			[`class A {
				constructor() {
					console.log(1);
				}
			}`, 1],
			[`class A {
				public b() {
					console.log(1);
				}
			}`, 1],
			[`it('jj', () => {
				expect(result.errorCount).toBe(1);
		});`, 1],
			[`function maria(){
			console.log('true');
		}`, 1],
			[`if (true) {

			console.log(true);
		} else {
			console.log(false)
		}`, 1],
			[`if (true) {
			console.log(true);
		} else {
			console.log(false)
		}`, 2],
			[`if (true) {
			console.log(true);
		} else if (false) {
			console.log(false)
		}`, 2],
			[`for (let i = 0; i < 10; i++) {
			console.log(i);
		}`, 1],
			[`for (let test in testes) {
			console.log(test);
		}`, 1],
			[`for (let test of testes) {
			console.log(test);
		}`, 1],
			[`try {
			console.log(0/0);
		} catch(e){
			console.log(0)
		}`, 2],
		[`done(() => {
			return 'maria';
		})`, 1]
		])('%s should throw error for line after method', (src: string, count = 1) => {

			const result = lintRunner({ src, rule: RULE });

			expect(result.errorCount).toBe(count);
			expect(result.failures[0].getFailure()).toEqual('Missing blank line after block declaration');
		});

		it('%s should throw error for line after method', () => {

			const src = `it(done => done('maria'));`;

			const result = lintRunner({ src, rule: RULE });

			expect(result.errorCount).toBe(0);
		});
	});

	it.each([
		[`if (true) {

			console.log(true);

			if(false) {

				teste();

			}

			joao();


		}`, 2],
		[`class A {
			public b() {

				console.log(1);

			}
		}`, 1],
		[`it('jj', () => {

			expect(result.errorCount).toBe(1);

		});`, 1],
		[`function maria(){

			console.log('true');

		}`, 1],
		[`if (true) {

			console.log(true);
		} else {

			console.log(false)

		}`, 1],
		[`if (true) {

			console.log(true);

		} else {

			console.log(false)

		}`, 2],
		[`if (true) {

			console.log(true);

		} else if (false) {

			console.log(false)

		}`, 2],
		[`done(() => {

			return 'maria';

		})`, 1],
		[`for (let i = 0; i < 10; i++) {

			console.log(i);

		}`, 1],
		[`for (let test in testes) {

			console.log(test);

		}`, 1],
		[`for (let test of testes) {

			console.log(test);

		}`, 1],
		[`try {

			console.log(0/0);

		} catch(e){

			console.log(0)

		}`, 2]
	])('%s should throw error for line after method', (src: string, count = 1) => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(count);
		expect(result.failures[0].getFailure()).toEqual('Not allowed blank line before block ends');
	});

	it.each([
		[`if (true) {

			console.log(true);

			if(false) {

				teste();
			}

			joao();
		}`],
		[`class A {
			constructor(private jj: JJ) {}
		}`],
		[`class A {
			public b() {

				console.log(1);
			}
		}`],
		[`it('jj', () => {

			expect(result.errorCount).toBe(1);
		});`],
		[`done(() => 'maria')`],
		[`function maria(){

			console.log('true');
		}`],
		[`if (true) {

			console.log(true);
		} else {

			console.log(false);
		}`],
		[`if (true) {

			console.log(true);
		} else {

			console.log(false);
		}`],
		[`if (true) {

			console.log(true);
		} else if (false) {

			console.log(false);
		}`],
		[`for (let i = 0; i < 10; i++) {

			console.log(i);
		}`],
		[`for (let test in testes) {

			console.log(test);
		}`],
		[`for (let test of testes) {

			console.log(test);
		}`],
		[`try {

			console.log(0/0);
		} catch(e){

			console.log(0);
		}`]
	])('%s should not throw error for line after method', (src: string) => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(0);
	});
});