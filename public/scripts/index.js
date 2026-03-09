document.addEventListener("DOMContentLoaded", function () {
    const sendBtnEl = document.getElementById("sendBtn");
    const userInputEl = document.getElementById("userInput");
    const modelSelectEL = document.getElementById("model-select");
    const aiContainerEl = document.getElementById("aiContainer");
  
    sendBtnEl.addEventListener("click", async () => {
      const userPrompt = userInputEl.value.trim();
      if (!userPrompt) return;
      const userEl = document.createElement("div");
      userEl.classList.add("usr-msg", "msg");
      userEl.textContent = userPrompt;
      aiContainerEl.appendChild(userEl);
      userInputEl.value = "";
  
      try {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: modelSelectEL.value, userPrompt }),
        });
  
        if (!response.ok) {
          console.error("Response error:", response.status);
          return;
        }
  
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
  
        let assistantAnswer = "";
        let aiEl = null;
  
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
  
          const chunk = decoder.decode(value, { stream: true });
  
          chunk.split("\n").forEach(line => {
            if (!line.startsWith("data:")) return;
  
            const data = line.replace("data: ", "");
            if (data === "[DONE]") return;
  
            try {
              const parsed = JSON.parse(data);
              assistantAnswer += parsed.content;
  
              if (!aiEl) {
                aiEl = document.createElement("div");
                aiEl.classList.add("assistant-msg", "msg");
                aiContainerEl.appendChild(aiEl);
              }
  
              aiEl.innerHTML = DOMPurify.sanitize(marked.parse(assistantAnswer));
            } catch (err) {
              console.error("Chunk parse error:", err);
            }
          });
        }
      } catch (error) {
        console.error("Fetch error:", error.message);
      }
    });
  });
  