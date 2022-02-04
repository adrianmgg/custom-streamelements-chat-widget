import { FieldsAll, FieldsCheckbox, FieldsDropdown } from './streamelements';

export type MyFields = {
	use_pronouns_extension: FieldsCheckbox;
	localized_name_mode: FieldsDropdown;
	remove_emote_gap: FieldsCheckbox;
};

export const fields: { [K in keyof MyFields]: NonNullable<MyFields[K]> } = {
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
	remove_emote_gap: {
		type: 'checkbox',
		label: 'remove gap between emotes',
		value: false,
	},
};



