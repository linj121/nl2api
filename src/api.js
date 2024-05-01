import CONFIG from "./config.js";

const API = {
  // units: standard => litre(ml), metric => Celsius(degree), imperial => Fahrenheit(degree)
  async get_current_weather({ location, units = "metric" }) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${CONFIG.OPENWEATHERMAP_API_KEY}&units=${units}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return "Error fetching weather data";
    }
  },
  // Description for triggering OPENAI function calling feature
  tools: [
    {
      type: "function",
      function: {
        name: "get_current_weather",
        description: "Get the current weather in a given geographical location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, California. Always convert to English.",
            },
            unit: { type: "string", enum: ["metric", "imperial"] },
          },
          required: ["location"],
        },
      },
    },
  ],
};

async function test() {
  const res = await API.get_current_weather({ location: "San Francisco, California" });
  console.log(res);
  return res;
}
// test();

export default API;
