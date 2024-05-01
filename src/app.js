import OpenAI from "openai";
import readline from "node:readline/promises";
import API from "./api.js";
import CONFIG from "./config.js";
import { logger } from "./logger.js";

logger.log("Current selected model: " + CONFIG.OPENAI_MODEL);

const openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });

const messages = [];
const tools = API.tools;

async function prompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const userQuery = await rl.question(">>> ");
  rl.close();
  if (userQuery === "exit") return "exit";
  if (!userQuery) {
    logger.chat("Please enter a valid query");
    return;
  }

  messages.push({ role: "user", content: userQuery });
  logger.log("Current messages: " + JSON.stringify(messages));

  logger.log("Querying OpenAI with the question: " + messages[messages.length - 1].content);
  const first_response = await openai.chat.completions.create({
    model: CONFIG.OPENAI_MODEL,
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });
  logger.log("Response from OpenAI to the current query:");
  logger.log(JSON.stringify(first_response));

  const tool_calls_list = first_response.choices[0].message.tool_calls;
  const isFunctionCallTriggered = Array.isArray(tool_calls_list) && tool_calls_list.length > 0;
  messages.push({
    role: "assistant",
    content: first_response.choices[0].message.content ?? null,
    tool_calls: tool_calls_list,
  });
  if (!isFunctionCallTriggered) {
    logger.chat(first_response.choices[0].message.content);
    return;
  }

  // example_chat_completion_object = {
  //   id: "chatcmpl-9JnAAfyvPiQB654AbWmYLOijEmUG4",
  //   object: "chat.completion",
  //   created: 1714504242,
  //   model: "gpt-4-turbo-2024-04-09",
  //   choices: [
  //     {
  //       index: 0,
  //       message: {
  //         role: "assistant",
  //         content: null,
  //         tool_calls: [
  //           {
  //             id: "call_X76D7Kxzyy4PLda3yVP53baL",
  //             type: "function",
  //             function: { name: "get_current_weather", arguments: '{"location":"Shantou"}' },
  //           },
  //         ],
  //       },
  //       logprobs: null,
  //       finish_reason: "tool_calls",
  //     },
  //   ],
  //   usage: { prompt_tokens: 85, completion_tokens: 17, total_tokens: 102 },
  //   system_fingerprint: "fp_ea6eb70039",
  // };
  logger.chat("I'm querying the relavant information for you, might take a few seconds...");
  for (const tool_call of tool_calls_list) {
    const function_to_call = tool_call.function.name;
    const function_call_arguments = JSON.parse(tool_call.function.arguments);
    logger.log("Calling function: " + function_to_call + " with arguments: " + JSON.stringify(function_call_arguments));
    // call function dynamically by its name(string)
    const function_call_result = await API[function_to_call](function_call_arguments);
    logger.log("Function call result: " + JSON.stringify(function_call_result));
    messages.push({
      role: "tool",
      content: JSON.stringify(function_call_result),
      tool_call_id: tool_call.id,
    });
    logger.log("Current messages: " + JSON.stringify(messages));
  }
  logger.log("Querying OpenAI to enrich the final answer...");
  const final_response = await openai.chat.completions.create({
    model: CONFIG.OPENAI_MODEL,
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });
  messages.push({
    role: "assistant",
    content: final_response.choices[0].message.content,
  });
  logger.log("Enriched repsonse from OpenAI:");
  logger.log(JSON.stringify(final_response));
  logger.chat(final_response.choices[0].message.content);
}

async function main() {
  logger.chat("Hi there, I'm your gpt assistant! You can ask me anything and I'll do my best to help you.");
  logger.chat("For function call, ask me about the weather in any city (eg. What's the weather like in Sydney? / 悉尼今天天气怎么样)");
  logger.chat("Type 'exit' to quit");
  while (true) {
    const result = await prompt();
    if (result && result.trim() === "exit") {
      logger.chat("Goodbye!");
      break;
    }
  }
}

main();
