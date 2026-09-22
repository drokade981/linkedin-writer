import { HumanMessage } from "@langchain/core/messages";
import { graph } from "./src/graph.ts";


async function main() {
    const app = graph.compile();

    const result = await app.invoke({
        messages: [new HumanMessage(`Write me a linkedin post for LLM`)]
    });

    console.log(result);
    console.log('Generate post - ', result.messages[result.messages.length - 1].content);
}

main();