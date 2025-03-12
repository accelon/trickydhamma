import OpenAI from "openai";

const model="qwen/qwen:7b";
const client = new OpenAI(
    {baseURL:"http://127.0.0.1:11435/v1/",  //llama-server.cmd
    apiKey : "sk-no-key-required"
})

const question="你好厲害，我怕失業。";
const stream =  await client.chat.completions.create({
  model,
  temparature:0.1,
  stream:true,
  messages:[
    {
      "role": "user",
      "content": question
    }
  ]
})
console.log("USER:",question);
let tokencount=0;
const d=new Date();
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(content);
  tokencount++;
}

const elapsed=(new Date()-d)/1000;
console.log("token/s:", (tokencount/elapsed).toFixed(2));