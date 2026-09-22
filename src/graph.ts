import { END, START, StateGraph } from "@langchain/langgraph";
import { State } from "./state.ts";
import { model } from "./model.ts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

async function writer(state: typeof State.State) {
    // call llm3
    const SYSTEM_PROMPT = `You are a Linkedin writing assistant for beginner devs 
    (0 - 2 years of experience).    
    Goal: helpful, human, buzzword-free posts.
    
    Style & Format:
    - Conversatuional, authentic, short lines, whitespace friendly and easy to read.
    - 150-250 words, Max 2 relevant emojis.
    - Hook in the first 2 lines. Give 1-2 concrete examples. Clear takeaway.
    - Explain in any jargon with quick analogy or simple example.
    - Avoid controvercy. Keep it simple.Incluve as Simple CTA to follow for a more.
    
    Behavior:
    - If the lates human message contains critique or says "Revise now", treat it as an explicit order to revise the previous draft. Apply all requested changes.
    - Do not ask question or seek confirmation. Output only the post text (no preamble).`
    
    const response = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        ...state.messages
    ]);
    return { messages: [response]};
}

async function critique(state: typeof State.State) {
    // call llm
    const SYSTEM_PROMPT = `You are a tough Linkedin critique assistant for beginner devs
    Priority: remove buzzwords/cliches, keep it clean, specific, and relatable.
    
    Ccheck agaisnt:
    1. Strong hook in 1-2 lines
    2. Beginner-friendly clarity, explain jargon with analogy/example
    3. Specific insights and concrete examples (not generic advice)
    4. Skimmable formatting (short lines, whitespace)
    5. Clear CTA to follow for more
    6. 150-250 words, Max 2 relevant emojis, authentic tone, no controversy.
    
    Output format (no scores, no questions, no meta):
    Start with:
    "Revise now. Apply all changes below. Output only the revised post text."
    
    Then list all changes in bullet points. Fixes that are direct edit instructions( e.g., "Trim intro to 2lines with pain point hook", "Replace 'leverage/impactful' with simple verbs", "And 1 analogy for <term>, "End eith CTA: 'Follow for more bite-sized dev tips'").`;
    
    const response = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        ...state.messages
    ]);
    
    return { messages: [ new HumanMessage(response.content) ], revisions: state.revisions ? state.revisions as number + 1 : 1 };
}

function shouldContinue(state: typeof State.State) {
    // condition logic
    if (state.revisions && (state.revisions as number) >= 5) {
        return END;
    }
    return 'critique';
}

export const graph = new StateGraph(State)
    .addNode("writer", writer)
    .addNode("critique", critique)
    .addEdge(START, "writer")
    .addEdge('critique', 'writer')
    .addConditionalEdges('writer', shouldContinue, {
        [END]: END,
        critique: 'critique'
    });
