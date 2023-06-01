export { calcBestEffectiveness, sortTally }

const TYPECOUNT = 18
const typeNames = ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark", "Fairy"]
const defenders = await fetch("defenders.json").then(response => response.json())
// We only do linear iteration, so it's faster the turn the hashmap into an array.
const defenderSequences = Object.entries(defenders).map(
	stuff => {
		const key = stuff[0]
		const profile = stuff[1]
		return [key, Object.entries(profile)]
	}
)


function calcBestEffectiveness(moveCount, excludeTypes, includeTypes) {
	// [0, 1, 2,...]
	let attacks = Array.from({ length: moveCount }, (_, i) => i)
	let results = []
	let attackTypes, tally, heels, strongest

	excludeTypes = intify(excludeTypes)
	includeTypes = intify(includeTypes)


	for (attacks; attacks[0] <= TYPECOUNT - moveCount; nextCombination(attacks)) {
		if (excludeTypes && anyin(excludeTypes, attacks))
			continue
		if (includeTypes && !allin(includeTypes, attacks))
			continue

		attackTypes = attacks.map(i => typeNames[i]).join(", ")
		tally = { 4:0, 2:0, 1:0, 0.5:0, 0.25:0, 0:0 }
		heels = []

		for (const [bonusResist, typesDefense] of defenderSequences) {
		  switch (bonusResist) {
			case "Regular":
				// No ability that affects resistances.
				tallyDefenders(attacks, typesDefense, tally, heels, true)
				break

			case "Thick Fat":
				// The only ability resisting two types.
				if (attacks.includes(typeNames.indexOf("Fire")) || attacks.includes(typeNames.indexOf("Ice")))
					tallyDefenders(attacks, typesDefense, tally, heels, false)
				break

			default:
				// Only consider a defensive ability if it might counter one of our attacks.
				if (attacks.includes(typeNames.indexOf(bonusResist)))
					tallyDefenders(attacks, typesDefense, tally, heels, false)
				break
		}}

		results.push([attackTypes, tally, heels])
	}

	function tallyDefenders(attacks, defenses, tally, heels, shouldCountGood) {
		for (const [types, effect] of defenses){
			strongest = attacks.reduce((a, b) => Math.max(a, effect[b]), 0)

			if (shouldCountGood && strongest >= 1)
				// Only tally the negative impact of abilities,
				// so as to not inflate the positive stats when the ability
				// makes no difference (because we have coverage).
				tally[strongest]++

			if (strongest < 1){
				tally[strongest]++
				heels.push(types)
			}
		}
	}

	return results
}


function sortTally(tally, goodList, badList, bundleGood, bundleBad) {
	function getCount(i) {
		return (a, b) => a[1][i] - b[1][i]
	}

	function orderedSort(listy, stuff, descending) {
		let sign = descending ? -1 : 1
		for (const thing of stuff){
			listy.sort((a, b) => sign * getCount(thing)(a, b))
		}
	}
	function bundleSort(listy, stuff, descending) {
		let sign = descending ? -1 : 1
		listy.sort((a, b) =>
			stuff.reduce((c, d) => c + sign * getCount(d)(a, b), 0)
		)
	}

	if (bundleGood)
		bundleSort(tally, goodList, true)
	else
		orderedSort(tally, goodList, true)

	if (bundleBad)
		bundleSort(tally, badList, false)
	else
		orderedSort(tally, badList, false)
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
