# Norm Archive Modernization Plan (Agent-Oriented)

## Objective
Deliver a modern, efficient, polished fan archive experience with clearer homepage intent, simplified navigation, and stronger discovery pathways.

## Agent Assignments

### Agent A — Information Architecture & UX Flow
- Define primary user journeys: New Fan, Returning Fan, Deep Archive User.
- Validate top-nav priorities and reduce equal-weight choices.
- Ensure homepage sequence is: Value prop → Path choice → Featured content.

### Agent B — Visual System & Interaction Design
- Reduce visual noise and decorative effects.
- Keep a consistent editorial-dark aesthetic with restrained accents.
- Standardize card depth, typography rhythm, and spacing.

### Agent C — Front-end Accessibility Engineer
- Improve nav semantics (`aria-expanded`, `aria-controls`).
- Add keyboard escape close behavior and mobile menu state handling.
- Preserve high contrast focus states and reduced cognitive load.

### Agent D — Content Strategy & Editorial Layer
- Convert generic homepage language into guided, confidence-building copy.
- Add trust/freshness modules (“Recently Curated”, “Archive Coverage”, support pointers).
- Keep copy short and action-oriented.

### Agent E — Front-end Platform/Integration
- Implement nav grouping behavior in shared JS to avoid per-page drift.
- Integrate header search trigger with global search modal.
- Keep implementation static-host compatible and maintainable.

## Workstreams and Deliverables

1. **Navigation Restructure**
   - Primary links surfaced directly.
   - Secondary links grouped under Explore.
   - Header search affordance integrated.

2. **Homepage Recomposition**
   - Hero simplified to one clear value proposition and CTA hierarchy.
   - Quote moved into its own module.
   - Path selector raised above featured modules.

3. **Social Proof & Freshness Layer**
   - Add concise trust cards and archive-health narrative.

4. **Accessibility & Interaction Polish**
   - Escape-to-close behavior on nav.
   - Menu-open body lock for mobile contexts.

## Success Criteria
- Faster first decision for new visitors (< 5s to identify next click).
- Cleaner top nav with reduced cognitive overload.
- Better mobile navigation behavior and discoverability.
- Homepage communicates both “curated” and “deep archive” value.
