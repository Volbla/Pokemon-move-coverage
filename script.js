import { calcBestEffectiveness } from "./calculate.js"

const effectSymbol = { 4:4, 2:2, 1:1, 0.5:"½", 0.25:"¼", 0:0 }
const effectClass = {
	4:"timesFour",
	2:"timesTwo",
	1:"timesOne",
	0.5:"timesHalf",
	0.25:"timesQuarter",
	0:"timesZero"
}

const shouldInclude = document.getElementById("includeTypes")?.children
const shouldExclude = document.getElementById("excludeTypes")?.children
const moveCountButtons = document.getElementsByClassName("countButton")
const table = document.querySelector("tbody")
const loadMoreButton = document.getElementById("loadMore")

const newChild = (node, child) => node.appendChild(document.createElement(child))


function main() {
	if (shouldInclude == undefined) return
	if (shouldExclude == undefined) return

	for (const button of moveCountButtons) {
		button.addEventListener("click", () => {
			button.parentElement?.querySelector("button.active")?.classList.remove("active")
			button.classList.add("active")
			moveCount = parseInt(button.innerHTML)
			update()
		})
	}
	function typeButton(listVariable) { return event => {
		let button = event.target
		let type = button.innerHTML

		if (listVariable.a.includes(type)) {
			let i = listVariable.a.indexOf(type)
			listVariable.a.splice(i, 1)
			button.classList.remove("active")
		}
		else {
			listVariable.a.push(type)
			button.classList.add("active")
		}

		update()
	}}

	for (const button of shouldInclude)
		button.addEventListener("click", typeButton(doInclude))
	for (const button of shouldExclude)
		button.addEventListener("click", typeButton(doExclude))

	document.getElementById("includeReset")?.addEventListener("click", () => {
		for (const button of shouldInclude)
			button.classList.remove("active")
		doInclude.a.splice(0)
		update()
	})
	document.getElementById("excludeReset")?.addEventListener("click", () => {
		for (const button of shouldExclude)
			button.classList.remove("active")
		doExclude.a.splice(0)
		update()
	})

	moveCountButtons[moveCount - 1].classList.add("active")
	update()

	loadMoreButton?.addEventListener("click", () => {
		tableLength += 10
		printTable()
	})
}


let moveCount = 2
let doInclude = {a: []}
let doExclude = {a: []}

let effectivenessResults
let tableLength = 10
let i = 0

function update() {
	while (table?.firstChild) {
		table.removeChild(table.firstChild);
	}
	loadMoreButton?.removeAttribute("hidden")
	i = 0
	tableLength = 10
	effectivenessResults = calcBestEffectiveness(moveCount, doExclude.a, doInclude.a)

	printTable()
}

function printTable() {
	if (tableLength >= effectivenessResults.length) {
		loadMoreButton?.setAttribute("hidden", "")
		tableLength = effectivenessResults.length
	}

	for (i; i < tableLength; i++) {
		const [attackTypes, effectTally, resistants] = effectivenessResults[i]

		let row = newChild(table, "tr")
		row.classList.add("bigrow")

		// Moves
		let typeCell = newChild(row, "td")
		typeCell.innerHTML = attackTypes

		// Effect tally
		let effectCell = newChild(row, "td")
		let subtable = newChild(newChild(effectCell, "table"), "tbody")
		subtable.parentNode.classList.add("subtable")

		for (const effect of [4,2,1,0.5,0.25,0]) {
			if (effectTally[effect] == 0) continue

			let row = newChild(subtable, "tr")
			let multiplier = newChild(row, "td")
			multiplier.innerHTML = `${effectSymbol[effect]}×`
			multiplier.classList.add("multiplier")

			let value = newChild(row, "td")
			let bar = newChild(value, "div")
			bar.setAttribute("style", `width: ${effectTally[effect]}px`)
			bar.classList.add("bar")
			bar.classList.add(effectClass[effect])
			value.append(` ${effectTally[effect]}`)
		}

		let height = subtable.offsetHeight

		// Resistant targets
		let weaknessCell = newChild(row, "td")
		let weaknessText = newChild(weaknessCell, "div")
		weaknessText.classList.add("boundedCell")
		// Dynamically set the row height to the size of the effectCell.
		weaknessText.setAttribute("style", `height: ${height}px;`)

		for (const weakness of resistants){
			weaknessText.innerHTML += weakness + "<br>"
			// let item = newChild(weaknessText, "li")
			// item.innerHTML = weakness
		}
	}
}

main()
