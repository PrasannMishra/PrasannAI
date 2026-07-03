/**
 * Shared Type Definitions for AI Platform
 * These types are used by both frontend (ai-sdk) and backend (ai-core)
 */

// ============================================================================
// Core Message Types
// ============================================================================

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
    metadata?: Record<string, unknown>;
}

export interface Conversation {
    id: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, unknown>;
}

// ============================================================================
// Provider Types
// ============================================================================

export type ProviderType = 'anthropic' | 'ollama' | 'openai-compatible' | 'openai' | 'gemini';

export interface ProviderConfig {
    type?: ProviderType;
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    defaults?: ProviderDefaults;
    requestOptions?: Record<string, unknown>;
}

export interface ProviderDefaults {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
}

export interface ModelInfo {
    id: string;
    name: string;
    provider: ProviderType;
    maxTokens?: number;
    supportsStreaming?: boolean;
    supportsVision?: boolean;
    metadata?: Record<string, unknown>;
}

// ============================================================================
// Completion Types
// ============================================================================

export type CompletionMode = 'text' | 'chat';

export interface CompletionOptions {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    requestBody?: Record<string, unknown>;
    requestOptions?: Record<string, unknown>;
}

export interface CompletionRequest {
    mode: CompletionMode;
    provider: ProviderType;
    messages?: ChatMessage[];
    prompt?: string;
    options: CompletionOptions;
}

export interface CompletionResponse {
    success: boolean;
    provider: ProviderType;
    model: string;
    output: string;
    mode: CompletionMode;
    error?: string;
    metadata?: CompletionMetadata;
}

export interface CompletionMetadata {
    tokenUsage?: TokenUsage;
    finishReason?: string;
    generationTime?: number;
    latency?: number;
    tokensPerSecond?: number;
}

export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

// ============================================================================
// Streaming Types
// ============================================================================

export type StreamEventType = 'chunk' | 'done' | 'error' | 'metadata' | 'stopped';

export interface StreamEvent {
    type: StreamEventType;
    content?: string;
    error?: string;
    metadata?: CompletionMetadata;
}

export interface StreamChunk {
    content: string;
    index: number;
}

export interface StreamDone {
    type: 'done';
    metadata: CompletionMetadata;
}

export interface StreamError {
    type: 'error';
    error: string;
}

export interface StreamMetadata {
    type: 'metadata';
    metadata: CompletionMetadata;
}

// ============================================================================
// Context Types
// ============================================================================

export interface ContextProvider {
    name: string;
    getContext(conversation: Conversation, options?: ContextOptions): Promise<ContextResult>;
}

export interface ContextOptions {
    maxTokens?: number;
    includeSystemPrompt?: boolean;
    trimStrategy?: 'truncate' | 'summarize' | 'sliding-window';
}

export interface ContextResult {
    messages: ChatMessage[];
    tokenCount: number;
    truncated: boolean;
    metadata?: Record<string, unknown>;
}

// ============================================================================
// Prompt Builder Types
// ============================================================================

export interface PromptTemplate {
    systemPrompt?: string;
    userPromptTemplate?: string;
    outputInstructions?: string;
}

export interface PromptContext {
    systemPrompt?: string;
    context: string;
    userMessage: string;
    outputInstructions?: string;
}

// ============================================================================
// Conversation Settings
// ============================================================================

export interface ConversationSettings {
    provider: ProviderType;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    contextProvider?: string;
}

// ============================================================================
// SDK Configuration Types
// ============================================================================

export interface AISDKConfig {
    baseUrl: string;
    timeout?: number;
    headers?: Record<string, string>;
    retryAttempts?: number;
    retryDelay?: number;
}

export interface ChatSDKConfig extends AISDKConfig {
    defaultProvider?: ProviderType;
    defaultModel?: string;
    defaultMaxTokens?: number;
    defaultTemperature?: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AIError {
    code: string;
    message: string;
    provider?: ProviderType;
    statusCode?: number;
    details?: Record<string, unknown>;
}

export type AIErrorCode =
    | 'PROVIDER_ERROR'
    | 'NETWORK_ERROR'
    | 'TIMEOUT'
    | 'INVALID_REQUEST'
    | 'AUTHENTICATION_ERROR'
    | 'RATE_LIMIT_EXCEEDED'
    | 'CONTEXT_TOO_LONG'
    | 'UNKNOWN_ERROR';

// ============================================================================
// Telemetry Types
// ============================================================================

export interface TelemetryEvent {
    type: 'completion' | 'stream' | 'error';
    timestamp: Date;
    provider: ProviderType;
    model: string;
    duration?: number;
    tokenUsage?: TokenUsage;
    error?: AIError;
    metadata?: Record<string, unknown>;
}

// ============================================================================
// Tool Calling Types (Future)
// ============================================================================

export interface Tool {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    handler?: ToolHandler;
}

export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
}

export interface ToolResult {
    toolCallId: string;
    result: unknown;
    error?: string;
}

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

// ============================================================================
// Agent Types (Future)
// ============================================================================

export interface Agent {
    id: string;
    name: string;
    description?: string;
    systemPrompt: string;
    tools?: Tool[];
    maxIterations?: number;
}

export interface AgentStep {
    type: 'thought' | 'action' | 'observation' | 'answer';
    content: string;
    toolCall?: ToolCall;
    toolResult?: ToolResult;
}

// ============================================================================
// Memory Types (Future)
// ============================================================================

export interface Memory {
    id: string;
    conversationId: string;
    content: string;
    embedding?: number[];
    metadata?: Record<string, unknown>;
    createdAt: Date;
}

// ============================================================================
// RAG Types (Future)
// ============================================================================

export interface Document {
    id: string;
    content: string;
    embedding?: number[];
    metadata?: Record<string, unknown>;
}

export interface SearchResult {
    document: Document;
    score: number;
}

export interface RAGConfig {
    maxResults?: number;
    minScore?: number;
    includeMetadata?: boolean;
}