import * as Lint from 'tslint';
import ts from 'typescript';
import { prevStatementChecker } from './helpers/prevChecker';

class Walk extends Lint.RuleWalker {

	public visitFunctionDeclaration(functionDeclaration: ts.FunctionDeclaration) {

		if (prevStatementChecker(functionDeclaration, this.getSourceFile())) {

			this.addFailureAtNode(functionDeclaration, 'Function must have a line before');
		}

		super.visitFunctionDeclaration(functionDeclaration);
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new Walk(sourceFile, this.getOptions()));
	}
}