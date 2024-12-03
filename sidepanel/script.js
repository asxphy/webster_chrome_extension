(async () => {
    const errorMessage = document.getElementById("error-message");
    const costSpan = document.getElementById("cost");
    const submitButton = document.getElementById("submit-button");
    const promptArea = document.getElementById("prompt-area");
    const problematicArea = document.getElementById("problematic-area");
    const promptInput = document.getElementById("prompt-input");
    const responseArea = document.getElementById("response-area");
    const resetButton = document.getElementById("reset-button");

    responseArea.style.display = "none";

    let session = null;

    if (!self.ai || !self.ai.languageModel) {
        errorMessage.style.display = "block";
        errorMessage.innerHTML = `Your browser doesn't support the Prompt API. If you're on Chrome, join the <a href="https://developer.chrome.com/docs/ai/built-in#get_an_early_preview">Early Preview Program</a> to enable it.`;
        return;
    }

    promptArea.style.display = "block";

    const promptModel = async (highlight = false) => {
        console.log("asdkflajsdf lk ");
        const prompt = promptInput.value.trim();
        console.log(prompt);
        if (!prompt) return;
        responseArea.style.display = "block";
        const heading = document.createElement("h3");
        heading.classList.add("prompt", "speech-bubble");
        heading.textContent = prompt;
        responseArea.append(heading);
        const p = document.createElement("p");
        p.classList.add("response", "speech-bubble");
        p.textContent = "Generating response...";
        responseArea.append(p);

        let fullResponse = "";

        try {
            if (!session) {
                await updateSession();
            }
            const stream = await session.promptStreaming(prompt);

            for await (const chunk of stream) {
                fullResponse = chunk.trim();
                p.innerHTML = fullResponse;
            }
        } catch (error) {
            p.textContent = `Error: ${error.message}`;
        }
    };

    const params = new URLSearchParams(location.search);
    const urlPrompt = params.get("prompt");
    const highlight = params.get("highlight");
    if (urlPrompt) {
        promptInput.value = decodeURIComponent(urlPrompt).trim();
        await promptModel(highlight);
    }

    submitButton.addEventListener("click", async (e) => {
        e.preventDefault();
        await promptModel();
    });

    promptInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            await promptModel();
        }
    });

    promptInput.addEventListener("focus", () => {
        promptInput.select();
    });

    const resetUI = () => {
        responseArea.style.display = "none";
        responseArea.innerHTML = "";
        promptInput.focus();
    };

    resetButton.addEventListener("click", () => {
        promptInput.value = "";
        resetUI();
        session.destroy();
        session = null;
        updateSession();
    });

    const updateSession = async () => {
        session = await self.ai.languageModel.create();
        resetUI();
    };
})();
