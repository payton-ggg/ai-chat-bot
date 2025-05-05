import { useModelStore } from "../services/store";

const ChooseModel = () => {
  const { model, setModel } = useModelStore();

  return (
    <div className="flex items-center space-x-4">
      <label htmlFor="model" className="text-gray-700">
        Choose Model:
      </label>
      <select
        id="model"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="border border-gray-300 rounded-md p-2"
      >
        <option value="meta-llama/Llama-3.3-70B-Instruct">
          meta-llama/Llama-3.3-70B-Instruct
        </option>
        <option value="meta-llama/Llama-3.2-90B-Vision-Instruct">
          meta-llama/Llama-3.2-90B-Vision-Instruct
        </option>
        <option value="deepseek-ai/DeepSeek-R1-Distill-Llama-70B">
          deepseek-ai/DeepSeek-R1-Distill-Llama-70B
        </option>
        <option value="databricks/dbrx-instruct">
          databricks/dbrx-instruct
        </option>
        <option value="google/gemma-3-27b-it">google/gemma-3-27b-it</option>
        <option value="mistralai/Mistral-Large-Instruct-2411">
          mistralai/Mistral-Large-Instruct-2411
        </option>
        <option value="CohereForAI/aya-expanse-32b">
          CohereForAI/aya-expanse-32b
        </option>
        <option value="Qwen/QwQ-32B">Qwen/QwQ-32B</option>
        <option value="Qwen/Qwen2.5-Coder-32B-Instruct">
          Qwen/Qwen2.5-Coder-32B-Instruct
        </option>
        <option value="microsoft/phi-4">microsoft/phi-4</option>
      </select>
    </div>
  );
};

export default ChooseModel;
