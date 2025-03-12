import {fileURLToPath} from "url";
import path from "path";
import {getLlama, LlamaChatSession, defineChatSessionFunction} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const printprogress=(a)=>{
	process.stdout.write("\r載入大模型:"+(a*100).toFixed(3)+"%");
}
const llama = await getLlama();

const model = await llama.loadModel({
    modelPath: path.join(__dirname, "models/qwen/Qwen2.5-3B-Instruct-Q6_K", "Qwen2.5-3B-Instruct-Q6_K.gguf"),
    //modelPath: path.join(__dirname, "models/qwen/Qwen2.5-7B-Instruct-Q5_K_S", "Qwen2.5-7B-Instruct-Q5_K_S.gguf"), 
    //modelPath: path.join(__dirname, "models/lmstudio-community/gemma-2-2b-it-GGUF", "gemma-2-2b-it-Q4_K_M.gguf"),
//    modelPath: path.join(__dirname, "models/qwen/QwQ1.5B", "model.gguf"), 
    onLoadProgress:printprogress
});


const context = await model.createContext();
const session = new LlamaChatSession({
    contextSequence: context.getSequence()
});

const fruitPrices= {
    //"apple": "$6",
    //"banana": "$4",
    "蘋果": "$6",
    "香蕉": "$4",
    //"mango":"$10",
    "芒果": "$10",
    	"榴槤": "$50",
    	"櫻桃":"$20"
    //	"durian": "$50"
};

const functions = {
   getFruitList:defineChatSessionFunction({
   	   description:"取得水果清單",
    	  params:{
    	   type:"object",
    	   properties:{
    	   },
    	},
    	async handler(params){
    		console.log('水果清單');
    		return {names:Object.keys(fruitPrices)};
    	}
   }),
    getFruitPrice: defineChatSessionFunction({
        description: "取得水果的價格",//Get the price of a fruit",
        params: {
            type: "object",
            properties: {
                name: {
                    type: "string"
                }
            }
        },
        async handler(params) {
            console.log(params,"價格？")
            const name = params.name.toLowerCase();
            if (Object.keys(fruitPrices).includes(name))
                return {
                    name: name,
                    price: fruitPrices[name]
                };

            return `Unrecognized fruit "${params.name}"`;
        }
    })
};


//const q1 = "蘋果比香蕉貴多少?";
//const q1 = "舍利弗如果活到2025年，是幾歲？";
//const q1='蘋果比香蕉貴多少？'
const q1="請列出有那些水果，其中最貴的是？最便宜的是？平均的單價是？";
	//"請用中文回答: 買20個 蘋果 的錢，可以買到幾條 香蕉？"

console.log("\r\n提問: " + q1);

const    onTextChunk=(chunk)=> {
        process.stdout.write(chunk);
    }
const a1 = await session.prompt(q1, {functions,onTextChunk});
//console.log("AI: " + a1);