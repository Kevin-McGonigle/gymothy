---
name: base-ui
description: A reference for using Base UI primitives to build accessible, flexible, and production-grade frontend interfaces. Use this skill when you want to implement or review UI components.
---

# Base UI Guidelines

Implement or review UI components using Base UI.

## How It Works

1. Fetch the latest documentation from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Navigate the documentation to find relevant information for the UI component(s) in question
4. If implementing, follow the documentation to build the UI components. If reviewing, check the components against the documentation and output any issues or improvements in the terse `file:line` format.

## Documentation Source

Use WebFetch to retrieve the latest documentation:

```
https://base-ui.com/llms.txt
```

The fetched content contains all the base UI documentation - try to find only the relevant sections for the component(s) in question. Always read the handbook sections for holistic best practices. Avoid reading unnecessary documentation, such as release notes.
