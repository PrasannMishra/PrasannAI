import { useState } from 'react';
import { Header } from './components/Header/Header.jsx';
import { PromptForm } from './components/PromptForm/PromptForm.jsx';
import { ResponseSection } from './components/ResponseSection/ResponseSection.jsx';
import { ErrorBox } from './components/ErrorBox/ErrorBox.jsx';
import { LoadingState } from './components/LoadingState/LoadingState.jsx';
import { EmptyState } from './components/EmptyState/EmptyState.jsx';
import { useGenerateResponse } from './hooks/useGenerateResponse.js';
import { DEFAULT_PROVIDER, DEFAULT_MODEL } from './config/providers.js';
import { DEFAULT_SETTINGS } from './config/constants.js';
import './styles/globals.css';

export default function App() {
    // Form state
    const [prompt, setPrompt] = useState('');
    const [provider, setProvider] = useState(DEFAULT_PROVIDER);
    const [model, setModel] = useState(DEFAULT_MODEL);
    const [maxTokens, setMaxTokens] = useState(DEFAULT_SETTINGS.maxTokens);
    const [temperature, setTemperature] = useState(DEFAULT_SETTINGS.temperature);

    // Response state
    const { response, error, loading, responseRef, handleSubmit: generateResponse } = useGenerateResponse();

    /**
     * Handle form submission
     */
    const handleSubmit = (event) => {
        generateResponse(event, {
            prompt,
            provider,
            model,
            maxTokens,
            temperature,
        });
    };

    return (
        <div className="app-container">
            {/* Header */}
            <Header />

            {/* Main Content Grid */}
            <div className="content-grid">
                {/* Left Column: Form */}
                <div className="form-column">
                    <div className="card">
                        <PromptForm
                            prompt={prompt}
                            onPromptChange={setPrompt}
                            provider={provider}
                            onProviderChange={setProvider}
                            model={model}
                            onModelChange={setModel}
                            maxTokens={maxTokens}
                            onMaxTokensChange={setMaxTokens}
                            temperature={temperature}
                            onTemperatureChange={setTemperature}
                            loading={loading}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>

                {/* Right Column: Response */}
                <div className="response-column">
                    {error && <div className="card"><ErrorBox error={error} /></div>}

                    {loading && <div className="card"><LoadingState /></div>}

                    {response && <div className="card"><ResponseSection response={response} responseRef={responseRef} /></div>}

                    {!response && !error && !loading && <div className="card"><EmptyState /></div>}
                </div>
            </div>
        </div>
    );
}
