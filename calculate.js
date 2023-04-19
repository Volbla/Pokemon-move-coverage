export { calcBestEffectiveness }

const TYPECOUNT = 18
const typeNames = ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark", "Fairy"]
const defenders = await fetch("defenders.json").then(response => response.json())
// Transform the hashmaps into arrays for faster iteration.
const defenderSequences = Object.entries(defenders).map(
	stuff => {
		const key = stuff[0]
		const profile = stuff[1]
		return [key, Object.entries(profile)]
	}
)


function calcBestEffectiveness(count, exclude, include) {
	// [0, 1, 2,...]
	let attacks = Array.from({ length: count }, (_, i) => i)
	let results = []
	let attack_types, tally, heels, best

	exclude = intify(exclude)
	include = intify(include)


	for (attacks; attacks[0] <= TYPECOUNT - count; nextCombination(attacks)) {
		if (exclude && anyin(exclude, attacks))
			continue
		if (include && !allin(include, attacks))
			continue

		attack_types = attacks.map(i => typeNames[i]).join(", ")
		tally = { 4:0, 2:0, 1:0, 0.5:0, 0.25:0, 0:0 }
		heels = []

		for (const [bonusResist, typesDefense] of defenderSequences) {
		  switch (bonusResist) {
			case "Regular":
				// Normal type effectiveness.
				tallyDefenders(attacks, typesDefense, tally, heels, true)

			case "Thick Fat":
				// The only ability resisting two types.
				if (attacks.includes(typeNames.indexOf("Fire")) || attacks.includes(typeNames.indexOf("Ice")))
					tallyDefenders(attacks, typesDefense, tally, heels, false)

			default:
				// Only consider a defensive ability if it might counter one of our attacks.
				if (attacks.includes(typeNames.indexOf(bonusResist)))
					tallyDefenders(attacks, typesDefense, tally, heels, false)
		}}

		results.push([attack_types, tally, heels])
	}

	function tallyDefenders(attacks, defenses, tally, heels, shouldCountGood) {
		for (const [types, effect] of defenses){
			best = attacks.reduce((a, b) => Math.max(a, effect[b]), 0)

			if (shouldCountGood && best >= 1)
				// Only tally the negative impact of abilities,
				// so as to not inflate the positive stats when the ability
				// makes no difference (because we have coverage).
				tally[best]++

			if (best < 1){
				tally[best]++
				heels.push(types)
			}
		}
	}

	// Sorting by effectiveness count
	function get(i) {
		return (a, b) => a[1][i] - b[1][i]
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
	return stringlist.map(str => typeNames.indexOf(str))
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
