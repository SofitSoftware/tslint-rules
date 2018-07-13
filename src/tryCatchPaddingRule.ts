import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getPreviousStatement, getPreviousToken } from 'tsutils';
import * as ts from 'typescript';

const NEW_LINE_BEFORE = 'Missing blank line before try';
const NEW_LINE_AFTER = 'Missing blank line after try';
const NEW_LINE_END = 'Not allowed blank line before try ends';
const NEW_LINE_AFTER_CATCH = 'Missing blank line after catch';

// The walker takes care of all the work.
class TryCatchPaddingWalker extends Lint.AbstractWalker<void> {

	public walk(sourceFile: ts.SourceFile) {

		const cb = (node: ts.Node): void => {

			if (node.kind === ts.SyntaxKind.TryStatement) {

				this.visitIfDeclaration(node as ts.TryStatement);
			}

			return ts.forEachChild(node, cb);
		};

		return ts.forEachChild(sourceFile, cb);
	}

	public visitIfDeclaration(node: ts.TryStatement) {

		const start = node.getStart(this.sourceFile);
		const line = ts.getLineAndCharacterOfPosition(this.sourceFile, start).line;

		this.checkPrev(node, line, start);

		this.checkParent(node, line, start);

		this.checkTryBlock(node, line, start);

		this.checkLastBlock(node);

		this.checkCatchBlock(node);
	}

	private checkPrev(node: ts.TryStatement, line: number, start: number) {

		const prev = getPreviousStatement(node);

		if (prev) {

			const prevStartLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getStart(this.sourceFile)).line;
			const prevEndLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getEnd()).line;

			if (prevStartLine === line - 1 || prevEndLine === line - 1) {

				this.addFailure(start, start, NEW_LINE_BEFORE);
			}
		}
	}

	private checkParent(node: ts.TryStatement, line: number, start: number) {

		if (node.parent) {

			const parentLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.parent.getStart(this.sourceFile)).line;

			if (parentLine >= line - 1) {

				this.addFailure(start, start, NEW_LINE_BEFORE);
			}
		}
	}

	private checkTryBlock(node: ts.TryStatement, line: number, start: number) {

		let stop = false;

		node.tryBlock.forEachChild(n => {

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

	private checkLastBlock(node: ts.TryStatement) {

		const closeBracket = node.tryBlock.getLastToken(this.sourceFile);
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

	private checkCatchBlock(node: ts.TryStatement) {

		if (node.catchClause) {

			const catchStatement = node.catchClause;

			const catchStatementStart = catchStatement.getStart(this.sourceFile);
			const catchLine = ts.getLineAndCharacterOfPosition(this.sourceFile, catchStatementStart).line;

			let stop = false;

			const catchBlock = catchStatement.getChildren().filter(n => n.kind === ts.SyntaxKind.Block)[0].getChildAt(1);

			catchBlock.getChildren().forEach(n => {

				if (stop) {

					return;
				}

				const firstChildLine = ts.getLineAndCharacterOfPosition(this.sourceFile, n.getStart(this.sourceFile)).line;

				if (firstChildLine === catchLine + 1) {

					const p = catchStatement.getChildren().filter(it => {

						return it.kind === ts.SyntaxKind.CatchKeyword;
					})[0].getStart(this.sourceFile);

					this.addFailure(p, p, NEW_LINE_AFTER_CATCH);
				}

				stop = true;
			});

			const catchCloseBracket = catchStatement.getLastToken();
			const catchCloseBracketStart = catchCloseBracket.getStart(this.sourceFile);
			const elseCloseBracketLine = ts.getLineAndCharacterOfPosition(this.sourceFile, catchCloseBracketStart).line;

			const lastBlockStatement = getPreviousToken(catchCloseBracket);

			if (lastBlockStatement) {

				const previousTokenStart = lastBlockStatement.getStart(this.sourceFile);
				const previousTokenLine = ts.getLineAndCharacterOfPosition(this.sourceFile, previousTokenStart).line;

				if (previousTokenLine !== elseCloseBracketLine - 1) {

					const closeStart = catchCloseBracket.getStart();

					this.addFailure(closeStart, closeStart, NEW_LINE_END);
				}
			}
		}
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new TryCatchPaddingWalker(sourceFile, this.ruleName, undefined));
	}
}