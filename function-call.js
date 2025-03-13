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
    "蘋果": "$6",
    	"苹果": "$6",
    "香蕉": "$4",
    "mango":"$10",
    "芒果": "$10",
    	"榴槤": "$50",
    	"櫻桃":"$20",
    	"durian": "$50"
};

const get_fruit_price=({name})=>{
	const price=fruitPrices[name]||1;;
	console.log('>>getting price of',name,"=",price);
	return name+"的價格是："+price
	return price;
}
const functions={get_fruit_price};
//const question="預測中美貿易戰的結局。";
//const question="我買了一袋5顆水果，總共花了38元，請問有分別有幾顆蘋果和芒果";
const question="買四顆蘋果的花費，可以買到幾顆芒果？";
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

//console.log(response.choices[0].message);
if (response.choices[0].message.tool_calls){
	const calls=response.choices[0].message.tool_calls;
	for (let i=0;i<calls.length;i++) {
		const name=calls[i].function.name;
		const args=JSON.parse(calls[i].function["arguments"]);
		const content=functions[name].call(this, args);
		//const funcres={role:"tool", tool_call_id: calls[i].id, name, content}
		const funcres={role:"user",content};
		//console.log(funcres);
		messages.push(funcres);
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

