

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
                type: 'bttv' | 'twitch', // TODO get a more complete list of these
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


