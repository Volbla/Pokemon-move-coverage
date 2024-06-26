import { calcBestEffectiveness, sortTally } from "./calculation.js"

const effectSymbol = { 4: 4, 2: 2, 1: 1, 0.5: "½", 0.25: "¼", 0: 0 }
const effectClass = {
	4: "timesFour",
	2: "timesTwo",
	1: "timesOne",
	0.5: "timesHalf",
	0.25: "timesQuarter",
	0: "timesZero"
}

const formElement = document.querySelector("form")

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
	for (const inp of document.getElementsByTagName("input")) {
		inp.addEventListener("click", event => updateTable(!event.target.classList.contains("bundling")))
	}
	document.getElementsByTagName("select")[0].addEventListener("change", () => { updateTable(false) })

	for (const button of document.getElementsByClassName("resetButton")) {
		button.addEventListener("click", event => {
			event.preventDefault()
			const selection = event.target.name
			for (const inp of formElement.querySelectorAll(`input[name="${selection}"]`)) {
				inp.checked = false
			}
			updateTable()
		})
	}

	loadMoreButton.addEventListener("click", () => {
		tableLength += 10
		printTable()
	})

	measureGreatestTypeWidth()
	updateTable()
}


let effectivenessResults
let tableLength = 10
let i = 0


function updateTable(recalculate = true) {
	i = 0
	tableLength = 10
	let formData = new FormData(formElement)

	if (recalculate) {
		let moveCount = Number.parseInt(formData.get("count"))
		let doInclude = formData.getAll("includeTypes")
		let doExclude = formData.getAll("excludeTypes")

		effectivenessResults = calcBestEffectiveness(moveCount, doExclude, doInclude)
	}

	sortTally(
		effectivenessResults,
		formData.get("bundleGood"),
		formData.get("bundleBad"),
		formData.get("prioritizeBad")
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
		for (const effect of [4, 2, 1, 0.5, 0.25, 0]) {
			if (effectTally[effect] == 0) continue

			let effectRow = subtable.appendChild(templateBar())

			effectRow.firstElementChild.textContent = `${effectSymbol[effect]}×`

			let bar = effectRow.querySelector("span.bar")
			bar.classList.add(effectClass[effect])
			bar.setAttribute("style", `width: ${effectTally[effect]}px`)
			bar.after(` ${effectTally[effect]}`)
		}

		// Resistant targets
		for (const weakness of resistants) {
			let listItem = newChild(weaknessList, "li")
			listItem.textContent = weakness
		}

		newRows.push(row)
	}

	table.append(...newRows)
}


main()
