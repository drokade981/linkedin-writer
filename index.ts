import { HumanMessage } from "@langchain/core/messages";
import { graph } from "./src/graph.ts";
import readline from "readline/promises";

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const app = graph.compile();

    while(true) {
        const query = await rl.question('What you want me to write about ?: ');;
        if(query === 'exit') {
            break;
        }
        const result = await app.invoke({
            messages: [new HumanMessage(query)]
        });
        
        console.log(result);
        console.log('Generate post - ', result.messages[result.messages.length - 1].content);
    }
    rl.close();
}

main();