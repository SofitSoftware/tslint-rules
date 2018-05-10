import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {

	public static MAX_LINES = 25;

	public static MAX_METHOD_LINES = `Max method lines is ${Rule.MAX_LINES}`;

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

	public visitMethodDeclaration(node: ts.MethodDeclaration) {

		const start = node.getStart(this.sourceFile);
		const closeBracket = node.body!.getLastToken(this.sourceFile);
		const closeBracketStart = closeBracket.getStart(this.sourceFile);

		if (node.body) {

			const block = node.body.getChildAt(1).getChildren();
			const firstBlockLine = ts.getLineAndCharacterOfPosition(this.sourceFile, block[0].getStart(this.sourceFile)).line;
			const lastBlockLine = ts.getLineAndCharacterOfPosition(this.sourceFile, block[block.length - 1].getStart(this.sourceFile)).line;

			if (lastBlockLine - firstBlockLine >= Rule.MAX_LINES) {

				this.addFailure(start, closeBracketStart, Rule.MAX_METHOD_LINES);
			}
		}
	}
}