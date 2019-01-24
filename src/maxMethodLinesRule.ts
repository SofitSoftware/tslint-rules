import * as Lint from 'tslint';
import * as ts from 'typescript';

const MAX_LINES = 25;
const MAX_METHOD_LINES = `Max method lines is ${MAX_LINES}`;

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

		const firstToken = node.getFirstToken();
		const lastToken = node.getLastToken();

		if (firstToken && lastToken) {

			const firstTokenStart = firstToken.getStart();
			const lastTokenStart = lastToken.getStart();
			const firstLine = ts.getLineAndCharacterOfPosition(this.sourceFile, firstTokenStart).line;
			const lastLine = ts.getLineAndCharacterOfPosition(this.sourceFile, lastTokenStart).line;

			if ((lastLine - firstLine - 2) > MAX_LINES) {

				this.addFailure(firstTokenStart, lastTokenStart, MAX_METHOD_LINES);
			}
		}
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new MethodPaddingWalker(sourceFile, this.ruleName, undefined));
	}
}