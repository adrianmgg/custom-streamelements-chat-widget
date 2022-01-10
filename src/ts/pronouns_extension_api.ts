
async function pronounAPI(endpoint: string) {
    const response = await fetch(`https://pronouns.alejo.io/api/${endpoint}`);
    return await response.json();
}

const pronounCache = {};

const maxCacheAge = 300000; // same as used in the pronoun extension ffz addon version

// TODO don't grab pronouns list if disabled
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

export async function getUserPronouns(user: string){
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


