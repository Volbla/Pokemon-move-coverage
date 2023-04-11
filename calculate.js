export { calcBestEffectiveness }

const TYPECOUNT = 18
const typeNames = ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark", "Fairy"]
const defenders = await fetch("defenders.json").then(response => response.json())


function calcBestEffectiveness(count, exclude, include) {
	// [0, 1, 2,...]
	let attacks = Array.from({ length: count }, (_, i) => i)
	let results = []

	exclude = intify(exclude)
	include = intify(include)

	for (attacks; attacks[0] <= TYPECOUNT - count; nextCombination(attacks)) {
		if (exclude && anyin(exclude, attacks))
			continue
		if (include && !allin(include, attacks))
			continue

		let attack_types = attacks.map(i => typeNames[i]).join(", ")
		// https://stackoverflow.com/questions/6600868/set-default-value-of-javascript-object-attributes
		let tally = {}; let tallyproxy = new Proxy(tally, intdefault);
		let heels = {}; let heelsproxy = new Proxy(heels, listdefault);

		for (const [types, effect] of Object.entries(defenders)){
			// Skip levitate defenders if attacks doesn't include ground.
			if (!attacks.includes(4) && types.endsWith("(Levitate)")) break

			let best = attacks.map(i => effect[i]).reduce((x, y) => Math.max(x, y))
			tallyproxy[best] += 1
			if (best < 1)
				heelsproxy[best].push(types)
		}

		results.push([attack_types, tally, heels])
	}

	// Sorting by effectiveness count
	function getOrZero(x, i) { return x.hasOwnProperty(i) ? x[i] : 0 }
	function get(i) {
		return (a, b) => getOrZero(a[1], i) - getOrZero(b[1], i)
	}

	// The most super-effective. Sum 2x and 4x. Negate for descending order.
	results.sort((a, b) => -(get(2)(a, b) + get(4)(a, b)))
	// The fewest weak or non-effective
	for (const bad of [0.5, 0.25, 0]){
		results.sort(get(bad))
	}

	return results
}


function nextCombination(array) {
	const count = array.length
	let i, j

	// Iterate backwards through the list, carrying any overflow
	for (i = 1; i <= count; i++){
		array[count-i]++
		if (array[count-i] <= TYPECOUNT - i){
			i--
			break
		}
	}
	// Reset any overflown entries to their smallest valid value
	for (j = count - i; j < count; j++){
		array[j] = array[j - 1] + 1
	}
}

const titleCase = str => str[0].toUpperCase() + str.slice(1).toLowerCase()

function intify(stringlist) {
	if (!stringlist) return stringlist
	return stringlist.map(str => typeNames.indexOf(titleCase(str)))
}

function anyin(these, those) {
	for (const that of these){
		if (those.includes(that))
			return true
	}
	return false
}
function allin(these, those) {
	for (const that of these){
		if (!those.includes(that))
			return false
	}
	return true
}
const intdefault = {
	get: function(map, key) {
		return map.hasOwnProperty(key) ? map[key] : 0;
	}
}
const listdefault = {
	get: function(map, key) {
		return map.hasOwnProperty(key) ? map[key] : map[key] = new Array(), map[key];
	}
}
