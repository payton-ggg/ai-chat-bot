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
				<option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
				<option value="gpt-4">GPT-4</option>
				<option value="gpt-4-turbo">GPT-4 Turbo</option>
			</select>
		</div>
	);
};

export default ChooseModel;
