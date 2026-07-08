import loadFrontMattersFromContent from "./scripts/content-index-generator.js";

const main = async () => {

    console.log("Starting index generation...");
    await loadFrontMattersFromContent()
        .then(() => console.log("Process complete."))
        .catch(err => console.error("Process aborted:", err));
};

main();