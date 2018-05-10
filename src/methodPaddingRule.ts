import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getPreviousToken } from 'tsutils';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {

	public static NEW_LINE_BEFORE = 'Missing blank line before method declaration';
	public static NEW_LINE_AFTER = 'Missing blank line after method declaration';
	public static NEW_LINE_END = 'Not allowed blank line before method ends';

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new MethodPaddingWalker(sourceFile, this.ruleName, undefined));
	}
}

// The walker takes care of all the work.
class MethodPaddingWalker extends Lint.AbstractWalker<void> {

	public walk(sourceFile: ts.SourceFile) {

		const cb = (node: ts.Node): void => {

			if (node.kind === ts.SyntaxKind.MethodDeclaration) {

				this.visitMethodDeclaration(node as ts.MethodDeclaration);
			}

			return ts.forEachChild(node, cb);
		};

		return ts.forEachChild(sourceFile, cb);
	}

	// tslint:disable-next-line:max-method-lines
	public visitMethodDeclaration(node: ts.MethodDeclaration) {

		const prev = getPreviousToken(node);
		const start = node.getStart(this.sourceFile);
		const line = ts.getLineAndCharacterOfPosition(this.sourceFile, start).line;

		if (prev) {

			const prevStartLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getStart(this.sourceFile)).line;
			const prevEndLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getEnd()).line;

			if (prevStartLine === line - 1 || prevEndLine === line - 1) {
				// Previous statement is on the same or previous line
				this.addFailure(start, start, Rule.NEW_LINE_BEFORE);
			}
		} else if (node.parent) {

			const parentLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.parent.getStart(this.sourceFile)).line;

			if (parentLine >= line - 1) {

				this.addFailure(start, start, Rule.NEW_LINE_BEFORE);
			}
		}

		let stop = false;

		if (node.body && node.modifiers && node.modifiers.length) {

			const bodyLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.body.getChildAt(0).getStart()).line;

			const modifier = node.modifiers.filter(n => n.kind === ts.SyntaxKind.PublicKeyword);

			if (modifier.length) {

				const modifierStart = modifier[0].getStart();

				node.body.forEachChild(n => {

					if (stop) {

						return;
					}

					const firstChildLine = ts.getLineAndCharacterOfPosition(this.sourceFile, n.getStart(this.sourceFile)).line;

					if (firstChildLine <= bodyLine + 1) {

						this.addFailure(modifierStart, modifierStart, Rule.NEW_LINE_AFTER);
					}

					stop = true;
				});
			}

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