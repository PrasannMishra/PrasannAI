# AI Engineering Course Master Knowledge

## Purpose

This document contains every important discussion held during the AI Engineering roadmap.

It acts as the permanent knowledge source for AI coding agents.

Rules:

- Never duplicate reusable theory.
- Roadmap lessons are chronological.
- Handbook contains reusable concepts.
- Architecture contains system design.
- Projects contain implementation.
- Glossary contains reusable definitions.

---

# 1. AI Engineering Philosophy

- AI Engineer vs Software Engineer
- AI Engineer vs ML Engineer
- Why this roadmap exists
- Learning philosophy
- Local-first architecture
- Production-first mindset

---

# 2. Learning Portal Decisions

## Vision

Local-first

Zero backend

MDX-first

Git-friendly

Content-driven

Zero code changes

Offline

Searchable

AI-ready

---

## Folder Structure

(content architecture...)

---

## Rendering Strategy

- Auto-discover MDX
- Registry generation
- Dynamic routing
- Sidebar generation
- Search indexing
- Breadcrumb generation
- Reading progress

---

# 3. Content Architecture

Roadmap

Handbook

Architecture

Projects

Glossary

Cheatsheets

Interview

Quiz

Resources

Stable IDs

Cross-linking

---

# 4. AI Chat Architecture

Independent AI Backend

AI SDK

AI Core

AI UI

Provider Registry

Streaming

Conversation

Configuration

Prompt Builder

Context Builder

---

# 5. Streaming Architecture

Complete explanation...

- ReadableStream
- Uint8Array
- TextDecoder
- Buffer
- SSE
- Async Generators
- AbortController
- Continue Generation
- Provider normalization

Production recommendations.

---

# 6. Provider Abstraction

generateText()

generateTextStream()

generateChat()

generateChatStream()

StreamEvent

Provider Registry

Future providers.

---

# 7. Conversation Management

Conversation

Messages

Configuration

History

Token Usage

Metadata

Lifecycle

---

# 8. Prompt Builder

Responsibilities

Template

Composition

Variables

Versioning

Future Prompt Registry

---

# 9. Context Builder

Conversation

Memory

System Prompt

Knowledge

RAG

Attachments

History

Future Context Sources

---

# 10. AI SDK

Purpose

Responsibilities

Exports

Hooks

Services

Future packages

---

# 11. AI Core

Business logic

Provider abstraction

Streaming abstraction

Prompt Builder

Context Builder

Model Registry

Token accounting

Observability

---

# 12. AI Backend

NestJS

Controllers

Streaming endpoint

SSE

Authentication

Logging

Retries

Future MCP

---

# 13. AI UI

React package

Hooks

Chat components

Markdown

Code blocks

Streaming renderer

Conversation state

---

# 14. Learning Portal

Dashboard

Lesson page

Projects

Architecture

Resources

Glossary

Cheatsheets

AI Tutor

Semantic Search

RAG

Revision Generator

Quiz Generator

---

# 15. AI Tutor Vision

Local RAG

Ollama

Embeddings

Semantic Search

Ask My Course

Revision

Interview Coach

---

# 16. Package Architecture

packages/

ai-core

ai-sdk

ai-ui

shared-types

backend

---

# 17. Project Roadmap

AI Chat

Learning Portal

PR Reviewer

Document Chat

Code Review

AI Coding Assistant

---

# 18. Production Best Practices

Provider abstraction

No provider logic in UI

No duplicated prompts

Streaming UX

Abort support

Token tracking

Retry

Logging

Observability

Testing

---

# 19. Content Generation Rules

Roadmap

↓

Handbook

↓

Architecture

↓

Projects

↓

Glossary

↓

Interview

↓

Quiz

No duplication.

Everything reusable becomes handbook.

---

# 20. Future Vision

100-day roadmap

700–1000 MDX documents

AI Tutor

Personal knowledge base

Search

PDF generation

Mobile

VS Code extension

Team learning