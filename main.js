import { calcBestEffectiveness, sortTally } from "./calculation.js"

const effectSymbol = { 4:4, 2:2, 1:1, 0.5:"½", 0.25:"¼", 0:0 }
const effectClass = {
	4:"timesFour",
	2:"timesTwo",
	1:"timesOne",
	0.5:"timesHalf",
	0.25:"timesQuarter",
	0:"timesZero"
}

const shouldInclude = document.getElementById("includeTypes").children
const shouldExclude = document.getElementById("excludeTypes").children
const moveCountButtons = document.getElementsByClassName("countButton")
const table = document.querySelector("tbody")
const loadMoreButton = document.getElementById("loadMore")

function newChild(node, child) {
	return node.appendChild(document.createElement(child))
}

function templateRow() {
	let therow = document.createElement("tr")
	therow.classList.add("bigrow")
	therow.insertCell()
	newChild(therow.insertCell(), "tbody").classList.add("subtable")
	newChild(therow.insertCell(), "ul").classList.add("boundedCell")

	return therow
}

function templateBar() {
	let thisrow = document.createElement("tr")
	thisrow.insertCell().classList.add("multiplier")
	newChild(thisrow.insertCell(), "div").classList.add("bar")

	return thisrow
}


function main() {
	for (const button of moveCountButtons) {
		button.addEventListener("click", () => {
			button.parentElement.querySelector("button.active").classList.remove("active")
			button.classList.add("active")
			moveCount = parseInt(button.innerHTML)
			updateTable()
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

		updateTable()
	}}

	for (const button of shouldInclude)
		button.addEventListener("click", typeButton(doInclude))
	for (const button of shouldExclude)
		button.addEventListener("click", typeButton(doExclude))

	document.getElementById("includeReset").addEventListener("click", () => {
		for (const button of shouldInclude)
			button.classList.remove("active")
		doInclude.a.splice(0)
		updateTable()
	})
	document.getElementById("excludeReset").addEventListener("click", () => {
		for (const button of shouldExclude)
			button.classList.remove("active")
		doExclude.a.splice(0)
		updateTable()
	})

	moveCountButtons[moveCount - 1].classList.add("active")
	updateTable()

	loadMoreButton.addEventListener("click", () => {
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


function updateTable() {
	while (table.firstChild) {
		table.removeChild(table.firstChild);
	}
	loadMoreButton.removeAttribute("hidden")
	i = 0
	tableLength = 10
	effectivenessResults = calcBestEffectiveness(moveCount, doExclude.a, doInclude.a)
	sortTally(effectivenessResults, [2, 4], [0.5, 0.25, 0], true, false)

	printTable()
}


function printTable() {
	if (tableLength >= effectivenessResults.length) {
		loadMoreButton.setAttribute("hidden", "")
		tableLength = effectivenessResults.length
	}

	for (i; i < tableLength; i++) {
		const [attackTypes, effectTally, resistants] = effectivenessResults[i]

		let row = templateRow()
		let [movesCell, effectCell, weaknessCell] = row.children
		let subtable = effectCell.querySelector("tbody")
		let weaknessList = weaknessCell.querySelector("ul")

		// Moves
		movesCell.textContent = attackTypes

		// Effect tally
		for (const effect of [4,2,1,0.5,0.25,0]) {
			if (effectTally[effect] == 0) continue

			let effectRow = subtable.appendChild(templateBar())

			effectRow.firstElementChild.textContent = `${effectSymbol[effect]}×`

			let bar = effectRow.querySelector("div.bar")
			bar.classList.add(effectClass[effect])
			bar.setAttribute("style", `width: ${effectTally[effect]}px`)
			bar.after(` ${effectTally[effect]}`)
		}

		// Resistant targets
		for (const weakness of resistants){
			let listItem = newChild(weaknessList, "li")
			listItem.textContent = weakness
		}

		table.appendChild(row)

		// Set height the same as the effectCell so the row doesn't grow without bounds.
		weaknessList.setAttribute("style", `height: ${subtable.offsetHeight}px;`)
	}
}


main()
