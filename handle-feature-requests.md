# Rule: Feature Request and Bug Report Handling

## Goal

To guide an AI assistant in processing feature requests and bug reports for the Trading Journal app through a systematic 9-step workflow. The process handles everything from initial triage to implementation, ensuring requests are properly analyzed, documented, and either fulfilled through existing functionality or developed as new features.

## Process Overview

The workflow consists of 9 sequential steps:

1. **Request Submission** - User submits request or responds to guide
2. **Triage & Documentation Review** - Agent reads request and checks existing documentation
3. **Fulfillment Check** - If fulfilled, generate user guide response
4. **PM Clarification** - If not fulfilled, gather requirements using Jobs To Be Done
5. **PRD Generation** - Create Product Requirements Document
6. **Solution Design** - Generate 3 alternative solutions
7. **Solution Selection** - User chooses or refines solution
8. **Task List Generation** - Create detailed development plan
9. **Implementation** - Execute development tasks

## Detailed Process

### Step 1: Request Submission

**Input:**

- User submits a new feature request or bug report in `/requests/[number]/` folder
- OR user responds to a previously generated user guide
- OR user explicitly asks agent to check for new requests (e.g., "Check for new requests in /requests/")

**Agent Actions:**

1. **Detect New Requests**
   - When explicitly asked to check, or when starting the workflow, list contents of `/requests/` directory
   - Identify the highest numbered request folder
   - Check for new numbered subdirectories or files that haven't been processed yet
   - If user points to a specific request, read that file directly

2. **Read Request Content**
   - Read the request file completely
   - If it's a response to a guide, locate and read the original request context from the same folder
   - Identify all relevant files in the request folder (e.g., `request.md`, `user-responses.md`, etc.)

**Output:**

- Request content loaded and ready for Step 2
- Identification of which step in the workflow this request is at (new request vs. in-progress)

**Notes:**

- Each request should be in its own numbered folder: `/requests/0001/`, `/requests/0002/`, etc.
- Request files should be named descriptively (e.g., `request.md`, `bug-report.md`, or user-provided name)
- Agent responses should be saved in the same folder with descriptive names (e.g., `triage-assessment.md`, `user-guide-response.md`, `jobs-to-be-done.md`)
- **Important**: The agent does not automatically monitor directories. The agent checks for new requests when:
  - User explicitly asks to check for new requests
  - User points to a specific request file
  - Starting a new workflow session and the user indicates there's a new request to process

---

### Step 2: Triage & Documentation Review

**Goal:** Determine if the request is already fulfilled by existing functionality or can be achieved through a workaround.

**Agent Actions:**

1. **Read Request Content**

   - Parse the request file completely
   - Identify the core need or problem described
   - Note any specific feature mentions or bug descriptions

2. **Review Documentation**

   - Read `/README.md` to understand current features
   - Read `/docs/USER_GUIDE.md` to understand available functionality
   - Read relevant documentation in `/docs/` folder (e.g., `API_DOCUMENTATION.md` for API-related requests)
   - Search codebase for existing implementations related to the request
   - Check existing PRDs in `/tasks/` folder to see if similar features are planned or documented

3. **Assessment**

   - Compare request against existing features
   - Check if functionality exists but may need better documentation
   - Identify potential workarounds using existing features
   - Determine if request is:
     - **Fulfilled**: Feature exists and works as requested
     - **Partially Fulfilled**: Similar feature exists but needs enhancement
     - **Not Fulfilled**: New feature or bug fix required

**Output:**

- Assessment result (Fulfilled / Partially Fulfilled / Not Fulfilled)
- Evidence from documentation or codebase
- Brief rationale for the assessment

**Documentation:**

- Save assessment as `triage-assessment.md` in the request folder
- Include references to relevant documentation sections or code files

---

### Step 3: Generate User Guide (if Fulfilled)

**Goal:** Provide step-by-step instructions to help the user achieve their goal using existing functionality.

**Trigger:** Step 2 assessment returns "Fulfilled" or "Partially Fulfilled"

**Agent Actions:**

1. **Identify Solution Path**

   - Map the user's need to existing features
   - If partially fulfilled, identify what exists and what might be missing
   - Determine the sequence of steps needed

2. **Generate Guide**

   - Create clear, numbered steps
   - Include screenshots or specific UI element references where helpful
   - Reference specific features by name
   - Provide workaround instructions if applicable
   - Include links to relevant sections in `/docs/USER_GUIDE.md`

3. **Format Response**

   - Use friendly, helpful tone
   - Acknowledge the user's need
   - Explain how existing features address it
   - If partially fulfilled, acknowledge limitations and offer to proceed with enhancement if needed

**Output:**

- Step-by-step user guide saved as `user-guide-response.md` in request folder
- Optionally, update `/docs/USER_GUIDE.md` if a commonly requested feature needs better documentation

**Format:**

```markdown
# Response to Request #[number]

## Your Request
[Brief summary of the request]

## Solution
Great news! The Trading Journal already supports this functionality. Here's how to use it:

### Step 1: [Action]
[Detailed instructions]

### Step 2: [Action]
[Detailed instructions]

...

## Additional Resources
- [Link to relevant USER_GUIDE section]
- [Link to relevant feature documentation]

## Follow-up
If this doesn't fully address your needs, please reply with:
- What specific aspect is missing
- How you'd like to see it enhanced
```

**Next Steps:**

- Wait for user response in the request folder
- If user confirms fulfillment, mark request as resolved
- If user responds with additional needs, proceed to Step 4

---

### Step 4: Product Manager Clarification (Jobs To Be Done)

**Goal:** Act as a product manager and gather comprehensive requirements using the Jobs To Be Done (JTBD) framework.

**Trigger:** Step 2 assessment returns "Not Fulfilled" OR user responds to Step 3 indicating additional needs

**Jobs To Be Done Framework:**

JTBD focuses on understanding:

- **The Job**: What progress is the user trying to make?
- **The Context**: What situation triggers this need?
- **The Desired Outcome**: What does success look like?
- **Current Alternatives**: How do they solve this today?
- **Barriers**: What prevents them from making progress?

**Agent Actions:**

1. **Initial Analysis**

   - Identify the core "job" the user is trying to accomplish
   - Note any explicit requirements mentioned
   - Identify gaps in understanding

2. **Generate Clarifying Questions**

   - Use JTBD framework to structure questions:
     - **Context Questions**: When/where/why does this need arise?
     - **Job Questions**: What progress are you trying to make?
     - **Outcome Questions**: What would success look like?
     - **Alternative Questions**: How do you solve this today?
     - **Barrier Questions**: What prevents you from making progress?
   - Prioritize questions (most important first)
   - Present 5-8 questions maximum to avoid overwhelming the user
   - Format questions as lettered/numbered lists for easy response

3. **Present Questions**

   - Save questions as `clarifying-questions.md` in request folder
   - Explain why these questions are important (using JTBD language)
   - Provide context on what information is needed

**Output Format:**

```markdown
# Clarifying Questions - Request #[number]

## Understanding Your Need

Based on your request, I'd like to understand the situation better using the Jobs To Be Done framework. This helps us design the right solution.

## Questions

### A) The Job (What progress are you trying to make?)
1. What specific outcome or progress are you trying to achieve?
2. Why is this important to you right now?

### B) The Context (When and where does this need arise?)
3. When do you typically encounter this need?
4. What triggers this need? (e.g., during trade entry, while analyzing, etc.)

### C) The Desired Outcome (What does success look like?)
5. How will you know if this feature/bug fix successfully addresses your need?
6. What would an ideal solution look like from your perspective?

### D) Current Alternatives (How do you solve this today?)
7. How do you currently handle this need? (workaround, manual process, etc.)
8. What limitations or frustrations do you experience with current approaches?

### E) Barriers (What prevents progress?)
9. What currently prevents you from making the progress you need?
10. Are there any constraints or requirements we should be aware of?

## Next Steps

Please respond to these questions (you can use the letter/number format for easy reference). 
Once I understand your needs, I'll create a comprehensive requirements document.
```

**Wait for User Response:**

- Monitor the request folder for user responses
- Once received, proceed to Step 5

---

### Step 5: Create Jobs To Be Done Documentation

**Goal:** Synthesize user responses into a well-structured JTBD document that will inform PRD creation.

**Agent Actions:**

1. **Synthesize Responses**

   - Extract key information from user responses
   - Map responses to JTBD framework elements
   - Identify patterns and priorities

2. **Create JTBD Document**

   - Structure according to JTBD framework
   - Include direct quotes from user where relevant
   - Highlight contradictions or areas needing clarification
   - Identify explicit and implicit requirements

**Output Format:**

```markdown
# Jobs To Be Done Analysis - Request #[number]

## Executive Summary
[One paragraph summarizing the user's job-to-be-done]

## The Job
**Statement**: [Clear statement of the job the user is trying to accomplish]

**Detail**: [Expanded explanation based on user responses]

## The Context
**When**: [When does this need arise?]

**Where**: [Where does this need arise - in the app, in workflow, etc.]

**Triggers**: [What situations or events trigger this need?]

## Desired Outcome
**Success Criteria**: [How will the user know this is successful?]

**Ideal State**: [What does the ideal solution look like?]

**Value**: [What value does this create for the user?]

## Current Alternatives
**Current Approach**: [How user currently solves this]

**Limitations**: [Frustrations and limitations with current approach]

**Pain Points**: [Specific pain points identified]

## Barriers
**Technical Barriers**: [Any technical constraints]

**User Barriers**: [Any user experience barriers]

**Process Barriers**: [Any workflow or process barriers]

## Requirements Synthesis
**Must Have**: [Critical requirements - failure modes if missing]
**Should Have**: [Important requirements - significant value]
**Nice to Have**: [Optional requirements - incremental value]

## Open Questions
[Any remaining areas needing clarification]

## Next Steps
Ready to proceed to PRD creation using create-prd.md guidelines.
```

**Output:**

- Save as `jobs-to-be-done.md` in request folder
- Proceed to Step 6

---

### Step 6: Generate PRD

**Goal:** Create a Product Requirements Document using the established `create-prd.md` guidelines.

**Agent Actions:**

1. **Read JTBD Document**

   - Review the Jobs To Be Done analysis
   - Extract functional requirements
   - Identify user stories

2. **Follow create-prd.md Process**

   - Use the JTBD document as the primary input (instead of asking clarifying questions again)
   - If additional details are needed, ask only essential follow-up questions
   - Generate PRD following the structure in `create-prd.md`:
     - Introduction/Overview
     - Goals
     - User Stories
     - Functional Requirements
     - Non-Goals
     - Design Considerations
     - Technical Considerations
     - Success Metrics
     - Open Questions

3. **Save PRD**

   - Save as `/tasks/[n]-prd-[feature-name].md`
   - Follow the existing numbering scheme
   - Reference the original request: "Based on request #[number] in /requests/[number]/"

**Output:**

- PRD file in `/tasks/` directory
- Proceed to Step 7

---

### Step 7: Generate Three Solution Alternatives

**Goal:** Create three distinct solution approaches to address the PRD requirements, giving the user options to choose from or refine.

**Agent Actions:**

1. **Analyze PRD Requirements**

   - Review functional requirements
   - Identify different architectural approaches
   - Consider trade-offs (complexity, time, user experience, technical debt)

2. **Design Three Solutions**

   - **Solution A**: Usually the most straightforward/minimal implementation
   - **Solution B**: Balanced approach (middle ground)
   - **Solution C**: Comprehensive/ambitious approach (maximum feature set)
   - Each solution should be:
     - Technically feasible
     - Address core requirements
     - Have clear trade-offs
     - Include implementation complexity estimate

3. **Document Solutions**

**Output Format:**

```markdown
# Solution Alternatives - Request #[number]

**Based on PRD**: `[prd-filename].md`

## Overview
Three solution approaches to address the requirements. Each has different trade-offs in terms of implementation complexity, feature scope, and user experience.

---

## Solution A: [Descriptive Name]
**Tagline**: [One sentence summary]

### Approach
[2-3 paragraphs describing the solution approach]

### Features Included
- [Feature 1]
- [Feature 2]
- ...

### Technical Implementation
- [Key technical decisions]
- [Components/modules involved]
- [Database changes if any]

### Pros
- [Advantage 1]
- [Advantage 2]

### Cons
- [Limitation 1]
- [Limitation 2]

### Complexity Estimate
- **Development Time**: [Estimate, e.g., "2-3 days", "1 week"]
- **Technical Risk**: [Low/Medium/High]
- **Testing Effort**: [Estimate]

---

## Solution B: [Descriptive Name]
[Same structure as Solution A]

---

## Solution C: [Descriptive Name]
[Same structure as Solution A]

---

## Comparison Matrix

| Aspect | Solution A | Solution B | Solution C |
|--------|------------|------------|------------|
| Development Time | [X] | [Y] | [Z] |
| Feature Completeness | [%] | [%] | [%] |
| User Experience | [Rating] | [Rating] | [Rating] |
| Technical Complexity | [Rating] | [Rating] | [Rating] |
| Maintenance Burden | [Rating] | [Rating] | [Rating] |

## Recommendation
[Which solution is recommended and why - can be user's choice]

## Next Steps
Please review the solutions and indicate:
- Which solution you prefer (A, B, or C)
- Any modifications or hybrid approach you'd like
- Any questions about the solutions
```

**Output:**

- Save as `solution-alternatives.md` in request folder
- Wait for user decision

---

### Step 8: User Solution Selection

**Goal:** Receive user feedback and finalize the chosen solution.

**Agent Actions:**

1. **Wait for User Response**

   - User may choose A, B, or C
   - User may request modifications
   - User may ask clarifying questions

2. **Refine Solution (if needed)**

   - If user requests modifications, update the solution document
   - If hybrid approach, create a refined solution combining elements
   - Update PRD if requirements changed based on solution choice

3. **Finalize Solution**

   - Document the selected solution
   - Update PRD if needed to reflect chosen approach
   - Prepare for task list generation

**Output:**

- Updated `solution-alternatives.md` with selected solution marked
- Optionally, updated PRD if significant changes
- Proceed to Step 9

---

### Step 9: Generate Task List

**Goal:** Create a detailed development task list using `generate-tasks.md` guidelines.

**Agent Actions:**

1. **Use Selected Solution**

   - Reference the finalized solution from Step 8
   - Ensure PRD reflects the chosen approach

2. **Follow generate-tasks.md Process**

   - Read the PRD file
   - Assess current codebase state
   - Generate parent tasks (Phase 1)
   - Wait for user "Go" confirmation
   - Generate sub-tasks (Phase 2)
   - Identify relevant files

3. **Save Task List**

   - Save as `/tasks/tasks-[prd-filename].md`
   - Reference the original request

**Output:**

- Task list file in `/tasks/` directory
- Proceed to Step 10

---

### Step 10: Process Development Tasks

**Goal:** Execute the development tasks following `process-task-list.md` guidelines.

**Agent Actions:**

1. **Follow process-task-list.md Protocol**

   - Work on one sub-task at a time
   - Ask user permission before starting each sub-task
   - Mark tasks complete as you go
   - Follow completion protocol (type-check, tests, commit)
   - Update task list regularly

2. **Maintain Documentation**

   - Update "Relevant Files" section as files are created/modified
   - Keep task list current

3. **Handle Issues**

   - If blockers arise, document them
   - Ask user for guidance when needed
   - Update task list with any newly discovered tasks

**Output:**

- Completed implementation
- Updated task list
- Committed code changes

---

## File Organization

### Request Folder Structure

```
/requests/
  /0001/
    request.md                    # Original user request
    triage-assessment.md          # Step 2 output
    user-guide-response.md        # Step 3 output (if fulfilled)
    clarifying-questions.md       # Step 4 output
    user-responses.md            # User's answers to questions
    jobs-to-be-done.md           # Step 5 output
    solution-alternatives.md     # Step 7 output
    solution-selection.md        # Step 8 output (user choice)
  /0002/
    ...
```

### Generated Documents

- PRDs: `/tasks/[n]-prd-[feature-name].md`
- Task Lists: `/tasks/tasks-[prd-filename].md`
- User Guides (updates): `/docs/USER_GUIDE.md` (if common request)

---

## Agent Behavior Guidelines

### When Processing Requests

1. **Be Proactive**: When explicitly asked to check for new requests, or when user indicates a new request exists, check `/requests/` folder by listing directory contents to identify new numbered folders or files
2. **Be Thorough**: Always review documentation before concluding something doesn't exist
3. **Be User-Centric**: Focus on user needs, not just technical implementation
4. **Be Transparent**: Explain reasoning at each step
5. **Be Efficient**: Don't ask redundant questions if information is already available

**Note on Directory Monitoring**: The agent does not have continuous background monitoring capabilities. To detect new requests:
- Use `list_dir` tool to check `/requests/` folder contents
- Identify the highest numbered folder to see latest requests
- Check individual request folders to see what stage they're at (based on which files exist)
- User can explicitly ask: "Check for new requests" or "Process request in /requests/0002/"

### Communication Style

- Use friendly, professional tone
- Acknowledge user needs and frustrations
- Explain technical concepts in accessible language
- Provide clear next steps at each stage

### Quality Standards

- All documents should be well-structured and readable
- Reference original request in all generated documents
- Maintain traceability from request → JTBD → PRD → Tasks → Implementation
- Update relevant documentation (e.g., USER_GUIDE.md) when features are added

---

## Error Handling

### If Request is Ambiguous

- Ask targeted clarifying questions (can skip to Step 4)
- Make reasonable assumptions and document them
- Allow user to refine understanding as process progresses

### If Documentation is Outdated

- Note discrepancies
- Update documentation as part of the process
- Proceed with codebase analysis if docs don't match reality

### If Implementation Hits Blockers

- Document the blocker in task list
- Ask user for guidance
- Consider alternative approaches if appropriate

---

## Success Criteria

A request is successfully processed when:

- User receives either: (a) a helpful guide to existing functionality, OR (b) a fully implemented feature/bug fix
- All documentation is created and traceable
- Code changes are tested, committed, and follow project conventions
- User's original need is addressed

---

## Integration with Existing Guidelines

This process integrates with:

- **create-prd.md**: Used in Step 6 for PRD generation
- **generate-tasks.md**: Used in Step 9 for task list creation
- **process-task-list.md**: Used in Step 10 for implementation

Ensure consistency with these existing guidelines while following this workflow.

---

## Example Flow

1. User creates `/requests/0002/export-to-pdf.md` requesting PDF export
2. Agent reads request, checks README.md → finds CSV export exists, PDF does not
3. Assessment: "Not Fulfilled"
4. Agent asks JTBD questions about when/why user needs PDF export
5. User responds: needs PDF for sharing with mentor, wants formatted reports
6. Agent creates JTBD document
7. Agent creates PRD: `/tasks/0002-prd-pdf-export.md`
8. Agent creates 3 solutions: (A) Simple PDF lib, (B) Template-based, (C) Full report builder
9. User selects Solution B
10. Agent generates task list: `/tasks/tasks-0002-prd-pdf-export.md`
11. Agent implements with user approval, following process-task-list.md

