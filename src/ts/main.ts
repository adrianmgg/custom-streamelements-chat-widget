// TODO auto google fonts support
// TODO pronouns extension integration
// TODO twemoji integration
// TODO auto text outline when needed (based on preset approximate color) (probably based on wcag contrast ratio)

import { getUserPronouns } from './pronouns_extension_api';
import { setAllCSSVars } from './util';
import { SEEvent, SEChatMessageEventDetail, SEEventListenerDetailTypeMap, SEWidgetLoadEvent, Fields2FieldData } from './streamelements';
import { sRGBToAPCA, hexToSRGB, srgbToHex } from './color';
import * as elhelper from '@amgg/elhelper';
import { MyFields } from './fields';

type MyFieldData = Fields2FieldData<MyFields>;

// let userCurrency; 

let fieldData: MyFieldData;

let chat_root: Element;
let chat_template: HTMLTemplateElement;

function init() {
    chat_root = document.getElementsByClassName('chat_root')?.[0];
    chat_template = document.getElementsByClassName('chat_template')?.[0] as HTMLTemplateElement; // FIXE actually check instead of just casting
}

function handle_chat_message(detail: SEChatMessageEventDetail) {
    const template_instance = chat_template.content.firstElementChild.cloneNode(true) as HTMLElement | SVGElement;
    // color
    {
        // temp - randomize color
        detail.event.data.displayColor = srgbToHex([Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)]);
    }
    setAllCSSVars(template_instance, {
        '--user-color': detail.event.data.displayColor,
    });
    {
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
    }
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
        let prev_end: number = 0;
        for(const emote of detail.event.data.emotes) {
            const txt_before_emote = detail.event.data.text.slice(prev_end, emote.start);
            if(txt_before_emote.length > 0) {
                for(const el of message_elems) el.appendChild(document.createTextNode(txt_before_emote));
            }
            for(const el of message_elems) {
                elhelper.create('img', {
                    parent: el,
                    src: emote.urls[4],
                    classList: ['emote'],
                    dataset: {
                        emoteType: emote.type,
                        emoteName: detail.event.data.text.slice(emote.start, emote.end + 1),
                    },
                });
            }
            prev_end = emote.end + 1;
        }
        const txt = detail.event.data.text.slice(prev_end, detail.event.data.text.length);
        if(txt.length > 0) {
            for(const el of message_elems) el.appendChild(document.createTextNode(txt));
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
    chat_root.insertBefore(template_instance, chat_root.firstChild);
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



