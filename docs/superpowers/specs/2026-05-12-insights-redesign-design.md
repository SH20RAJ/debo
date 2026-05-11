# Insights Page Redesign Spec

## Purpose
Recreate the `/dashboard/insights` page to provide a more visually impactful "Cognitive Analysis" experience, highlighting key life patterns through specific AI-driven insights.

## Success Criteria
- [ ] Prominent display of "Cognitive Analysis" and "AI Insights" headers.
- [ ] Three hero cards highlighting:
    - Most mentioned person/entity.
    - Dominant emotional tone.
    - Strongest topic signal.
- [ ] Visual consistency with the Duolingo-inspired design system.
- [ ] Functional integration with the existing `queryGraph` and `LifeInsights` logic.

## Design
- **Header**: Large bold typography using `Feather Bold` (Nunito) style.
- **Hero Cards**:
    - **Mentions**: Macaw Blue (`#1CB0F6`) with `Link2` icon.
    - **Tone**: Cardinal Red (`#FF4B4B`) with `Smile` icon (or similar).
    - **Topic**: Fox Orange (`#FF9600`) with `Zap` icon.
- **Data Flow**:
    - The page will use `queryGraph` to fetch patterns and insights.
    - We will extract the top person, emotion, and topic from the graph snapshot.
- **Components**:
    - `InsightsPage`: Server component at `/dashboard/insights`.
    - `InsightsHero`: New client component for the 3 hero cards.
    - `PatternList`: New client component for the secondary mention counts.

## Architecture
1. **Server-Side**: Fetch journal count and query graph in `InsightsPage`.
2. **Client-Side**: 
    - Render the `InsightsHero` with the specific insights.
    - Render a refreshed `PatternList` for deeper dives.

## Testing Strategy
- Verify that the page loads correctly with and without data.
- Ensure the specific insight strings match the user's request.
- Check responsive layout on mobile and desktop.
