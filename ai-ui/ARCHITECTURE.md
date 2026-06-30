# PrasannAI UI - Architecture Guide

## 📁 Project Structure

This document outlines the modular, scalable architecture of the PrasannAI UI project.

```
src/
├── components/              # Reusable UI components
│   ├── Header/             # Page header with title
│   ├── PromptForm/         # Main form container
│   ├── PromptInput/        # Textarea for prompts
│   ├── ModelConfig/        # Provider and model selection
│   ├── AdvancedSettings/   # Collapsible advanced options
│   ├── ResponseSection/    # Response display with copy button
│   ├── ErrorBox/           # Error message display
│   ├── LoadingState/       # Loading spinner and status
│   └── EmptyState/         # Empty state placeholder
├── hooks/                   # Custom React hooks
│   ├── useGenerateResponse.js   # Manage response generation
│   └── useCopyToClipboard.js    # Clipboard functionality
├── services/               # API communication
│   └── aiService.js        # AI backend integration
├── config/                 # Configuration files
│   ├── providers.js        # AI providers list
│   └── constants.js        # App-wide constants
├── styles/                 # Global CSS
│   ├── variables.css       # CSS custom properties
│   ├── animations.css      # Global animations
│   ├── layout.css          # Layout utilities
│   └── globals.css         # Entry point
├── App.jsx                 # Root component
└── main.jsx                # React entry point
```

## 🔄 Architecture Overview

### Component Hierarchy

```
App (State Management)
├── Header
└── Content Grid
    ├── Form Column
    │   └── Card
    │       └── PromptForm
    │           ├── PromptInput
    │           ├── ModelConfig
    │           └── AdvancedSettings
    └── Response Column
        └── Card
            ├── ResponseSection (when response exists)
            ├── ErrorBox (when error exists)
            ├── LoadingState (when loading)
            └── EmptyState (default)
```

## 📦 Components

### Atomic Components (Single responsibility)
- **PromptInput**: Textarea with character counter
- **Header**: Page title and description
- **ErrorBox**: Error message display
- **LoadingState**: Loading spinner
- **EmptyState**: Empty state placeholder

### Composite Components (Combine atoms)
- **ModelConfig**: Provider + Model selection
- **AdvancedSettings**: Collapsible advanced options
- **ResponseSection**: Response display + copy button
- **PromptForm**: Complete form with all sections

### Layout Components
- **App**: Main app container, state management
- **Header**: Page header

## 🎣 Custom Hooks

### useGenerateResponse
Manages response generation logic and state:
- `handleSubmit()` - Process form submission
- `setResponse()` - Update response state
- `setError()` - Update error state
- Returns: `response`, `error`, `loading`, `responseRef`, `handleSubmit`

**Location**: `src/hooks/useGenerateResponse.js`

### useCopyToClipboard
Manages clipboard copy functionality:
- `copy(text)` - Copy text to clipboard
- Returns: `copied`, `copy` function

**Location**: `src/hooks/useCopyToClipboard.js`

## 🔧 Services

### aiService.js
Handles all backend API communication:
- `generateResponse(params)` - Send prompt to backend
  - Accepts: `prompt`, `provider`, `model`, `maxTokens`, `temperature`
  - Returns: `{ success, output }` or `{ success: false, error }`
  - Includes timeout handling (30 seconds default)

**Location**: `src/services/aiService.js`

## ⚙️ Configuration

### providers.js
Defines available AI providers:
- `PROVIDERS` - List of provider options
- `DEFAULT_PROVIDER` - Default selected provider
- `DEFAULT_MODEL` - Default selected model

**Location**: `src/config/providers.js`

### constants.js
Global constants and settings:
- `DEFAULT_SETTINGS` - Default form values
- `INPUT_CONSTRAINTS` - Min/max for inputs
- `API_CONFIG` - API endpoint settings
- `UI_TEXT` - All UI strings (easily translatable)

**Location**: `src/config/constants.js`

## 🎨 Styling System

### CSS Architecture
- **variables.css**: CSS custom properties, colors, shadows
- **animations.css**: Global keyframe animations
- **layout.css**: Layout utilities and responsive grid
- **globals.css**: Import entry point
- **Component.module.css**: Component-scoped styles

### CSS Modules
Each component has its own scoped CSS file using CSS Modules:
```jsx
import styles from './Header.module.css';
// Usage: className={styles.title}
```

Benefits:
- No global namespace pollution
- Easy to refactor without affecting others
- Clear component-style relationship
- Prevents accidental style conflicts

### Design Tokens
All design values are in CSS custom properties:
```css
--primary: #2563eb;
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

## 🚀 Adding New Features

### Adding a New Component

1. **Create component folder**
   ```
   src/components/MyComponent/
   ├── MyComponent.jsx
   └── MyComponent.module.css
   ```

2. **Create component file**
   ```jsx
   import styles from './MyComponent.module.css';
   
   export function MyComponent({ prop1, prop2 }) {
       return (
           <div className={styles.container}>
               {/* JSX */}
           </div>
       );
   }
   ```

3. **Create component styles**
   ```css
   .container {
       /* Scoped styles */
   }
   ```

4. **Import and use in App.jsx or parent component**
   ```jsx
   import { MyComponent } from './components/MyComponent/MyComponent.jsx';
   ```

### Adding a New Hook

1. **Create hook file in `src/hooks/`**
   ```
   src/hooks/useMyHook.js
   ```

2. **Implement hook with proper documentation**
   ```jsx
   /**
    * useMyHook - Description
    * @param {type} param - Description
    * @returns {Object} Return values
    */
   export function useMyHook(param) {
       // Hook logic
   }
   ```

3. **Use in components**
   ```jsx
   import { useMyHook } from '../hooks/useMyHook.js';
   const { value } = useMyHook();
   ```

### Adding a New Service

1. **Create service file in `src/services/`**
   ```
   src/services/myService.js
   ```

2. **Implement service functions**
   ```jsx
   /**
    * serviceFunctionName - Description
    * @param {Object} params - Parameters
    * @returns {Promise<Object>} Response
    */
   export async function serviceFunctionName(params) {
       // Implementation
   }
   ```

3. **Use in hooks or components**
   ```jsx
   import { serviceFunctionName } from '../services/myService.js';
   ```

### Adding New Configuration

1. **Add to appropriate config file**
   - Provider-related: `src/config/providers.js`
   - General constants: `src/config/constants.js`

2. **Export and use**
   ```jsx
   import { MY_CONSTANT } from '../config/constants.js';
   ```

## 📋 State Management Strategy

Currently using React hooks for local state. If you need to share state across many components:

### Option 1: Context API (Recommended for small apps)
Create a context file:
```jsx
// src/contexts/MyContext.js
const MyContext = createContext();

export function MyProvider({ children }) {
    const [state, setState] = useState();
    return (
        <MyContext.Provider value={{ state, setState }}>
            {children}
        </MyContext.Provider>
    );
}
```

### Option 2: State Management Library (For complex apps)
Consider:
- Redux
- Zustand
- Recoil

## 🧪 Testing Structure (Ready for future)

When adding tests, use this structure:
```
tests/
├── components/
│   └── Header.test.jsx
├── hooks/
│   └── useGenerateResponse.test.js
├── services/
│   └── aiService.test.js
└── setup.js
```

## ✨ Best Practices

1. **Keep components focused**: One primary responsibility per component
2. **Use composition**: Combine small components into larger ones
3. **Props over state**: Pass data as props when possible
4. **Custom hooks for logic**: Extract reusable logic into hooks
5. **CSS Modules**: Keep styles scoped to components
6. **Constants**: Store magic strings in `config/constants.js`
7. **Documentation**: Add JSDoc comments to functions and hooks
8. **Naming conventions**:
   - Components: PascalCase (`MyComponent.jsx`)
   - Hooks: camelCase starting with 'use' (`useMyHook.js`)
   - Services: camelCase (`myService.js`)
   - CSS classes: camelCase (`.myClass`)

## 🔄 Data Flow

1. **User submits form** → App.jsx `handleSubmit()`
2. **Validation** → useGenerateResponse hook
3. **API call** → aiService.generateResponse()
4. **Response received** → Update state in hook
5. **Component re-renders** → Display response, error, or loading state

## 🚀 Future Improvements

- [ ] Add error boundary component
- [ ] Add unit tests for components and hooks
- [ ] Add storybook for component documentation
- [ ] Add form validation library
- [ ] Add response caching
- [ ] Add keyboard shortcuts
- [ ] Add theme switching (dark mode)
- [ ] Add localization support
- [ ] Add analytics
- [ ] Add state persistence (localStorage)

## 📚 Resources

- [React Documentation](https://react.dev)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

**Last Updated**: 2026-06-30
**Version**: 1.0 (Modular Architecture)
