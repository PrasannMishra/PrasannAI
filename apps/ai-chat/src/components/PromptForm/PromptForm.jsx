import { PromptInput } from '../PromptInput/PromptInput.jsx';
import { ModelConfig } from '../ModelConfig/ModelConfig.jsx';
import { AdvancedSettings } from '../AdvancedSettings/AdvancedSettings.jsx';
import styles from './PromptForm.module.css';

export function PromptForm({
    prompt,
    onPromptChange,
    provider,
    onProviderChange,
    model,
    onModelChange,
    maxTokens,
    onMaxTokensChange,
    temperature,
    onTemperatureChange,
    loading,
    onSubmit,
}) {
    return (
        <form onSubmit={onSubmit} className={styles.form}>
            {/* Prompt Section */}
            <section className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Prompt</h3>
                <PromptInput value={prompt} onChange={onPromptChange} />
            </section>

            {/* Model Configuration Section */}
            <ModelConfig
                provider={provider}
                model={model}
                onProviderChange={onProviderChange}
                onModelChange={onModelChange}
            />

            {/* Advanced Settings Section */}
            <AdvancedSettings
                maxTokens={maxTokens}
                temperature={temperature}
                onMaxTokensChange={onMaxTokensChange}
                onTemperatureChange={onTemperatureChange}
            />

            {/* Submit Button */}
            <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? (
                    <>
                        <span className={styles.spinner}></span>
                        Generating...
                    </>
                ) : (
                    '✨ Generate Response'
                )}
            </button>
        </form>
    );
}
