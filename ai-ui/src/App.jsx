import { useRef, useState } from 'react';
import { ChatMessages } from './components/ChatMessages/ChatMessages.jsx';
import { ChatComposer } from './components/ChatComposer/ChatComposer.jsx';
import { ConversationList } from './components/ConversationList/ConversationList.jsx';
import { ErrorBox } from './components/ErrorBox/ErrorBox.jsx';
import { LoadingState } from './components/LoadingState/LoadingState.jsx';
import { useGenerateResponse } from './hooks/useGenerateResponse.js';
import { DEFAULT_PROVIDER, DEFAULT_MODEL } from './config/providers.js';
import { DEFAULT_SETTINGS } from './config/constants.js';
import { FaAngleDoubleRight } from "react-icons/fa";
import './styles/globals.css';

export default function App() {
    const [provider, setProvider] = useState(DEFAULT_PROVIDER);
    const [model, setModel] = useState(DEFAULT_MODEL);
    const [maxTokens, setMaxTokens] = useState(DEFAULT_SETTINGS.maxTokens);
    const [temperature, setTemperature] = useState(DEFAULT_SETTINGS.temperature);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    // 1. Create a ref for the scrollable container
    const chatContainerRef = useRef(null);

    const {
        conversations,
        activeConversationId,
        messages,
        error,
        loading,
        responseRef,
        handleSubmit,
        selectConversation,
        createConversation,
        clearConversation,
        deleteAllConversations,
        deleteConversation,
    } = useGenerateResponse();

    // 2. Define the scroll function
    const scrollToTop = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth', // Smooth scrolling animation
            });
        }
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            setTimeout(() => {
                chatContainerRef.current.scrollTo({
                    top: chatContainerRef.current.scrollHeight + 20,
                    behavior: 'smooth',
                });
            }, 1500); // 0ms delay is enough to let the DOM update
        }
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

    return (
        <div className="app-wrapper">
            {!sidebarOpen && <div style={{ marginTop: '10px' }} className="sidebar-toggle-tooltip" onClick={() => setSidebarOpen(!sidebarOpen)}><FaAngleDoubleRight /></div>}
            {sidebarOpen && <aside className="sidebar open">
                <div className="sidebar-header">
                    <button className="new-chat-btn" onClick={createConversation}>
                        <span>✎</span> New chat
                    </button>
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
            </aside>}
            <main className="main-content">
                <header className="main-header">
                    <h1>PrasannAI</h1>
                    <div className="header-actions">
                        <button className="icon-btn" onClick={scrollToTop}>⇧</button>
                        <button className="icon-btn">⋯</button>
                    </div>
                </header>

                <div className="chat-container" ref={chatContainerRef}>
                    <ChatMessages messages={messages} loading={loading} />
                    {error && <ErrorBox error={error} />}
                </div>
                <div ref={responseRef} style={{ width: '100%' }}>
                    <ChatComposer
                        onSend={sendMessage}
                        scrollToBottom={scrollToBottom}
                        loading={loading}
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
            </main>
        </div>
    );
}
