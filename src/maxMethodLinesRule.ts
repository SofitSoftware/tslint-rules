import * as Lint from 'tslint';
import ts from 'typescript';

const MAX_LINES = 30;
const MAX_METHOD_LINES = `Max method lines is ${MAX_LINES}`;

class Walk extends Lint.RuleWalker {

	public visitMethodDeclaration(method: ts.MethodDeclaration) {

		const firstLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), method.getStart()).line;
		const lastLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), method.getEnd()).line;

		if ((lastLine - firstLine) > MAX_LINES) {

			this.addFailureAtNode(method, MAX_METHOD_LINES);
		}

		super.visitMethodDeclaration(method);
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new Walk(sourceFile, this.getOptions()));
	}
}