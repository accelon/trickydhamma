import {fileURLToPath} from "url";
import path from "path";
import {getLlama, LlamaChatSession, defineChatSessionFunction} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const printprogress=(a)=>{
	process.stdout.write("\rloading model:"+(a*100).toFixed(3)+"%");
}
const llama = await getLlama();
const model = await llama.loadModel({
    modelPath: path.join(__dirname, "models", "qwen2.5-3b-instruct-q6_k.gguf"),
    //modelPath: path.join(__dirname, "models", "qwen2.5-1.5b-instruct-q4_k_m.gguf"), cannot handle function
    //modelPath: path.join(__dirname, "models", "qwen2.5-0.5b-instruct-q8_0.gguf"),cannot handle function
    onLoadProgress:printprogress
});
const context = await model.createContext();
const session = new LlamaChatSession({
    contextSequence: context.getSequence()
});

const fruitPrices= {
    "apple": "$6",
    "banana": "$4",
    "苹果": "$6",
    "蘋果": "$6",
    "香蕉": "$4"    
};

const personBirthDate={
    "阿難":"BC 500.1.1",
    "舍利弗":"BC 520.1.1"
}

const functions = {
    getAge:defineChatSessionFunction({
        description: "Get the Birth Date of a person",
        params: {
            type: "object",
            properties: {
                name: {
                    type: "string"
                }
            }
        },
        async handler(params) {
            console.log('handling person birth function',params)
            const name = params.name.toLowerCase();
            if (Object.keys(personBirthDate).includes(name))
                return {
                    name: name,
                    price: personBirthDate[name]
                };

            return `Unrecognized person "${params.name}"`;
        }
    }),
    getFruitPrice: defineChatSessionFunction({
        description: "Get the price of a fruit",
        params: {
            type: "object",
            properties: {
                name: {
                    type: "string"
                }
            }
        },
        async handler(params) {
            console.log('handling price function',params)
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


const q1 = "蘋果比香蕉貴多少?";
//const q1 = "舍利弗如果活到2025年，是幾歲？";
console.log("User: " + q1);

const a1 = await session.prompt(q1, {functions});
console.log("AI: " + a1);