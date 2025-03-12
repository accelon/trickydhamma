import http from "http";

function getCurrentWeather(location, unit = "fahrenheit") {
  let weather_info = {
    location: location,
    temperature: "unknown",
    unit: unit,
  };

  if (location.toLowerCase().includes("tokyo")) {
    weather_info = { location: "Tokyo", temperature: "10", unit: "celsius" };
  } else if (location.toLowerCase().includes("san francisco")) {
    weather_info = {
      location: "San Francisco",
      temperature: "72",
      unit: "fahrenheit",
    };
  } else if (location.toLowerCase().includes("paris")) {
    weather_info = { location: "Paris", temperature: "22", unit: "fahrenheit" };
  }

  return JSON.stringify(weather_info);
}
async function runConversation() {
  const messages = [
    {
      role: "user",
      content: "What's the weather like in San Francisco, Tokyo, and Paris?",
    },
  ];
  const tools = [
    {
      type: "function",
      function: {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    },
  ];

  const requestData = JSON.stringify({
    model: "qwen7b",
    messages: messages,
    tools: tools,
   // tool_choice: "auto",
  });

  const options = {
    hostname: "127.0.0.1",
    port:"11435",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "sk-no-key-required", // Replace with your OpenAI API key
    },
  };

  const response = await new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(JSON.parse(data));
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(requestData);
    req.end();
  });

  const responseMessage = response.choices[0].message;


  if (responseMessage.tool_calls) {
    const toolCalls = responseMessage.tool_calls;
    const availableFunctions = {
      get_current_weather: getCurrentWeather,
    };
    messages.push(responseMessage);


    const functionResponses = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const functionToCall = availableFunctions[functionName];
        const functionResponse = functionToCall(
          functionArgs.location,
          functionArgs.unit
        );
        return {
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        };
      })
    );

    messages.push(...functionResponses);
console.log(messages);

    const secondRequestData = JSON.stringify({
      model: "qwen7b",
      messages: messages,
    });

    const secondResponse = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(JSON.parse(data));
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(secondRequestData);
      req.end();
    });

    return secondResponse;
  }
}

runConversation()
  .then((response) => {
    const messageContent = response?.choices[0].message.content;
    console.log(messageContent);
  })
  .catch((error) => {
    console.error(error);
  });