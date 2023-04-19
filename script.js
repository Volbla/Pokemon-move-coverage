import { calcBestEffectiveness } from "./calculate.js"

const effectSymbol = { 4:4, 2:2, 1:1, 0.5:"½", 0.25:"¼", 0:0 }
const effectClass = { 4:"four", 2:"two", 1:"one", 0.5:"half", 0.25:"quarter", 0:"zero" }

const shouldInclude = document.getElementById("includeTypes")?.children
const shouldExclude = document.getElementById("excludeTypes")?.children
const countButtons = document.getElementsByClassName("countButton")
const table = document.querySelector("tbody")
const loadMoreButton = document.getElementById("loadMore")

const newChild = (node, child) => node.appendChild(document.createElement(child))


function main() {
	if (shouldInclude == undefined) return
	if (shouldExclude == undefined) return

	for (const button of countButtons) {
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

	countButtons[moveCount - 1].classList.add("active")
	update()

	loadMoreButton?.addEventListener("click", () => {
		length += 10
		printTable()
	})
}


let moveCount = 2
let doInclude = {a: []}
let doExclude = {a: []}

let sauce
let i = 0
let length = 10

function update() {
	while (table?.firstChild) {
		table.removeChild(table.firstChild);
	}
	loadMoreButton?.removeAttribute("hidden")
	i = 0
	length = 10
	sauce = calcBestEffectiveness(moveCount, doExclude.a, doInclude.a)

	printTable()
}

function printTable() {
	if (length > sauce.length) {
		loadMoreButton?.setAttribute("hidden", "")
		length = Math.min(length, sauce.length)
	}

	for (i; i<length; i++) {
		const [types, profile, heels] = sauce[i]

		let row = newChild(table, "tr")
		let typeCell = newChild(row, "td")
		typeCell.innerHTML = types
		typeCell.classList.add("bigrow")

		let effectCell = newChild(row, "td")
		effectCell.classList.add("bigrow")
		let subtable = newChild(newChild(effectCell, "table"), "tbody")
		subtable.parentNode.classList.add("subtable")

		let barCount = 0
		for (const effect of [4,2,1,0.5,0.25,0]) {
			if (profile[effect] == 0) continue

			barCount += 1

			let row = newChild(subtable, "tr")
			let multi = newChild(row, "td")
			multi.innerHTML = `${effectSymbol[effect]}×`
			multi.classList.add("multi")

			let value = newChild(row, "td")
			let bar = newChild(value, "div")
			bar.setAttribute("style", `width: ${profile[effect]}px`)
			bar.classList.add("bar")
			bar.classList.add(effectClass[effect])
			value.append(` ${profile[effect]}`)
		}

		let weaknessCell = newChild(row, "td")
		weaknessCell.classList.add("bigrow")
		let weaknessText = newChild(weaknessCell, "div")
		weaknessText.classList.add("smallcell")
		weaknessText.setAttribute("style", `height: ${barCount * 19}px;`)

		for (const weakness of heels){
			weaknessText.innerHTML += weakness + " <br>"
		}
	}
}

main()
