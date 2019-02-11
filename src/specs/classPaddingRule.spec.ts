import { lintRunner } from '../helpers/lintRunner';

const RULE = 'class-padding';

describe('ClassPadding', () => {

	it.each([
		[`class Maria {
			constructor(private jj: JJ){}
			public dan() {
				console.log('oi');
			}
			public dan() {
				console.log('oi');
			}
		}`, 1],
		[`class Maria {

			public dan() {
				console.log('oi');
			}

		}`, 1],
		[`class Maria {
			public dan() {
				console.log('oi');
			}

		}`, 2],
		[`class Maria {

			constructor(private jj: JJ) {}

			public dan() {
				console.log('oi');
			}
		}`, 0],
		[`class Maria {

		}`, 1],
		[`@Entity()
		class Maria {

		}`, 1],
		[`class Maria {
		}`, 1],
		[`class Maria { }`, 0],
		[`@Entity()
		class Maria { }`, 0],
		[`@Injectable()
		export class SubSystemService {

			constructor(private readonly benchmarkingValidationsService: BenchmarkingValidationsService) { }

			public async edit(id: number, subSystem: SubSystem) {

				if (!subSystem.in_revision) {

					await Promise.all([
						this.benchmarkingValidationsService.validateInRevisionAssociations(SubSystem, subSystem),
						this.benchmarkingValidationsService.validateEquivalentRecordAssociations(SubSystem, subSystem, id)
					]);
				}

				return this.repository.updateOne(id, subSystem);
			}
		}`, 0]
	])('%s', (src, count) => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(count);
	});

	it.each([
		[`import jj from 'jj';
		class Maria {}`, 1],
		[`import jj from 'jj';
		@Entity()
		class Maria {}`, 1],
		[`import jj from 'jj';

		@Entity()
		class Maria {}`, 0],
		[`import jj from 'jj';

		class Maria {}`, 0]
	])('%s', (src, count) => {

		const result = lintRunner({ src, rule: RULE });

		expect(result.errorCount).toBe(count);
	});
});