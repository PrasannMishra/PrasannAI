import styles from './SettingsDrawer.module.css';
import ChatSettings from '../ChatComposer/ChatSettings';

export default function SettingsDrawer({ isOpen, onClose, provider, onProviderChange, model, onModelChange, maxTokens, onMaxTokensChange, temperature, onTemperatureChange }) {
    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={onClose} />}
            <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>Settings</h2>
                    <button className={styles.closeButton} onClick={onClose} title="Close settings">
                        ✕
                    </button>
                </div>
                <div className={styles.drawerContent}>
                    <ChatSettings
                        onSend={() => { }}
                        loading={false}
                        provider={provider}
                        onProviderChange={onProviderChange}
                        model={model}
                        onModelChange={onModelChange}
                        maxTokens={maxTokens}
                        onMaxTokensChange={onMaxTokensChange}
                        temperature={temperature}
                        onTemperatureChange={onTemperatureChange}
                    />
                </div>
            </div>
        </>
    );
}