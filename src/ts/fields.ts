import { FieldsAll, FieldsCheckbox, FieldsDropdown, FieldsNumber } from './streamelements';

export type MyFields = {
	history_size: FieldsNumber;
	use_pronouns_extension: FieldsCheckbox;
	localized_name_mode: FieldsDropdown;
	remove_emote_gap: FieldsCheckbox;
	use_twemoji: FieldsCheckbox;
};

export const fields: { [K in keyof MyFields]: NonNullable<MyFields[K]> } = {
	history_size: {
		type: 'number',
		min: 0,
		max: 512,  // TODO arbitrary max, what would a good choice be?
		step: 1,
		label: 'how many messages back to remember',
		value: 128,
	},
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
	use_twemoji: {
		type: 'checkbox',
		label: 'use twemoji for emojis',
		value: false,
	},
};



