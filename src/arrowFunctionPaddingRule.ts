import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getPreviousToken } from 'tsutils';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {

	public static NEW_LINE_BEFORE = 'Missing blank line before function declaration';
	public static NEW_LINE_AFTER = 'Missing blank line after function declaration';
	public static NEW_LINE_END = 'Not allowed blank line before function ends';

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new ArrowFunctionPaddingWalker(sourceFile, this.ruleName, undefined));
	}
}

// The walker takes care of all the work.
class ArrowFunctionPaddingWalker extends Lint.AbstractWalker<void> {

	public walk(sourceFile: ts.SourceFile) {

		const cb = (node: ts.Node): void => {

			if (node.kind === ts.SyntaxKind.ArrowFunction) {

				this.visitFunctionDeclaration(node as ts.ArrowFunction);
			}

			return ts.forEachChild(node, cb);
		};

		return ts.forEachChild(sourceFile, cb);
	}

	public visitFunctionDeclaration(node: ts.ArrowFunction) {

		const prev = getPreviousToken(node);
		const start = node.getStart(this.sourceFile);
		const line = ts.getLineAndCharacterOfPosition(this.sourceFile, start).line;
		const endLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.getEnd()).line;

		if (line !== endLine) {

			const arrowFunctionEnd = node.equalsGreaterThanToken.getEnd();

			if (prev) {

				const prevStartLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getStart(this.sourceFile)).line;
				const prevEndLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getEnd()).line;

				if (prevStartLine === line - 1 || prevEndLine === line - 1) {

					this.addFailure(start, arrowFunctionEnd, Rule.NEW_LINE_BEFORE);
				}
			} else if (node.parent) {

				const parentLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.parent.getStart(this.sourceFile)).line;

				if (parentLine >= line - 1) {

					this.addFailure(start, arrowFunctionEnd, Rule.NEW_LINE_BEFORE);
				}
			}

			let stop = false;

			if (node.body && node.body.getFirstToken().kind === ts.SyntaxKind.OpenBraceToken) {

				node.body.forEachChild(n => {

					if (stop) {

						return;
					}

					const firstChildLine = ts.getLineAndCharacterOfPosition(this.sourceFile, n.getStart(this.sourceFile)).line;

					if (firstChildLine <= line + 1) {

						this.addFailure(start, arrowFunctionEnd, Rule.NEW_LINE_AFTER);
					}

					stop = true;
				});

				const closeBracket = node.body.getLastToken(this.sourceFile);
				const closeBracketStart = closeBracket.getStart(this.sourceFile);
				const closeBracketLine = ts.getLineAndCharacterOfPosition(this.sourceFile, closeBracketStart).line;

				const lastBlockStatement = getPreviousToken(closeBracket);

				if (lastBlockStatement) {

					const previousTokenStart = lastBlockStatement.getStart(this.sourceFile);
					const previousTokenLine = ts.getLineAndCharacterOfPosition(this.sourceFile, previousTokenStart).line;

					if (previousTokenLine !== closeBracketLine - 1) {

						const closeStart = closeBracket.getStart();

						this.addFailure(closeStart, closeStart, Rule.NEW_LINE_END);
					}
				}
			}
		}
	}
}