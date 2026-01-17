
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
    const genAI = new GoogleGenerativeAI("AIzaSyC4lLnPBVvZJ7AlyM2om_zivy7HyNzDXnM");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // We can't list models easily with just the SDK wrapper sometimes without admin SDK or REST.
        // But we can try a simple generation to see if it works with different names.

        // Actually the SDK has no listModels method exposed directly in the main class in some versions?
        // Let's rely on standard names.

        console.log("Testing gemini-1.5-flash...");
        const result1 = await model.generateContent("Hello");
        console.log("gemini-1.5-flash worked:", result1.response.text());
    } catch (e) {
        console.log("gemini-1.5-flash failed:", e.message);
    }

    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("Testing gemini-pro...");
        const result2 = await model2.generateContent("Hello");
        console.log("gemini-pro worked:", result2.response.text());
    } catch (e) {
        console.log("gemini-pro failed:", e.message);
    }

    try {
        const model3 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        console.log("Testing gemini-1.0-pro...");
        const result3 = await model3.generateContent("Hello");
        console.log("gemini-1.0-pro worked:", result3.response.text());
    } catch (e) {
        console.log("gemini-1.0-pro failed:", e.message);
    }
}

main();
