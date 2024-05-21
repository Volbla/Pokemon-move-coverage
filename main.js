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

const moveCountButtons = document.getElementsByClassName("countButton")
const shouldInclude = document.getElementById("includeTypes").children
const shouldExclude = document.getElementById("excludeTypes").children

const checkBoxes = document.getElementsByTagName("input")
const shouldBundleGood = checkBoxes[0]
const shouldBundleBad = checkBoxes[1]
const shouldPrioritizeBad = document.getElementsByTagName("select")[0]

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
	let boundedCell = therow.insertCell()
	boundedCell.classList.add("boundedCell")
	newChild(boundedCell, "ul").classList.add("boundedList")

	return therow
}

function templateBar() {
	let thisrow = document.createElement("tr")
	thisrow.insertCell().classList.add("multiplier")
	newChild(thisrow.insertCell(), "span").classList.add("bar")

	return thisrow
}

function measureGreatestTypeWidth() {
	// Used to fix the column width of resistant targets.
	// This will probably break if you zoom the page.

	let dummyRow = templateRow()
	let weaknessList = dummyRow.querySelector("ul")
	// Remove the default sizing so that it depends on the content rather than the parent.
	weaknessList.setAttribute("style", "position: static; width: auto;")
	let listItem = newChild(weaknessList, "li")

	// The longest type name in defenders.json
	listItem.textContent = "Fighting/Electric (Volt Absorb)"

	table.appendChild(dummyRow)
	let header = table.previousElementSibling.firstElementChild.lastElementChild
	header.setAttribute("style", `width: ${header.clientWidth}px;`)

	table.replaceChildren()
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

		if (listVariable.includes(type)) {
			let i = listVariable.indexOf(type)
			listVariable.splice(i, 1)
			button.classList.remove("active")
		}
		else {
			listVariable.push(type)
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
		doInclude.splice(0)
		updateTable()
	})
	document.getElementById("excludeReset").addEventListener("click", () => {
		for (const button of shouldExclude)
			button.classList.remove("active")
		doExclude.splice(0)
		updateTable()
	})

	for (const box of checkBoxes)
		box.addEventListener("click", () => { updateTable(false) })

	shouldPrioritizeBad.addEventListener("change", () => { updateTable(false) })

	loadMoreButton.addEventListener("click", () => {
		tableLength += 10
		printTable()
	})


	measureGreatestTypeWidth()
	moveCountButtons[moveCount - 1].classList.add("active")
	updateTable()
}


let moveCount = 2
let doInclude = []
let doExclude = []

let effectivenessResults
let tableLength = 10
let i = 0


function updateTable(recalculate=true) {
	i = 0
	tableLength = 10
	if (recalculate)
		effectivenessResults = calcBestEffectiveness(moveCount, doExclude, doInclude)

	sortTally(
		effectivenessResults,
		shouldBundleGood.checked,
		shouldBundleBad.checked,
		shouldPrioritizeBad.value
	)

	table.replaceChildren()
	loadMoreButton.removeAttribute("hidden")
	printTable()
}


function printTable() {
	if (tableLength >= effectivenessResults.length) {
		loadMoreButton.setAttribute("hidden", "")
		tableLength = effectivenessResults.length
	}

	let newRows = []

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

			let bar = effectRow.querySelector("span.bar")
			bar.classList.add(effectClass[effect])
			bar.setAttribute("style", `width: ${effectTally[effect]}px`)
			bar.after(` ${effectTally[effect]}`)
		}

		// Resistant targets
		for (const weakness of resistants){
			let listItem = newChild(weaknessList, "li")
			listItem.textContent = weakness
		}

		newRows.push(row)
	}

	table.append(...newRows)
}


main()
