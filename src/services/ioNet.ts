const IO_NET_API_KEY = import.meta.env.VITE_IO_NET_API_KEY;

export const processTranscript = async (
  transcript: string,
  model: string,
  id: string | null,
  onStreamChunk?: (chunk: string) => void
): Promise<string | undefined> => {
  if (!navigator.onLine) {
    return "You appear to be offline. Please check your internet connection and try again.";
  }

  try {
    const response = await fetch(
      `https://api.intelligence.io.solutions/api/v1/chat${id !== null ? "s/" + id + "/messages" : "/completions"}`,
      {
        method: "POST",
        headers: {
          accept: "text/event-stream",
          Authorization: `Bearer ${IO_NET_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: transcript,
            },
          ],
          temperature: 0.7,
          format: "text",
          stream: true,
          system:
            "You are a helpful AI assistant. Provide clear, concise, and accurate responses to user questions. Keep responses friendly and conversational, but focused on delivering valuable information.",
        }),
      }
    );

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      console.error("IO.net API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      if (response.status === 401) {
        return "Authentication error. Please check your API key configuration.";
      } else if (response.status === 429) {
        return "Rate limit exceeded. Please try again in a moment.";
      }

      throw new Error(`API request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // Чистим от event-stream метаинформации, если она есть
      const lines = chunk.split("\n").filter(line => line.startsWith("data: "));
      for (const line of lines) {
        const json = line.replace(/^data: /, "").trim();
        if (json === "[DONE]") continue;

        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            if (onStreamChunk) onStreamChunk(content);
          }
        } catch (err) {
          console.warn("Failed to parse stream chunk:", err);
        }
      }
    }

    return fullText || "I apologize, but I couldn't generate a response at the moment. Please try again.";
  } catch (error) {
    console.error("Error processing transcript with io.net:", error);

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return "Unable to connect to the service. Please check your internet connection and try again.";
    }

    return "I apologize, but I'm having trouble connecting to my language processing service. Please try again in a moment.";
  }
};
