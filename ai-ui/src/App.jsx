import { useLayoutEffect, useRef, useState } from 'react';
import { ChatMessages } from './components/ChatMessages/ChatMessages.jsx';
import { ChatComposer } from './components/ChatComposer/ChatComposer.jsx';
import { ConversationList } from './components/ConversationList/ConversationList.jsx';
import { ErrorBox } from './components/ErrorBox/ErrorBox.jsx';
import SettingsDrawer from './components/SettingsDrawer/SettingsDrawer.jsx';
import { useGenerateResponse } from './hooks/useGenerateResponse.js';
import { DEFAULT_PROVIDER, DEFAULT_MODEL } from './config/providers.js';
import { DEFAULT_SETTINGS } from './config/constants.js';
import { FaAngleDoubleRight } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import './styles/globals.css';

export default function App() {
    const [provider, setProvider] = useState(DEFAULT_PROVIDER);
    const [model, setModel] = useState(DEFAULT_MODEL);
    const [maxTokens, setMaxTokens] = useState(DEFAULT_SETTINGS.maxTokens);
    const [temperature, setTemperature] = useState(DEFAULT_SETTINGS.temperature);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const chatContainerRef = useRef(null);

    const {
        conversations,
        activeConversationId,
        messages,
        error,
        loading,
        responseRef,
        handleSubmit,
        stopGeneration,
        continueGeneration,
        selectConversation,
        createConversation,
        clearConversation,
        deleteAllConversations,
        deleteConversation,
    } = useGenerateResponse();

    // Reusable core scroll runner
    const scrollFun = (targetTop) => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: targetTop ?? chatContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    const scrollToTop = () => scrollFun(0);

    // Scalable scroll-to-bottom handling delay queues
    const scrollToBottom = (delays = [0, 1500]) => {
        if (!chatContainerRef.current) return;

        if (delays.length === 0) {
            scrollFun();
            return;
        }

        delays.forEach((delay) => {
            setTimeout(() => scrollFun(), delay);
        });
    };

    const sendMessage = (message) => {
        handleSubmit({
            message,
            provider,
            model,
            maxTokens,
            temperature,
        });
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    // Keep chat pinned to bottom when new messages arrive safely
    useLayoutEffect(() => {
        scrollToBottom([]);
    }, [messages]);

    return (
        <div className="app-wrapper">
            {!sidebarOpen && (
                <div
                    style={{ marginTop: '10px' }}
                    className="sidebar-toggle-tooltip"
                    onClick={() => setSidebarOpen(true)}
                >
                    <FaAngleDoubleRight />
                </div>
            )}

            {sidebarOpen && (
                <aside className="sidebar open">
                    <div className="sidebar-header">
                        <button className="new-chat-btn" onClick={createConversation}>
                            <span>✎</span> New chat
                        </button>
                        <button className="sidebar-toggle" onClick={() => setSidebarOpen(false)}>
                            ☰
                        </button>
                    </div>

                    <nav className="sidebar-nav">
                        <ConversationList
                            conversations={conversations}
                            activeConversationId={activeConversationId}
                            onSelectConversation={selectConversation}
                            onNewConversation={createConversation}
                            onClearConversation={clearConversation}
                            onDeleteAllConversations={deleteAllConversations}
                            onDeleteConversation={deleteConversation}
                        />
                    </nav>

                    <div className="sidebar-footer">
                        <div className="user-profile">
                            <div className="avatar">PM</div>
                            <div className="user-info">
                                <p className="user-name">Prasann Mishra</p>
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            <main className="main-content">
                <header className="main-header">
                    <h1>PrasannAI</h1>
                    <div className="header-actions">
                        <div className="model-indicator">
                            <span className="model-provider">{provider}</span>
                            <span className="model-separator">•</span>
                            <span className="model-name">{model}</span>
                        </div>
                        <button
                            className={`icon-btn ${showSettings ? 'active' : ''}`}
                            onClick={toggleSettings}
                            title="Settings"
                        >
                            <FaGear />
                        </button>
                        <button className="icon-btn" onClick={scrollToTop} title="Scroll to top">
                            ⇧
                        </button>
                    </div>
                </header>

                <div className="chat-container" ref={chatContainerRef}>
                    <ChatMessages messages={messages} loading={loading} onContinue={continueGeneration} />
                    {error && <ErrorBox error={error} />}
                </div>

                <div ref={responseRef} style={{ width: '100%' }}>
                    <ChatComposer
                        onSend={sendMessage}
                        scrollToBottom={scrollToBottom}
                        loading={loading}
                        onStop={stopGeneration}
                        onContinue={continueGeneration}
                        provider={provider}
                        onProviderChange={setProvider}
                        model={model}
                        onModelChange={setModel}
                        maxTokens={maxTokens}
                        onMaxTokensChange={setMaxTokens}
                        temperature={temperature}
                        onTemperatureChange={setTemperature}
                    />
                </div>

                <SettingsDrawer
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    provider={provider}
                    onProviderChange={setProvider}
                    model={model}
                    onModelChange={setModel}
                    maxTokens={maxTokens}
                    onMaxTokensChange={setMaxTokens}
                    temperature={temperature}
                    onTemperatureChange={setTemperature}
                />
            </main>
        </div>
    );
}