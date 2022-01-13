import { FieldsAll, FieldsCheckbox, FieldsDropdown } from './streamelements';

// export interface MyFields {
export type MyFields = {
	use_pronouns_extension: FieldsCheckbox;
	localized_name_mode: FieldsDropdown;
};

export const fields: MyFields = {
	use_pronouns_extension: {
		type: 'checkbox',
		label: 'Chat Pronouns Integration',
	},
	localized_name_mode: {
		type: 'dropdown',
		label: 'Localized Display Name Handling',
		options: {
			localized_only: 'just localized name',
			unlocalized_only: 'just unlocalized nane',
			both: 'both',
		},
		value: 'both',
	},
};



