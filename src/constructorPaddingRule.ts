import * as Lint from 'tslint';
// tslint:disable-next-line:no-implicit-dependencies
import { getPreviousToken } from 'tsutils';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {

	public static NEW_LINE_BEFORE = 'Missing blank line before constructor';
	public static NEW_LINE_AFTER = 'Missing blank line after constructor';
	public static NEW_LINE_END = 'Not allowed blank line before constructor ends';

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new ConstructorPaddingWalker(sourceFile, this.ruleName, undefined));
	}
}

// The walker takes care of all the work.
class ConstructorPaddingWalker extends Lint.AbstractWalker<void> {

	public walk(sourceFile: ts.SourceFile) {

		const cb = (node: ts.Node): void => {

			if (node.kind === ts.SyntaxKind.Constructor) {

				this.visitConstructorDeclaration(node as ts.ConstructorDeclaration);
			}

			return ts.forEachChild(node, cb);
		};

		return ts.forEachChild(sourceFile, cb);
	}

	public visitConstructorDeclaration(node: ts.ConstructorDeclaration) {

		const prev = getPreviousToken(node);
		const start = node.getStart(this.sourceFile);
		const line = ts.getLineAndCharacterOfPosition(this.sourceFile, start).line;

		if (prev) {

			const prevStartLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getStart(this.sourceFile)).line;
			const prevEndLine = ts.getLineAndCharacterOfPosition(this.sourceFile, prev.getEnd()).line;

			if (prevStartLine === line - 1 || prevEndLine === line - 1) {

				this.addFailure(start, start, Rule.NEW_LINE_BEFORE);
			}
		} else if (node.parent) {

			const parentLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.parent.getStart(this.sourceFile)).line;

			if (parentLine >= line - 1) {

				this.addFailure(start, start, Rule.NEW_LINE_BEFORE);
			}
		}

		if (node.body && Boolean(node.body.getChildAt(1).getText().trim())) {

			let stop = false;

			const openBraceLine = ts.getLineAndCharacterOfPosition(this.sourceFile, node.body.getChildAt(0).getStart()).line;

			node.body.getChildAt(1).getChildren().forEach(n => {
				if (stop) {

					return;
				}

				const firstChildLine = ts.getLineAndCharacterOfPosition(this.sourceFile, n.getStart(this.sourceFile)).line;

				if (firstChildLine <= openBraceLine + 1) {

					this.addFailure(start, start, Rule.NEW_LINE_AFTER);
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