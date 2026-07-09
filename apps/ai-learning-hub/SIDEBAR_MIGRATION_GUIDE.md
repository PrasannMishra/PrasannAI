# Sidebar Migration Guide

## Overview

The sidebar has been refactored from a keyword-matching system to a metadata-driven architecture. This eliminates duplicate lesson entries and provides a scalable navigation system for 500+ lessons.

## What Changed

### Before
- Keyword matching across title, description, topics, and tags
- Lessons appeared under multiple categories (duplication)
- No phase grouping
- No collapsible sections
- No state persistence

### After
- Metadata-driven categorization using `lesson.categories`
- Phase-based grouping using `lesson.phase`
- Collapsible sections with localStorage persistence
- Progress indicator showing completion status
- Performance optimized with useMemo

## Files Modified

1. **src/types/index.ts** - Added `phase?: string` and `categories: string[]` to Lesson, FrontMatter, and LessonMetadata interfaces
2. **src/utils/contentLoader.ts** - Updated MDX parser to extract `phase` and `categories` fields
3. **src/components/Layout.tsx** - Updated import to use new sidebar path
4. **src/components/Sidebar.tsx** - DELETED (replaced by new architecture)

## Files Created

### New Sidebar Components
- `src/components/sidebar/Sidebar.tsx` - Main sidebar container
- `src/components/sidebar/SidebarItem.tsx` - Reusable navigation item
- `src/components/sidebar/SidebarGroup.tsx` - Group container
- `src/components/sidebar/RoadmapSection.tsx` - Learning path with phase grouping
- `src/components/sidebar/ConceptSection.tsx` - Concept-based grouping
- `src/components/sidebar/LessonLink.tsx` - Individual lesson link with progress
- `src/components/sidebar/useSidebarState.ts` - State management hook
- `src/components/sidebar/index.ts` - Barrel export file

### Configuration
- `src/config/sidebar.config.ts` - Sidebar configuration and structure

## MDX Content Updates

### Required Changes to MDX Files

Add `phase` and `categories` fields to your lesson frontmatter:

```yaml
---
day: 1
title: AI Engineering Roadmap
phase: "Foundations"  # Add this
categories:          # Add this
  - "ai-engineering"
  - "fundamentals"

# ... rest of frontmatter
---
```

### Example: Day 2 MDX

```yaml
---
day: 2
title: Large Language Models & Provider Landscape
phase: "Foundations"
categories:
  - "llm-fundamentals"
  - "providers"

topics:
  - LLM
  - Tokens
  - Context Window

tags:
  - llm
  - ai
  - claude
---
```

### Category Naming Convention

Use kebab-case for categories:
- ✅ `prompt-engineering`
- ✅ `rag-systems`
- ✅ `llm-fundamentals`
- ❌ `Prompt Engineering`
- ❌ `RAG Systems`

Categories are automatically formatted for display (e.g., `prompt-engineering` → `Prompt Engineering`).

### Phase Naming Convention

Use title case for phases:
- ✅ `Foundations`
- ✅ `LLM Applications`
- ✅ `AI Agents`
- ❌ `foundations`
- ❌ `llm-applications`

## Regenerating Content Index

After updating MDX files, regenerate the content index:

```bash
# If using a build script
npm run build:content

# Or manually trigger content loading
# The app will automatically load updated content on next start
```

## Content Index Structure

The generated `content-index.json` now includes:

```json
{
  "id": "day-002",
  "day": 2,
  "title": "LLM Landscape",
  "phase": "Foundations",
  "categories": ["llm-fundamentals", "providers"],
  "topics": ["LLM", "Tokens"],
  "tags": ["llm", "ai"],
  // ... other fields
}
```

## Navigation Structure

### Learning Path (Roadmap)
```
▼ AI Engineer Roadmap
    ▼ Foundations
        ✓ Day 1: AI Engineering Roadmap
        ▶ Day 2: LLM Landscape
        ○ Day 3: Prompt Engineering
    ▼ LLM Applications
        Day 10: RAG
        Day 11: Embeddings
```

### Concepts
```
▼ Concepts
    ▼ LLMs
        Day 2: LLM Landscape
        Day 6: Streaming Fundamentals
    ▼ Prompt Engineering
        Day 3: Prompt Engineering
        Day 4: Prompt Templates
```

## Performance Optimizations

1. **useMemo for filtering** - Lessons filtered only when lessons array changes
2. **useMemo for grouping** - Phase and concept groups calculated once
3. **localStorage for state** - Collapsed sections persist across sessions
4. **Efficient re-renders** - Components only update when their data changes

## Testing Checklist

### Functional Testing
- [ ] Sidebar loads without errors
- [ ] Lessons appear under correct phases
- [ ] Lessons appear under correct concepts
- [ ] No duplicate lessons in navigation
- [ ] Collapsible sections work
- [ ] Expanded/collapsed state persists on refresh
- [ ] Active lesson is highlighted
- [ ] Progress indicator shows correct percentage
- [ ] Completed lessons show checkmark icon
- [ ] Navigation links work correctly

### Performance Testing
- [ ] Sidebar loads quickly with 100+ lessons
- [ ] No lag when expanding/collapsing sections
- [ ] Smooth scrolling with 500+ lessons
- [ ] No memory leaks in console

### Edge Cases
- [ ] Lessons without phase appear under "General"
- [ ] Lessons without categories don't appear in Concepts
- [ ] Empty categories are filtered out
- [ ] Special characters in category names handled
- [ ] Very long lesson titles truncated properly

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile responsive (if applicable)

### Dark Mode
- [ ] All text readable in dark mode
- [ ] Icons visible in dark mode
- [ ] Progress bar visible in dark mode
- [ ] Hover states work in dark mode

## Troubleshooting

### Lessons not appearing in sidebar
1. Check browser console for errors
2. Verify MDX files have `phase` and `categories` fields
3. Ensure content-index.json is regenerated
4. Check that lessons are being loaded from ContentApi

### Duplicate lessons still appearing
1. This should not happen with new system
2. If it does, check MDX files for multiple category entries
3. Verify categories are unique per lesson

### State not persisting
1. Check localStorage is enabled in browser
2. Verify no browser extensions blocking localStorage
3. Check console for localStorage errors

### Performance issues
1. Verify useMemo hooks are working (check React DevTools)
2. Check for unnecessary re-renders
3. Ensure lessons array is not being recreated on each render

## Rollback Plan

If issues arise, you can rollback:

1. Restore old `Sidebar.tsx` from git
2. Revert type changes in `types/index.ts`
3. Revert parser changes in `contentLoader.ts`
4. Revert Layout.tsx import

```bash
git checkout src/components/Sidebar.tsx
git checkout src/types/index.ts
git checkout src/utils/contentLoader.ts
git checkout src/components/Layout.tsx
```

## Next Steps

1. Update all MDX files with `phase` and `categories`
2. Regenerate content-index.json
3. Test thoroughly with existing content
4. Deploy to production
5. Monitor for issues

## Support

For issues or questions:
- Check console for error messages
- Review MDX frontmatter format
- Verify content-index.json structure
- Test with single lesson first before bulk update