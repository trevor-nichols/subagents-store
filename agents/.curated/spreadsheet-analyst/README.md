# Spreadsheet Analyst Agent

Specialized sub-agent for spreadsheet creation, editing, analysis, and formatting tasks.

## Intended use
- Complex workbook edits where formulas/references must be preserved.
- Data analysis workflows across `.xlsx`, `.csv`, and `.tsv`.
- Spreadsheet QA and validation before handoff.

## Behavior highlights
- Runs with high reasoning effort and detailed reasoning summaries.
- Delegates spreadsheet-specific workflows to the `$spreadsheet` skill.
- Prioritizes correctness, reproducibility, and clear risk reporting.
