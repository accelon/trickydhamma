import OpenAI from "openai";

const model="qwen/qwen:7b";
const client = new OpenAI(
    {baseURL:"http://127.0.0.1:11435/v1/",  //llama-server.cmd
    apiKey : "sk-no-key-required"
})
	
	const tools = [
    {
      type: "function",
      function: {
        name: "get_fruit_price",
        description: "Get the price of a fruit",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of a fruit",
            }
          },
          required: ["name"],
        },
      },
    },
  ];

//const question="預測中美貿易戰的結局。";
const question="蘋果 比 香蕉貴多少？";
const response =  await client.chat.completions.create({
  model,
  temparature:0.1,
  //stream:true,
  tools,
  messages:[
    {
      "role": "user",
      "content": question
    }
  ]
})

const respmessage= response.choices[0].message.content.split(/\r?\n/);

const toolcalls=[];
let pushing=true, pushed=[];
for (let i=0;i<respmessage.length;i++){
	
	if (respmessage[i]=="<tool_call>") {
		pushing=true;
	} else if (respmessage[i]=="</tool_call>") {
		pushing=false;
		toolcalls.push(...pushed);
		pushed.length=0;
	} else if (pushing) pushed.push(JSON.parse(respmessage[i]));
};
console.log(toolcalls);



console.log("USER:",question);
let tokencount=0;
let d=new Date();
console.log("AI:");

 /*
let res='';    
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  //process.stdout.write(content);
  res+=content;
  tokencount++;
}

console.log(res);
*/
/*
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
*/
//const elapsed=(new Date()-d)/1000;
//console.log("token/s:", (tokencount/elapsed).toFixed(2));