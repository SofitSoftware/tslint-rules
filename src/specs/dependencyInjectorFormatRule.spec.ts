import { lintRunner } from '../helpers/lintRunner';

const RULE = 'dependency-injector-format';

describe('DependecyInjectorFormat tests', () => {

	it.each([
		[`class Den {
			constructor (private readonly on: On) { }
		}`, 0],
		[`class Den {
			constructor (private readonly on: On) {

				console.log(on);
			}
		}`, 0],
		[`class Den {
			constructor (
				private readonly on: On) { }
		}`, 1],
		[`class Den {
			constructor (private readonly on: On) {

			}
		}`, 1],
		[`class Den {
			constructor (private readonly on: On) { console.log(on); }
		}`, 1],
		[`class Dan {
			constructor(adminUser: AdminUser, clientUser?: ClientUser) {
				this.id = adminUser.id;
			}
		}`, 0]
	])('%s', (src, count) => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(count);
	});

	it.each([
		[`class Den {
			constructor (
				private readonly on: On,
				private readonly off: Off) { }
		}`, 0],
		[`class Den {
			constructor (
				private readonly on: On,
				private readonly off: Off
			) { }
		}`, 1],
		[`class Den {
			constructor (private readonly on: On,private readonly off: Off) { }
		}`, 2],
		[`class Den {
			constructor (private readonly on: On,private readonly off: Off) { console.log(on); }
		}`, 3],
		[`class Den {
			constructor (
				private readonly on: On,private readonly off: Off
			) { }
		}`, 2],
		[`class Den {
			constructor (private readonly on: On,
				private readonly off: Off
			) { }
		}`, 3],
		[`class Den {
			constructor (
				private readonly on: On,
				private readonly midle: Midle,
				private readonly off: Off) {
				}
		}`, 1],
		[`class Den {
			constructor (
				private readonly on: On,
				private readonly off: Off
			) {

				console.log(on);
			}
		}`, 0],
		[`class Den {
			constructor (
				private readonly on: On,
				private readonly off: Off) {

				console.log(on);
			}
		}`, 1],
		[`class Den {
			constructor (
				private readonly on: On,
				private readonly off: Off)
			{

				console.log(on);
			}
		}`, 2]
	])('%s', (src, count) => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(count);
	});
});