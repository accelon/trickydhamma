import {fileURLToPath} from "url";
import path from "path";
import {getLlama, LlamaChatSession} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const printprogress=(a)=>{
	process.stdout.write("\rloading model:"+(a*100).toFixed(3)+"%");
}
const llama = await getLlama();
const model = await llama.loadModel({
    //modelPath: path.join(__dirname, "models", "Meta-Llama-3.1-8B-Instruct.Q4_K_M.gguf")
    //modelPath: path.join(__dirname, "models", "qwen2.5-0.5b-instruct-q8_0.gguf"),
    //modelPath: path.join(__dirname, "models", "qwen2.5-3b-instruct-q6_k.gguf"),
    modelPath: path.join(__dirname, "models", "qwen2.5-1.5b-instruct-q4_k_m.gguf"),
    onLoadProgress:printprogress
});

const context = await model.createContext();
const sequence = context.getSequence();

const q1 = "佛是人類嗎？回答是或不是";
console.log("User: " + q1);

const tokens = model.tokenize("USER: " + q1 + "\nASSISTANT: ");
const res = [];
for await (const generatedToken of sequence.evaluate(tokens)) {
    res.push(generatedToken);
   
    // It's important to not concatenate the results as strings,
    // as doing so breaks some characters (like some emojis)
    // that consist of multiple tokens.
    // By using an array of tokens, we can decode them correctly together.
    const resString = model.detokenize(res);
   
   
   process.stdout.write( model.detokenize( [generatedToken]) );
   
    const lastPart = resString.split("ASSISTANT:").pop();
    if (lastPart?.includes("USER:"))
        break;
}

//const a1 = model.detokenize(res).split("USER:")[0];
//console.log("AI: " + a1.trim());