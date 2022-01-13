

// https://github.com/StreamElements/widgets/blob/master/CustomCode.md#custom-widget

export interface SEChatMessageEventDetail {
    event: {
        data: { // TODO incomplete
            badges: {
                description: undefined | string, // TODO - find an example of this being set
                type: string,
                url: string,
                version: string,
            }[],
            /** username of streamer whose chat this was sent to */
            channel: string,  // TODO is this allways lowercase or do they use the captitalization if people have set it?
            /** either a "#RRGGBB" color, or an empty string if the user hasn't set a color */
            displayColor: string,
            /**
            display name of the user that sent this message.
            will be the user's localized display name if the user has set one (see https://blog.twitch.tv/en/2016/08/22/localized-display-names-e00ee8d3250a/).
            otherwise, will be the user's normal username with the custom capitalization the user has set.  (TODO - pretty sure of the capitalization part, but should double check it)
            */
            displayName: string,
            /** emotes in the message */
            emotes: {
                /** start index of emote in message (inclusive) */
                start: number,
                /** end index of emote in message (exclusive) */
                end: number,
                id: string,
                type: 'twitch' | 'bttv' | 'ffz', // TODO get a more complete list of these
                urls: { // TODO is it always like this?
                    1: string,
                    2: string,
                    4: string,
                },
            }[],
            /** whether this message is a /me command */
            isAction: boolean,
            msgId: string,
            /**
            display name of the user that sent this message.
            will be the user's non-localized name, in all lowercase. (TODO - pretty sure about the capitalization part, but should double check it)
            */
            nick: string,
            tags: {
                'badge-info': string,
                badges: string,
                'client-nonce': string,
                color: string,
                'display-name': string,
                emotes: string,
                'first-msg': string,
                flags: string,
                id: string,
                mod: string,
                'room-id': string,
                subscriber: string,
                'tmi-sent-ts': string,
                turbo: string,
                'user-id': string,
                'user-type': string,
            },
            /** message text, without any parsing */
            text: string,
            time: number, // TODO unit?
            userId: string,
        },
        /** pre-generated html with img tags for emotes */
        renderedText: string,
        service: 'twitch',  // at least that's the only one i'm implementing this for so far
    },
};

export type SEEventListenerDetailTypeMap = {
    // "New Follower"
    'follower-latest': {},  // TODO
    // "New Subscriber"
    'subscriber-latest': {},  // TODO
    // "New host"
    'host-latest': {},  // TODO
    // "New cheer"
    'cheer-latest': {},  // TODO
    // "New tip"
    'tip-latest': {},  // TODO
    // "New raid"
    'raid-latest': {},  // TODO
    // "New chat message received"
    'message': SEChatMessageEventDetail,  // TODO
    // "Chat message removed"
    'delete-message': {},  // TODO
    // "Chat messages by userId removed"
    'delete-messages': {},  // TODO
    // "User clicked "skip alert" button in activity feed"
    'event:skip': {},  // TODO
    // "Update of bot counter"
    'bot:counter': {},  // TODO
    // "Update of SE_API store value."
    'kvstore:update': {},  // TODO
    // "User clicked custom field button in widget properties"
    'widget-button': {},  // TODO
};

export interface SEEvent<Subtype extends keyof SEEventListenerDetailTypeMap = keyof SEEventListenerDetailTypeMap> extends CustomEvent {
    detail: {
        listener: Subtype,
        event: SEEventListenerDetailTypeMap[Subtype],
    },
};


type SEWidgetLoadEventData_RecentCommon = {
    /** username */
    name: string,
    /** timestamp (ISO 8601) */
    createdAt: string,
    /**
    " unique ID for example 'object:5024' "
    NOTE: not sure if this one is actually there (at least for follower events), but the docs say it should be there
    */
    $hashKey: string,
    /** event type */
    type: string,
};

// generated from https://github.com/StreamElements/widgets/blob/master/CustomCode.md#possible-keys-within-data
//  , then further modified manually
// the bodged-together code i wrote to generate these - https://gist.github.com/adrianmgg/d531761d666122062a9bad54bb8ff237



export interface SEWidgetLoadEventDataCommon {
    "merch-goal-items": {
        /** Merch items goal progress */
        amount: number,
    },
    "merch-goal-orders": {
        /** Merch orders goal progress */
        amount: number,
    },
    "merch-goal-total": {
        /** Merch total goal progress */
        amount: number,
    },
    /** latest merch event (my guess, this one isn't documented) */
    "merch-latest": {
        amount: number,
        items: unknown[],
        name: string,
    },
    /** latest Tip event */
    "tip-latest": {
        /** Latest tipper username */
        name: string,
        /** Latest tip amount */
        amount: number,
        /** Latest tip message */
        message: string,
    },
    /** top tip since session start */
    "tip-session-top-donation": {
        /** Username */
        name: string,
        /** Tip amount */
        amount: number,
    },
    /** top tip in past week */
    "tip-weekly-top-donation": {
        /** Username */
        name: string,
        /** Tip amount */
        amount: number,
    },
    /** top tip in past month */
    "tip-monthly-top-donation": {
        /** Tip amount */
        name: string,
        /** Username */
        amount: number,
    },
    /** top tip all time */
    "tip-alltime-top-donation": {
        /** Username */
        name: string,
        /** Tip amount */
        amount: number,
    },
    /** top tipper since session start */
    "tip-session-top-donator": {
        /** Username */
        name: string,
        /** Sum of the tip amounts */
        amount: number,
    },
    /** top tip in past week */
    "tip-weekly-top-donator": {
        /** Username */
        name: string,
        /** Sum of the tip amounts */
        amount: number,
    },
    /** top tip in past month */
    "tip-monthly-top-donator": {
        /** Tipper username */
        name: string,
        /** Sum of the tip amounts */
        amount: number,
    },
    /** top tip all time */
    "tip-alltime-top-donator": {
        /** Tipper username */
        name: string,
        /** Sum of the tip amounts */
        amount: number,
    },
    "tip-session": {
        /** Sum of all donations since session start */
        amount: number,
    },
    "tip-week": {
        /** Sum of all donations this week */
        amount: number,
    },
    "tip-month": {
        /** Sum of all donations this month */
        amount: number,
    },
    "tip-total": {
        /** Sum of all donations this all time */
        amount: number,
    },
    "tip-count": {
        /** Number of tip events */
        count: number,
    },
    "tip-goal": {
        /** Donation goal */
        amount: number,
    },
    "tip-recent": (SEWidgetLoadEventData_RecentCommon & {
        /** amount of tip */
        amount: number,
    })[],
};

export interface SEWidgetLoadEventDataTwitch extends SEWidgetLoadEventDataCommon {
    "follower-latest": {
        /** Name of latest follower */
        name: string,
    },
    "follower-session": {
        /** Followers since session start */
        count: number,
    },
    "follower-week": {
        /** Followers this week */
        count: number,
    },
    "follower-month": {
        /** Followers this month */
        count: number,
    },
    "follower-goal": {
        /** Followers goal */
        amount: number,
    },
    "follower-total": {
        /** Total count of followers */
        count: number,
    },
    "follower-recent": {
        /** follower name */
        name: string,
        /** date of follow, in ISO 8601 format */
        createdAt: string,
    }[],
    "subscriber-alltime-gifter": {
        /** Name of latest gifter */
        name: string,
        /** Number of gifted subs */
        amount: number,
    },
    "subscriber-gifted-latest": {
        /** Name of latest gifter */
        name: string,
        /** Number of gifted subs */
        amount: number,
    },
    "subscriber-gifted-session": {
        /** Number of gifted subs during session */
        count: number,
    },
    "subscriber-latest": {
        /** Name of latest sub */
        name: string,
        /** Duration in months */
        amount: number,
        /** Tier of sub (1-3) */
        tier: unknown,
        /** Message attached to sub action */
        message: string,
        /** If it was a gift, here’s a gifter */
        sender: unknown,
        /** If it was a gift, here’s a gifted */
        gifted: unknown,
    },
    "subscriber-new-latest": {
        /** Name of latest new sub */
        name: string,
        /** Number of months (1) */
        amount: number,
        /** user message */
        message: string,
    },
    "subscriber-new-session": {
        /** Number of new subs during session */
        count: number,
    },
    "subscriber-resub-latest": {
        /** Name of latest resub */
        name: string,
        /** Number of months */
        amount: number,
        /** user message */
        message: string,
    },
    "subscriber-resub-session": {
        /** Number of resubs during session */
        count: number,
    },
    "subscriber-session": {
        /** Subscribers since session start */
        count: number,
    },
    "subscriber-week": {
        /** Subscribers this week */
        count: number,
    },
    "subscriber-month": {
        /** Subscribers this month */
        count: number,
    },
    "subscriber-goal": {
        /** Subscribers goal */
        amount: number,
    },
    "subscriber-total": {
        /** Total count of subscribers */
        count: number,
    },
    "subscriber-points": {
        /** Subscriber points */
        amount: number,
    },
    "subscriber-recent": (SEWidgetLoadEventData_RecentCommon & {
        /** Subscriber tier (1000,2000,3000) */
        tier: number,
        /** amount of months */
        amount: number,
    })[],
    "host-latest": {
        /** Latest host */
        name: string,
        /** Number of viewers in latest host (can be 0) */
        amount: number,
    },
    "host-recent": (SEWidgetLoadEventData_RecentCommon & {
        /** amount of viewers **/
        amount: number,
    })[],
    "raid-latest": {
        /** Name of latest raider */
        name: string,
        /** Number of viewers in latest raid */
        amount: number,
    },
    "raid-recent": (SEWidgetLoadEventData_RecentCommon & {
        // TODO - docs seem to be copy-pasted from the wrong place here, what are they actually
    })[],
    "cheer-session": {
        /** Cheers since session start */
        amount: number,
    },
    "cheer-month": {
        /** Cheers this month */
        amount: number,
    },
    "cheer-total": {
        /** Total amount of cheers */
        amount: number,
    },
    "cheer-count": {
        /** Number of cheer events */
        count: number,
    },
    "cheer-goal": {
        /** Cheer goal */
        amount: number,
    },
    /** latest Cheer event */
    "cheer-latest": {
        /** Latest cheerer */
        name: string,
        /** Latest cheer amount */
        amount: number,
        /** Latest cheer message */
        message: string,
    },
    /** top cheerer since session start */
    "cheer-session-top-donation": {
        /** Username */
        name: string,
        /** Cheer amount */
        amount: number,
    },
    /** top cheer in past week */
    "cheer-weekly-top-donation": {
        /** Username */
        name: string,
        /** Cheer amount */
        amount: number,
    },
    /** top cheer in past month */
    "cheer-monthly-top-donation": {
        /** Username */
        name: string,
        /** Cheer amount */
        amount: number,
    },
    /** top cheer all time */
    "cheer-alltime-top-donation": {
        /** Username */
        name: string,
        /** Cheer amount */
        amount: number,
    },
    /** top cheerer since session start */
    "cheer-session-top-donator": {
        /** Username */
        name: string,
        /** Sum of the cheer amounts */
        amount: number,
    },
    /** top cheerer in past week */
    "cheer-weekly-top-donator": {
        /** Username */
        name: string,
        /** Sum of the cheer amounts */
        amount: number,
    },
    /** top cheerer in past month */
    "cheer-monthly-top-donator": {
        /** Username */
        name: string,
        /** Sum of the cheer amounts */
        amount: number,
    },
    /** top cheer all time */
    "cheer-alltime-top-donator": {
        /** Username */
        name: string,
        /** Sum of the cheer amounts */
        amount: number,
    },
    "cheer-week": {
        /** not sure if this one is # of cheers or sum of cheers, it isn't publicly documented */
        amount: number,
    },
    "cheer-recent": (SEWidgetLoadEventData_RecentCommon & {
        /** amount of bits */
        amount: number,
    })[],
};

export interface SEWidgetLoadEvent<FieldData extends Record<string, unknown> = Record<string, unknown>> extends CustomEvent {
    detail: {
        session: {
            data: SEWidgetLoadEventDataTwitch,
        },
        recents: unknown,
        currency: unknown,
        channel: {
            username: string,
            apiToken: string,
        },
        fieldData: FieldData,
    },
};



export interface FieldsBase {
    type: string;
    label: string;
    value?: unknown;
}
export interface FieldsText extends FieldsBase{
    type: 'text';
    value?: string;
}
export interface FieldsCheckbox extends FieldsBase {
    type: 'checkbox';
    value?: boolean;
}
export interface FieldsColorpicker extends FieldsBase {
    type: 'colorpicker';
    value?: string;
}
export interface FieldsNumber extends FieldsBase {
    type: 'number';
    value?: number;
    min: number;
    max: number;
    step: number;
}
export interface FieldsSlider extends FieldsBase {
    type: 'slider';
    value?: number;
    min: number;
    max: number;
    step?: number;
}
export interface FieldsDropdown extends FieldsBase {
    type: 'dropdown';
    value?: string;
    options: Record<string, string>;
}
export interface FieldsImage extends FieldsBase {
    type: 'image-input';
    value?: string;
}
export interface FieldsVideo extends FieldsBase {
    type: 'video-input';
    value?: string;
}
export interface FieldsSound extends FieldsBase {
    type: 'sound-input';
    value?: string;
}
export interface FieldsGooglefont extends FieldsBase {
    type: 'googleFont';
    value?: string;
}
export interface FieldsButton extends FieldsBase {
    type: 'button';
    value?: string;
}
export interface FieldsHidden extends FieldsBase {
    type: 'hidden';
    value?: string;
}

export type FieldsAll = FieldsText | FieldsCheckbox | FieldsColorpicker | FieldsNumber | FieldsSlider | FieldsDropdown | FieldsImage | FieldsVideo | FieldsSound | FieldsGooglefont | FieldsButton | FieldsHidden;

// export type FieldData2FieldDataType<F extends FieldsAll> = F['value'];

type Foo = {
    bar: FieldsCheckbox;
    baz: FieldsDropdown;
    qux: FieldsSlider;
};

export type Fields2FieldData<Fields extends Record<string, FieldsAll>> = {
    [K in keyof Fields]: Fields[K]['value']
};


