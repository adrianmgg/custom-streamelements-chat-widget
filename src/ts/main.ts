// TODO auto google fonts support
// TODO pronouns extension integration
// TODO twemoji integration
// TODO auto text outline when needed (based on preset approximate color) (probably based on wcag contrast ratio)

// let userCurrency; 

let fieldData;

let chat_root;
let chat_template: HTMLTemplateElement;

let getUserPronouns;

function init() {
    chat_root = document.getElementsByClassName('chat_root')?.[0];
    chat_template = document.getElementsByClassName('chat_template')?.[0] as HTMLTemplateElement; // FIXE actually check instead of just casting
}

function handle_chat_message(detail) {
    const template_instance = chat_template.content.firstElementChild.cloneNode(true) as HTMLElement | SVGElement;
    // color
    {
        // temp - randomize color
        detail.event.data.displayColor = `#${Math.floor(Math.random()*255).toString(16).padStart(2,'0')}${Math.floor(Math.random()*255).toString(16).padStart(2,'0')}${Math.floor(Math.random()*255).toString(16).padStart(2,'0')}`;
    }
    setAllCSSVars(template_instance, {
        '--user-color': detail.event.data.displayColor,
    });
    {
        const contrastRatio = color_util.contrastRatio(
            color_util.parseHexColor(detail.event.data.displayColor),
            color_util.parseHexColor('#D2D2D2') // TODO factor out to field
        );
        console.log(contrastRatio);
        const outlineColor = (contrastRatio >= 1.5) ? 'transparent' : 'black';
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
    for(const el of message_elems) el.textContent = detail.event.data.text;
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
    for(const badge of detail.event.data.badges) {
        const img = document.createElement('img');
        img.src = badge.url;
        img.setAttribute('data-badge-type', badge.type);
        img.classList.add('badge');
        // badge.description
        // badge.version
        for(const el of badges_container_elems) el.appendChild(img);
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
}

const se_event_handlers: Record<string, (x: unknown) => void> = {
    message: handle_chat_message,
};

// misc. utility functions

function setAllCSSVars(target: HTMLElement | SVGElement, vars: Record<string, string>) {
    for(const k in vars) target.style.setProperty(k, vars[k]);
}

function minmax(a: number, b: number): [number, number] {
    if(a < b) return [a, b];
    else return [b, a];
}

// color stuff

// https://www.w3.org/TR/WCAG21/
const color_util = {
    // TODO only does '#RRGGBB' ones for now, do we ever need to handle anything else?
    // TODO needs some error checking
    parseHexColor(c: string): [number, number, number] {
        return [parseInt(c.slice(1,3), 16)/255, parseInt(c.slice(3,5), 16)/255, parseInt(c.slice(5,7), 16)/255];
    },
    rgbToLinear(rgb: [number, number, number]){
        // TODO " Draft publications by sRGB's creators further rounded to 12.92, resulting in
        //                a small discontinuity in the curve "
        //            - https://en.wikipedia.org/wiki/SRGB
        //            should i use the more accurate value? probably doesnt matter for 8bpp color lol
        return rgb.map(n=>(n<=0.03928)?(n/12.92): Math.pow((n+0.055)/1.055, 2.4) );
    },
    relativeLuminance(rgb: [number, number, number]) {
        const [r, g, b] = color_util.rgbToLinear(rgb);
        return 0.2126*r + 0.7152*g + 0.0722*b;
    },
    contrastRatio(c1: [number, number, number], c2: [number, number, number]){
        const [l2, l1] = minmax(color_util.relativeLuminance(c1), color_util.relativeLuminance(c2));
        return (l1 + 0.05) / (l2 + 0.05);
    }
};

// pronouns

async function pronounAPI(endpoint: string) {
    const response = await fetch(`https://pronouns.alejo.io/api/${endpoint}`);
    return await response.json();
}

function setupPronounsStuff(){
    // TODO don't grab pronouns list if disabled
    const pronounCache = {};
    const maxCacheAge = 300000; // same as used in the pronoun extension ffz addon version
    const pronounsData = pronounAPI('pronouns').then(function(pronouns) {
        // convert the result from [{name:foo,display:bar}] to {foo:bar}
        let pronounNameDisplayMap = {};
        for(let p of pronouns) {
            pronounNameDisplayMap[p.name] = p.display;
        };
        return pronounNameDisplayMap;
    });
    async function getPronounIdUncached(user: string) {
        const pronounInfo = await pronounAPI(`users/${user}`);
        if(pronounInfo != null && pronounInfo.length > 0) {
            return pronounInfo[0].pronoun_id;
        }
        return null;
    }
    return async function(user: string){
        const now = Date.now();
        if(!(user in pronounCache) || (now - pronounCache[user].time >= maxCacheAge)) {
            pronounCache[user] = {
                time: now,
                val: await getPronounIdUncached(user)
            };
        }
        const pronounID = pronounCache[user].val;
        if(pronounID === null) return null;
        else return (await pronounsData)[pronounID];
    }
}

// SE event stuff

window.addEventListener('onEventReceived', function (e: CustomEvent) {
    console.log(e);
    const handler = se_event_handlers[e.detail.listener];
    if(handler !== undefined) handler(e.detail);
    // else console.log(e);
});

window.addEventListener('onWidgetLoad', (e: CustomEvent) => {
    // userCurrency = e.detail.currency;
    fieldData = e.detail.fieldData;
    if(fieldData.use_pronouns_extension) getUserPronouns = setupPronounsStuff();
    
    init();
});

window.addEventListener('onSessionUpdate', function(e) {
    console.log('onSessionUpdate', e);
});



