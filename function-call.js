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
const fruitPrices= {
    "apple": "$6",
    "banana": "$4",
    "蘋果": "6",
    "香蕉": "4",
    //"mango":"$10",
    "芒果": "10",
    	"榴槤": "50",
    	"櫻桃":"20"
    //	"durian": "$50"
};

const get_fruit_price=({name})=>{
	console.log('>>getting price of',name);
	return name+"的價格是："+fruitPrices[name]||1;
}
const functions={get_fruit_price};
//const question="預測中美貿易戰的結局。";
const question="買10個蘋果的錢，可以買到幾條香蕉？";
const messages=[
    {
      "role": "user",
      "content": question
    }
  ]
const response =  await client.chat.completions.create({
  model,
  temparature:0.1,
  //stream:true,
  tools,
  messages
})

console.log("USER:",question);

 
if (response.choices[0].message.tool_calls){
	const calls=response.choices[0].message.tool_calls;
	for (let i=0;i<calls.length;i++) {
		const name=calls[i].function.name;
		const args=JSON.parse(calls[i].function["arguments"]);
		const content=functions[name].call(this, args);
		messages.push({role:"user", content});
	}
	
	const stream =  await client.chat.completions.create({
	  model,
	  temparature:0.1,
	  stream:true,
	  messages
	})
		  
			  
	let tokencount=0;
	let d=new Date();
	console.log("AI:");

	for await (const chunk of stream) {
	  const content = chunk.choices[0]?.delta?.content || '';
	  process.stdout.write(content);
	  tokencount++;
	}


	const elapsed=(new Date()-d)/1000;
	console.log("token/s:", (tokencount/elapsed).toFixed(2));
	  
} else {
	console.log("AI:",response.choices[0].message);
}

