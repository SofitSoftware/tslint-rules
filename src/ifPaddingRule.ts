import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getPreviousStatement, getPreviousToken } from 'tsutils';
import * as ts from 'typescript';

const NEW_LINE_BEFORE = 'Missing blank line before if';
const NEW_LINE_AFTER = 'Missing blank line after if';
const NEW_LINE_END = 'Not allowed blank line before if ends';
const NEW_LINE_AFTER_ELSE = 'Missing blank line after else';

// The walker takes care of all the work.
class IfPaddingWalker extends Lint.AbstractWalker<void> {

	public walk(sourceFile: ts.SourceFile) {

		const cb = (node: ts.Node): void => {

			if (node.kind === ts.SyntaxKind.IfStatement) {

				this.visitIfDeclaration(node as ts.IfStatement);
			}

			return ts.forEachChild(node, cb);
		};

		return ts.forEachChild(sourceFile, cb);
	}

	public visitIfDeclaration(node: ts.IfStatement) {

		const start = node.getStart(this.sourceFile);
		const line = ts.getLineAndCharacterOfPosition(this.sourceFile, start).line;

		this.checkPrev(node, line, start);

		this.checkParent(node, line, start);

		this.checkBody(node, line, start);

		this.checkLastBlock(node);

		this.checkElse(node);
	}

	private checkPrev(node: ts.IfStatement, line: number, start: number) {

		const prev = getPreviousStatement(node);

		if (prev) {

			const prevStartLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getStart(this.sourceFile)).line;
			const prevEndLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getEnd()).line;

			if (prevStartLine === line - 1 || prevEndLine === line - 1) {

				this.addFailure(start, start, NEW_LINE_BEFORE);
			}
		}
	}

	private checkParent(node: ts.IfStatement, line: number, start: number) {

		if (node.parent) {

			const parentLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.parent.getStart(this.sourceFile)).line;

			if (parentLine >= line - 1) {

				this.addFailure(start, start, NEW_LINE_BEFORE);
			}
		}
	}

	private checkBody(node: ts.IfStatement, line: number, start: number) {

		let stop = false;

		node.thenStatement.forEachChild(n => {

			if (stop) {

				return;
			}

			const firstChildLine = ts.getLineAndCharacterOfPosition(this.sourceFile, n.getStart(this.sourceFile)).line;

			if (firstChildLine <= line + 1) {

				this.addFailure(start, start, NEW_LINE_AFTER);
			}

			stop = true;
		});
	}

	private checkLastBlock(node: ts.IfStatement) {

		const closeBracket = node.thenStatement.getLastToken(this.sourceFile);

		if (closeBracket) {

			const closeBracketStart = closeBracket.getStart(this.sourceFile);
			const closeBracketLine = ts.getLineAndCharacterOfPosition(this.sourceFile, closeBracketStart).line;

			const lastBlockStatement = getPreviousToken(closeBracket);

			if (lastBlockStatement) {

				const previousTokenStart = lastBlockStatement.getStart(this.sourceFile);
				const previousTokenLine = ts.getLineAndCharacterOfPosition(this.sourceFile, previousTokenStart).line;

				if (previousTokenLine !== closeBracketLine - 1) {

					const closeStart = closeBracket.getStart();

					this.addFailure(closeStart, closeStart, NEW_LINE_END);
				}
			}
		}
	}

	private checkElse(node: ts.IfStatement) {

		if (node.elseStatement) {

			const elseStatement = node.elseStatement;

			if (elseStatement.kind !== ts.SyntaxKind.IfStatement) {

				const elseStatementStart = elseStatement.getStart(this.sourceFile);
				const elseLine = ts.getLineAndCharacterOfPosition(this.sourceFile, elseStatementStart).line;

				let stop = false;

				elseStatement.forEachChild(n => {

					if (stop) {

						return;
					}

					const firstChildLine = ts.getLineAndCharacterOfPosition(this.sourceFile, n.getStart(this.sourceFile)).line;

					if (firstChildLine === elseLine + 1) {

						const firstToken = elseStatement.getFirstToken();

						if (firstToken) {

							const p = getPreviousToken(firstToken);

							if (p) {

								this.addFailure(p.getStart(this.sourceFile), p.getStart(this.sourceFile), NEW_LINE_AFTER_ELSE);
							}
						}
					}

					stop = true;
				});

				const elseCloseBracket = elseStatement.getLastToken();

				if (elseCloseBracket) {

					const elseCloseBracketStart = elseCloseBracket.getStart(this.sourceFile);
					const elseCloseBracketLine = ts.getLineAndCharacterOfPosition(this.sourceFile, elseCloseBracketStart).line;

					const lastBlockStatement = getPreviousToken(elseCloseBracket);

					if (lastBlockStatement) {

						const previousTokenStart = lastBlockStatement.getStart(this.sourceFile);
						const previousTokenLine = ts.getLineAndCharacterOfPosition(this.sourceFile, previousTokenStart).line;

						if (previousTokenLine !== elseCloseBracketLine - 1) {

							const closeStart = elseCloseBracket.getStart();

							this.addFailure(closeStart, closeStart, NEW_LINE_END);
						}
					}
				}
			}
		}
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new IfPaddingWalker(sourceFile, this.ruleName, undefined));
	}
}