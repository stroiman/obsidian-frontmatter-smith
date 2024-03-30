export type ArrayConfigurationOption = {
	$type: "addToArray";
	key: string;
	element: ValueOption;
};

export type StringInput = {
	$value: "stringInput";
	prompt: string;
};

export type ChoiceInput = {
	$value: "choice";
	prompt: string;
	options: {
		text: string;
		value: string;
	}[];
};

export type ObjectInput = {
	$value: "object";
	values: { key: string; value: ValueOption }[];
};

export type ValueOption = ObjectInput | ChoiceInput | StringInput;

export type ConfigurationOption = ArrayConfigurationOption;

export class ForgeConfiguration {
	getOptions(): ConfigurationOption[] {
		return [
			{
				$type: "addToArray",
				key: "medicine",
				element: {
					$value: "object",
					values: [
						{
							key: "type",
							value: {
								$value: "choice",
								prompt: "Choose type",
								options: [
									{
										text: "Aspirin",
										value: "[[Aspirin]]",
									},
									{
										text: "Paracetamol",
										value: "[[Paracetamol]]",
									},
								],
							},
						},
						{
							key: "dose",
							value: { $value: "stringInput", prompt: "Dose" },
						},
						{
							key: "time",
							value: { $value: "stringInput", prompt: "Time" },
						},
					],
				},
			},
		];
	}
}
