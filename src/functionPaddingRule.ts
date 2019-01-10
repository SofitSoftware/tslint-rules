import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getPreviousStatement, getPreviousToken } from 'tsutils';
import * as ts from 'typescript';

const NEW_LINE_BEFORE = 'Missing blank line before function declaration';
const NEW_LINE_AFTER = 'Missing blank line after function declaration';
const NEW_LINE_END = 'Not allowed blank line before function ends';

// The walker takes care of all the work.
class FunctionPaddingWalker extends Lint.AbstractWalker<void> {

	public walk(sourceFile: ts.SourceFile) {

		const cb = (node: ts.Node): void => {

			if (node.kind === ts.SyntaxKind.FunctionDeclaration || node.kind === ts.SyntaxKind.FunctionExpression) {

				this.visitFunctionDeclaration(node as ts.FunctionDeclaration);
			}

			return ts.forEachChild(node, cb);
		};

		return ts.forEachChild(sourceFile, cb);
	}

	public visitFunctionDeclaration(node: ts.FunctionDeclaration) {

		const start = node.getStart(this.sourceFile);
		const line = ts.getLineAndCharacterOfPosition(this.sourceFile, start).line;
		const functionStatementStart = node.getChildren().filter(n => n.kind === ts.SyntaxKind.FunctionKeyword)[0].getStart();

		if (line > 0) {

			this.checkPrev(node, line, functionStatementStart);

			this.checkParent(node, line, functionStatementStart);
		}

		this.checkBody(node, line, functionStatementStart);

		this.checkLastBlock(node);
	}

	private checkPrev(node: ts.FunctionDeclaration, line: number, functionStatementStart: number) {

		const prev = getPreviousStatement(node);

		if (prev) {

			const prevStartLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getStart(this.sourceFile)).line;
			const prevEndLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getEnd()).line;

			if (prevStartLine === line - 1 || prevEndLine === line - 1) {
				// Previous statement is on the same or previous line
				this.addFailure(functionStatementStart, functionStatementStart, NEW_LINE_BEFORE);
			}
		}
	}

	private checkParent(node: ts.FunctionDeclaration, line: number, functionStatementStart: number) {

		if (node.parent) {

			const parentLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.parent.getStart(this.sourceFile)).line;

			if (parentLine === line - 1) {

				this.addFailure(functionStatementStart, functionStatementStart, NEW_LINE_BEFORE);
			}
		}
	}

	private checkBody(node: ts.FunctionDeclaration, line: number, functionStatementStart: number) {

		let stop = false;

		if (node.body) {

			node.body.forEachChild(n => {

				if (stop) {

					return;
				}

				const firstChildLine = ts.getLineAndCharacterOfPosition(this.sourceFile, n.getStart(this.sourceFile)).line;

				if (firstChildLine <= line + 1) {

					this.addFailure(functionStatementStart, functionStatementStart, NEW_LINE_AFTER);
				}

				stop = true;
			});
		}
	}

	private checkLastBlock(node: ts.FunctionDeclaration) {

		if (node.body) {

			const closeBracket = node.body.getLastToken(this.sourceFile);

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
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new FunctionPaddingWalker(sourceFile, this.ruleName, undefined));
	}
}