import * as Lint from 'tslint';
import ts from 'typescript';

const NEW_LINE_AFTER = 'Missing blank line after block declaration';
const NEW_LINE_END = 'Not allowed blank line before block ends';

class Walker extends Lint.RuleWalker {

	public visitBlock(block: ts.Block) {

		if (block.getChildAt(1).getChildCount() > 0) {

			this.hasLineBetweenBlockStartsAndContent(block);

			this.hasntLineBetweenBlockEndsAndContent(block);
		}

		super.visitBlock(block);
	}

	private hasLineBetweenBlockStartsAndContent(block: ts.Block) {

		const startLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), block.getStart()).line;
		const childLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), block.getChildAt(1).getStart()).line;

		if (childLine <= (startLine + 1)) {

			this.addFailureAtNode(block, NEW_LINE_AFTER, new Lint.Replacement(block.getStart() + 1, 1, '\n'));
		}
	}

	private hasntLineBetweenBlockEndsAndContent(block: ts.Block) {

		const endLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), block.getEnd()).line;
		const childEndLine = ts.getLineAndCharacterOfPosition(this.getSourceFile(), block.getChildAt(1).getEnd()).line;

		if (endLine > (childEndLine + 1)) {

			this.addFailureAtNode(block, NEW_LINE_END, new Lint.Replacement(block.getStart() + 1, 1, '\n'));
		}
	}
}

export class Rule extends Lint.Rules.AbstractRule {

	public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

		return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
	}
}