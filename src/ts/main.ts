import { getUserPronouns } from './pronouns_extension_api';
import { setAllCSSVars } from './util';
import { SEEvent, SEChatMessageEventDetail, SEEventListenerDetailTypeMap, SEWidgetLoadEvent, Fields2FieldData } from './streamelements';
// import { sRGBToAPCA, hexToSRGB, srgbToHex } from './color';
import * as elhelper from '@amgg/elhelper';
import { MyFields } from './fields';
import * as twemojiparser from 'twemoji-parser';

type MyFieldData = Fields2FieldData<MyFields>;

// let userCurrency; 

let fieldData: MyFieldData;

let chat_root: Element;
let chat_template: HTMLTemplateElement;

function init() {
    chat_root = document.getElementsByClassName('chat_root')?.[0];
    chat_template = document.getElementsByClassName('chat_template')?.[0] as HTMLTemplateElement; // FIXME actually check instead of just casting
}

interface ParsedEmote {
    src: string;
    type: string;
    text: string;
}

function* parse_standard_emotes(detail: SEChatMessageEventDetail): Generator<string | ParsedEmote, void, undefined> {
    let prev_idx: number = 0;
    for(const emote of detail.event.data.emotes) {
        // ignore streamelements's built in parsing of the emojis, which are (at time of writing) basically useless since they don't include start/end indices
        if(emote.type === 'emoji') continue;
        // twitch ones have inclusive end idx, bttv/ffz have exclusive end idx.
        let end_idx =
            (detail.event.data.text[emote.end] === ' ') ?
            emote.end : (emote.end + 1);
        yield detail.event.data.text.slice(prev_idx, emote.start);
        yield {
            src: emote.urls[4],
            type: emote.type,
            text: detail.event.data.text.slice(emote.start, end_idx),
        };
        prev_idx = end_idx;
    }
    yield detail.event.data.text.slice(prev_idx, detail.event.data.text.length);
}

function* parse_twemojis(s: string): Generator<string | ParsedEmote, void, undefined> {
    let prev_idx: number = 0;
    for(const emoji of twemojiparser.parse(s)) {
        yield s.slice(prev_idx, emoji.indices[0]);
        yield {
            src: emoji.url,
            type: 'twemoji',
            text: emoji.text,
        };
        prev_idx = emoji.indices[1];
    }
    yield s.slice(prev_idx, s.length);
}

function* chain_emote_parsers(g: Generator<string | ParsedEmote, void, undefined>, f: (s: string) => Generator<string | ParsedEmote, void, undefined>): Generator<string | ParsedEmote, void, undefined> {
    for(const x of g) {
        if(typeof x === 'string') yield* f(x);
        else yield x;
    }
}

function clear_old_messages() {
    while(chat_root.childNodes.length > fieldData.history_size) {
        chat_root.removeChild(chat_root.childNodes[0]);
    }
}

function handle_chat_message(detail: SEChatMessageEventDetail) {
    const template_instance = chat_template.content.firstElementChild.cloneNode(true) as HTMLElement | SVGElement;
    // color
    {
        // temp - randomize color
        // detail.event.data.displayColor = srgbToHex([Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)]);
    }
    setAllCSSVars(template_instance, {
        '--user-color': detail.event.data.displayColor,
    });
    // APCA stuff, disabled for now cuz it's not finished
    /* {
        const ratio = sRGBToAPCA(
            hexToSRGB(detail.event.data.displayColor),
            hexToSRGB('#D2D2D2'), // TODO factor out to field
        );
        console.log(ratio);
        // const outlineColor = (Math.abs(ratio) >= 75) ? 'transparent' : 'black';
        const outlineColor = (Math.abs(ratio) <= 30) ? 'black' : 'transparent';
        setAllCSSVars(template_instance, {
            '--user-color-outline': outlineColor,
        });
    } */
    // fill in text
    const username_elems = template_instance.getElementsByClassName('username') as HTMLCollectionOf<HTMLElement>;
    const message_elems = template_instance.getElementsByClassName('message') as HTMLCollectionOf<HTMLElement>;
    const pronoun_container_elems = template_instance.getElementsByClassName('pronoun_container') as HTMLCollectionOf<HTMLElement>;
    const pronoun_text_elems = template_instance.getElementsByClassName('pronoun_text') as HTMLCollectionOf<HTMLElement>;
    const badges_container_elems = template_instance.getElementsByClassName('badges_container') as HTMLCollectionOf<HTMLElement>;
    const username_secondary_container_elems = template_instance.getElementsByClassName('username_secondary_container') as HTMLCollectionOf<HTMLElement>;
    const username_secondary_elems = template_instance.getElementsByClassName('username_secondary') as HTMLCollectionOf<HTMLElement>;
    // message
    // for(const el of message_elems) el.textContent = detail.event.data.text;
    {
        // emotes
        let emotes = parse_standard_emotes(detail);
        if(fieldData.use_twemoji) emotes = chain_emote_parsers(emotes, parse_twemojis);
        for(const entry of emotes) {
            if(typeof entry === 'string') {
                if(entry.length === 0) continue;
                if(entry === ' ' && fieldData.remove_emote_gap) continue;
                for(const el of message_elems) el.appendChild(document.createTextNode(entry));
            } else {
                for(const el of message_elems) {
                    elhelper.create('img', {
                        parent: el,
                        src: entry.src,
                        classList: ['emote'],
                        dataset: {
                            emoteType: entry.type,
                            emoteName: entry.text,
                        },
                    });
                }
            }
        }
    }
    // username
    {
        let username_primary = null, username_secondary = null;
        switch(fieldData.localized_name_mode) {
            case 'localized_only': username_primary = detail.event.data.displayName; break;
            case 'unlocalized_only': username_primary = detail.event.data.nick; break;
            case 'both':
                username_primary = detail.event.data.displayName;
                username_secondary = detail.event.data.nick;
                if(username_primary.toLowerCase() === username_secondary.toLowerCase()) username_secondary = null;
                break;
            default: throw 'TODO';
        }
        for(const el of username_elems) el.textContent = username_primary;
        if(username_secondary === null) for(const el of username_secondary_container_elems) el.style.display = 'none';
        else for(const el of username_secondary_elems) el.textContent = username_secondary;
    }
    // badges
    for(const el of badges_container_elems) for(const badge of detail.event.data.badges) {
        elhelper.create('img', {
            parent: el,
            src: badge.url,
            dataset: {
                badgeType: badge.type,
            },
            classList: ['badge'],
        });
        // badge.description
        // badge.version
    }
    // pronouns
    if(!fieldData.use_pronouns_extension) {
        for(const el of pronoun_container_elems) el.style.display = 'none';
    } else {
        getUserPronouns(detail.event.data.nick).then(pronouns=>{
            if(pronouns === null) for(const el of pronoun_container_elems) el.style.display = 'none';
            else for(const el of pronoun_text_elems) el.textContent = pronouns;
        });
    }
    //
    chat_root.appendChild(template_instance);
    //
    clear_old_messages();
}

const se_event_handlers: { [K in keyof SEEventListenerDetailTypeMap]?: (x: SEEventListenerDetailTypeMap[K]) => void } = {
    message: handle_chat_message,
};

// SE event stuff

window.addEventListener('onEventReceived', function (e: SEEvent) {
    console.log(e);
    se_event_handlers[e.detail.listener]?.(e.detail as any);
});

window.addEventListener('onWidgetLoad', (e: SEWidgetLoadEvent<MyFieldData>) => {
    // userCurrency = e.detail.currency;
    fieldData = e.detail.fieldData;
    
    init();
});

window.addEventListener('onSessionUpdate', function(e) {
    console.log('onSessionUpdate', e);
});



