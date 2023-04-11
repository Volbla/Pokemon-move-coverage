import { calcBestEffectiveness } from "./calculate.js"

const effectSymbol = { 4:4, 2:2, 1:1, 0.5:"½", 0.25:"¼" }
const effectClass = { 4:"four", 2:"two", 1:"one", 0.5:"half", 0.25:"quarter" }

const shouldInclude = document.getElementById("includeInput")
const shouldExclude = document.getElementById("excludeInput")
const countButtons = document.querySelectorAll("button")
const table = document.querySelector("tbody")

const newChild = (node, child) => node.appendChild(document.createElement(child))


function main() {
	if (!(shouldInclude instanceof HTMLInputElement)) return
	if (!(shouldExclude instanceof HTMLInputElement)) return

	countButtons[1].classList.add("active")
	update()

	for (const button of countButtons) {
		button.addEventListener("click", e => {
			document.querySelector("button.active")?.classList.remove("active")
			button.classList.add("active")
			moveCount = parseInt(button.innerHTML)
			update()
		})
	}
	function textDoer(variable) { return e => {
		if (e.key == "Enter"){
			let text = e.target.value
			variable.a = text ? text.split(" ") : []
			update()
		}
	}}
	shouldInclude.addEventListener("keypress", textDoer(doInclude))
	shouldExclude.addEventListener("keypress", textDoer(doExclude))
}


let moveCount = 2,
	doInclude = {a: []},
	doExclude = {a: []}

function update() {
	if (table === null) return

	while (table.firstChild) {
		table.removeChild(table.firstChild);
	}
	let sauce = calcBestEffectiveness(moveCount, doExclude.a, doInclude.a)

	for (let i=0; i<10; i++) {
		const [types, profile, heels] = sauce[i]

		let row = newChild(table, "tr")
		let typeCell = newChild(row, "td")
		typeCell.innerHTML = types
		typeCell.classList.add("bigrow")

		let effectCell = newChild(row, "td")
		effectCell.classList.add("bigrow")
		let subtable = newChild(newChild(effectCell, "table"), "tbody")
		subtable.parentNode.classList.add("subtable")

		for (const effect of [4,2,1,0.5,0.25]) {
			if (!(profile.hasOwnProperty(effect))) continue

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
		for (const effect of [0.5,0.25]) {
			if (!(heels.hasOwnProperty(effect))) continue

			let subtable = newChild(newChild(weaknessCell, "table"), "tbody")
			subtable.parentNode.classList.add("subtable")
			subtable.setAttribute("style", "text-align: center; color: gray")

			for (const weakness of heels[effect]){
				newChild(newChild(subtable, "tr"), "td").innerText = weakness
			}
		}
	}
}

main()
