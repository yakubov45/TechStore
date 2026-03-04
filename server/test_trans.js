async function test() {
    try {
        console.log("Starting translation test with dynamic import...");
        const translate = (await import('google-translate-api-x')).default;
        const res = await translate("Hello world", { to: 'uz' });
        console.log("Result:", res.text);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
