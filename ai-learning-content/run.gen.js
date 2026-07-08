import loadFrontMattersFromContent from './scripts/content-index-generator.js';

console.log("🚀 Initializing content-index extraction script...");
loadFrontMattersFromContent()
    .then(() => console.log("✅ Execution routine successfully complete."))
    .catch(err => console.error("❌ Process fatally aborted:", err));
