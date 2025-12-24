// Альтернативная реализация с использованием LangChain
// Раскомментируйте этот файл если хотите использовать LangChain

/*
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { RetrievalQAChain } from 'langchain/chains'
import { getAllKnowledge } from './rag'

let vectorStore: MemoryVectorStore | null = null

// Инициализация векторного хранилища
async function initVectorStore() {
  if (vectorStore) return vectorStore

  const docs = getAllKnowledge()
  const texts = docs.map((doc) => `${doc.title}\n\n${doc.content}`)
  const metadatas = docs.map((doc) => ({ id: doc.id, category: doc.category }))

  vectorStore = await MemoryVectorStore.fromTexts(
    texts,
    metadatas,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })
  )

  return vectorStore
}

// RAG цепочка с LangChain
export async function langchainRAG(query: string): Promise<string> {
  const store = await initVectorStore()
  
  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
  })

  const chain = RetrievalQAChain.fromLLM(model, store.asRetriever())
  
  const response = await chain.call({
    query,
  })

  return response.text
}
*/
