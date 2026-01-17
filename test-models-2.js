
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel(name) {
    console.log(`\n--- Testing ${name} ---`);
    const genAI = new GoogleGenerativeAI("AIzaSyC4lLnPBVvZJ7AlyM2om_zivy7HyNzDXnM");
    try {
        const model = genAI.getGenerativeModel({ model: name });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`SUCCESS: ${name}`);
        return true;
    } catch (e) {
        console.log(`FAILED: ${name}`);
        console.log(`Error: ${e.message}`);
        return false;
    }
}

async function main() {
    const models = [
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-2.0-flash-exp", // Just a guess based on 2026 date
        "gemini-2.0-pro-exp"
    ];

    for (const m of models) {
        await testModel(m);
    }
}

main();
