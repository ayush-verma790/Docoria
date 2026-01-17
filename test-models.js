
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel(name) {
    console.log(`\n--- Testing ${name} ---`);
    const genAI = new GoogleGenerativeAI("AIzaSyC4lLnPBVvZJ7AlyM2om_zivy7HyNzDXnM");
    try {
        const model = genAI.getGenerativeModel({ model: name });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log(`SUCCESS: ${name}`);
        console.log(`Response: ${response.text()}`);
        return true;
    } catch (e) {
        console.log(`FAILED: ${name}`);
        console.log(`Error: ${e.message}`);
        return false;
    }
}

async function main() {
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-latest"
    ];

    for (const m of models) {
        const success = await testModel(m);
        if (success) {
            console.log(`\n!!! FOUND WORKING MODEL: ${m} !!!`);
            // exit early if we just want one
            // break; 
        }
    }
}

main();
