# PrasannAI UI - Developer Quick Reference

## 📂 Where to Find Things

| What | Where |
|------|-------|
| New UI Component | `src/components/ComponentName/` |
| Reusable Logic | `src/hooks/useHookName.js` |
| API Calls | `src/services/` |
| Global Constants | `src/config/constants.js` |
| Provider Settings | `src/config/providers.js` |
| Global Styles | `src/styles/` |
| Component Styles | `src/components/ComponentName/ComponentName.module.css` |

## 🎯 Common Tasks

### Add a New Form Field

1. **Create component** in `src/components/YourField/`
2. **Add prop to PromptForm**: `onYourFieldChange`
3. **Add state to App.jsx**: `const [yourField, setYourField]`
4. **Pass props**: `onYourFieldChange={setYourField}`
5. **Update aiService**: Add to request body if needed

### Change API Endpoint

Edit `src/config/constants.js`:
```js
export const API_CONFIG = {
    endpoint: '/your-new-endpoint',  // Change here
    // ...
};
```

### Change Default Settings

Edit `src/config/constants.js`:
```js
export const DEFAULT_SETTINGS = {
    maxTokens: 1000,  // Change here
    temperature: 0.5,  // Or here
};
```

### Add UI Text (Prepare for i18n)

All UI strings are in `src/config/constants.js` under `UI_TEXT`. Change them once, used everywhere.

### Style a Component

Create `ComponentName.module.css` in component folder:
```css
.container {
    /* Use CSS variables: */
    background: var(--primary);
    box-shadow: var(--shadow-md);
    transition: var(--transition);
}
```

### Change Design Colors

Edit `src/styles/variables.css`:
```css
--primary: #2563eb;  /* Change here */
--primary-dark: #1d4ed8;
```

## 🔗 Component Prop Patterns

### Input Component
```jsx
<YourInput
    value={state}
    onChange={setState}
    label="Label"
/>
```

### Config Component
```jsx
<YourConfig
    prop={state}
    onPropChange={setState}
    otherProp={state}
    onOtherPropChange={setState}
/>
```

### Display Component
```jsx
<YourDisplay
    content={data}
    onAction={handler}
/>
```

## 📊 State Management

### App.jsx handles:
- Form inputs: prompt, provider, model, maxTokens, temperature
- Response state: via `useGenerateResponse` hook

### Each component handles:
- Local UI state (modals, collapsibles, etc.)
- Component-specific interactions

### If data needs sharing:
- Pass as props down the tree
- Or create a Context (see ARCHITECTURE.md)

## 🐛 Debugging

### Check component props:
```jsx
console.log({ prop1, prop2 }); // In component
```

### Check hook state:
```jsx
const { response, error, loading } = useGenerateResponse();
console.log({ response, error, loading });
```

### Check styles applied:
- Use browser DevTools → Inspect element
- Check `.module.css` files
- Verify CSS variables in root

### Check API calls:
- DevTools → Network tab
- Check `src/services/aiService.js`
- Verify endpoint in `src/config/constants.js`

## ✅ Code Quality Checklist

- [ ] Component has one clear responsibility
- [ ] Props are documented with JSDoc
- [ ] Component-scoped styles use CSS Modules
- [ ] Used CSS variables instead of hardcoded colors
- [ ] Extracted reusable logic to hooks
- [ ] API calls isolated in services
- [ ] Constants in config files
- [ ] No global state pollution
- [ ] Error handling implemented
- [ ] Loading states shown

## 📦 Import Paths

```jsx
// Components
import { ComponentName } from '../components/ComponentName/ComponentName.jsx';

// Hooks
import { useHookName } from '../hooks/useHookName.js';

// Services
import { serviceName } from '../services/serviceFile.js';

// Config
import { CONSTANT } from '../config/constants.js';
import { PROVIDER, DEFAULT_PROVIDER } from '../config/providers.js';

// Styles (in main App.jsx only)
import './styles/globals.css';
```

## 🚀 Deploy Checklist

- [ ] All components tested in browser
- [ ] No console errors
- [ ] API endpoint correct
- [ ] Loading states work
- [ ] Error handling works
- [ ] Copy button works
- [ ] Responsive design tested
- [ ] Mobile responsive checked

## 💡 Pro Tips

1. **CSS Variables**: Use `var(--primary)` instead of hardcoding colors
2. **Class Names**: Always use `styles.className` with CSS Modules
3. **Comments**: Add comments for non-obvious logic
4. **Prop Validation**: Use JSDoc for component props
5. **DRY**: Don't repeat code - extract to hooks/components
6. **Naming**: Use clear, descriptive names for variables and functions

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| Styles not applying | Check CSS Module import: `import styles from './X.module.css'` |
| State not updating | Ensure you're calling setter function: `setState(newValue)` |
| Component not showing | Check it's imported and rendered in parent |
| API not called | Check endpoint in `config/constants.js` |
| Colors look wrong | Check CSS variables in `styles/variables.css` |

---

For detailed architecture info, see [ARCHITECTURE.md](./ARCHITECTURE.md)
