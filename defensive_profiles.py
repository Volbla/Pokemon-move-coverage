import itertools, enum, collections


class Type(enum.IntEnum):
	Normal = 0
	Fighting = 1
	Flying = 2
	Poison = 3
	Ground = 4
	Rock = 5
	Bug = 6
	Ghost = 7
	Steel = 8
	Fire = 9
	Water = 10
	Grass = 11
	Electric = 12
	Psychic = 13
	Ice = 14
	Dragon = 15
	Dark = 16
	Fairy = 17

# Offensive profiles.
Normal = [1,1,1,1,1,0.5,1,0,0.5,1,1,1,1,1,1,1,1,1]
Fighting = [2,1,0.5,0.5,1,2,0.5,0,2,1,1,1,1,0.5,2,1,2,0.5]
Flying = [1,2,1,1,1,0.5,2,1,0.5,1,1,2,0.5,1,1,1,1,1]
Poison = [1,1,1,0.5,0.5,0.5,1,0.5,0,1,1,2,1,1,1,1,1,2]
Ground = [1,1,0,2,1,2,0.5,1,2,2,1,0.5,2,1,1,1,1,1]
Rock = [1,0.5,2,1,0.5,1,2,1,0.5,2,1,1,1,1,2,1,1,1]
Bug = [1,0.5,0.5,0.5,1,1,1,0.5,0.5,0.5,1,2,1,2,1,1,2,0.5]
Ghost = [0,1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,0.5,1]
Steel = [1,1,1,1,1,2,1,1,0.5,0.5,0.5,1,0.5,1,2,1,1,2]
Fire = [1,1,1,1,1,0.5,2,1,2,0.5,0.5,2,1,1,2,0.5,1,1]
Water = [1,1,1,1,2,2,1,1,1,2,0.5,0.5,1,1,1,0.5,1,1]
Grass = [1,1,0.5,0.5,2,2,0.5,1,0.5,0.5,2,0.5,1,1,1,0.5,1,1]
Electric = [1,1,2,1,0,1,1,1,1,1,2,0.5,0.5,1,1,0.5,1,1]
Psychic = [1,2,1,2,1,1,1,1,0.5,1,1,1,1,0.5,1,1,0,1]
Ice = [1,1,2,1,2,1,1,1,0.5,0.5,0.5,2,1,1,0.5,2,1,1]
Dragon = [1,1,1,1,1,1,1,1,0.5,1,1,1,1,1,1,2,1,0]
Dark = [1,0.5,1,1,1,1,1,2,1,1,1,1,1,2,1,1,0.5,0.5]
Fairy = [1,2,1,0.5,1,1,1,1,0.5,0.5,1,1,1,1,1,2,2,1]

single_offense = [Normal, Fighting, Flying, Poison, Ground, Rock, Bug, Ghost, Steel, Fire, Water, Grass, Electric, Psychic, Ice, Dragon, Dark, Fairy]
single_defense = {
	Type(i).name: [attacker[i] for attacker in single_offense]
	for i in range(18)
}

# Defensive profiles of dual types.
dont_exist = ("Bug/Dragon","Fire/Fairy","Ground/Fairy","Normal/Bug","Normal/Ice","Normal/Rock","Normal/Steel","Poison/Ice","Rock/Ghost")
dont_exist = {
	tuple(sorted(Type[t] for t in types.split("/")))
	for types in dont_exist
}
double_defense = {
	"/".join((Type(a).name, Type(b).name)): [attacker[a] * attacker[b] for attacker in single_offense]
	for a, b in itertools.combinations(range(18), 2)
	if (a,b) not in dont_exist
}

defenders = collections.defaultdict(dict)
defenders["Regular"] = single_defense | double_defense

defensive_abilities = {
	"Dry Skin": {"Psychic/Ice", "Fighting/Poison", "Bug/Grass", "Normal/Electric"},
	"Earth Eater": {"Steel"},
	"Flash Fire": {"Fire", "Fire/Dark", "Steel/Fire", "Fire/Psychic", "Rock/Fire", "Bug/Fire", "Rock", "Ghost/Fire"},
	"Heatproof": {"Rock", "Steel/Psychic", "Ghost/Grass"},
	"Levitate": {"Grass/Electric", "Flying/Electric", "Ice", "Ground/Psychic", "Poison/Ghost", "Electric/Ice", "Fire/Electric", "Dragon/Dark", "Water/Electric", "Electric", "Grass", "Ground/Dragon", "Ghost", "Steel/Psychic", "Poison/Fairy", "Poison", "Ghost/Dragon", "Psychic", "Rock/Psychic", "Psychic/Dragon", "Bug/Electric", "Ghost/Electric"},
	"Lightning Rod": {"Grass/Dragon", "Ground/Rock", "Water", "Steel/Electric", "Electric", "Ground", "Ghost/Fire"},
	"Motor Drive": {"Flying/Electric", "Electric"},
	"Purifying Salt": {"Rock"},
	"Sap Sipper": {"Normal/Dragon", "Normal/Fairy", "Normal/Grass", "Normal", "Grass", "Water/Fairy", "Steel/Dragon", "Electric", "Dragon", "Normal/Psychic"},
	"Storm Drain": {"Water", "Grass", "Water/Dragon", "Ground/Water", "Rock/Grass"},
	"Thick Fat": {"Fire", "Poison/Grass", "Water/Ice", "Grass/Dragon", "Ice", "Ground/Ice", "Normal/Fairy", "Normal/Dark", "Normal", "Water", "Water/Fairy", "Fighting", "Fighting/Fire", "Psychic"},
	"Volt Absorb": {"Flying/Electric", "Electric/Dragon", "Electric/Ice", "Water/Electric", "Electric", "Fighting/Electric"},
	"Water Absorb": {"Fire/Water", "Flying/Water", "Water/Ice", "Ghost/Water", "Bug/Water", "Grass/Dark", "Water", "Grass", "Poison/Ground", "Water/Electric", "Fighting/Water", "Water/Dragon", "Ground/Water", "Water/Grass"},
	"Water Bubble": {"Bug/Water"},
	"Well-Baked Body": {"Fairy"}
}

ability_resistances = {
	"Dry Skin": ("Water", 0),
	"Earth Eater": ("Ground", 0),
	"Flash Fire": ("Fire", 0),
	"Heatproof": ("Fire", 0.5),
	"Levitate": ("Ground", 0),
	"Lightning Rod": ("Electric", 0),
	"Motor Drive": ("Electric", 0),
	"Purifying Salt": ("Ghost", 0.5),
	"Sap Sipper": ("Grass", 0),
	"Storm Drain": ("Water", 0),
	"Thick Fat": (["Fire", "Ice"], 0.5),
	"Volt Absorb": ("Electric", 0),
	"Water Absorb": ("Water", 0),
	"Water Bubble": ("Fire", 0.5),
	"Well-Baked Body": ("Fire", 0)
}

for ability, havers in defensive_abilities.items():
	# Special because it resists two types.
	if ability == "Thick Fat":
		# Redundantly looping over all type combinations,
		# just to keep the same type-order.
		for types in defenders["Regular"]:
			if types not in havers: continue

			res = ability_resistances[ability]
			new_defense = defenders["Regular"][types].copy()

			for t in res[0]:
				new_defense[Type[t]] *= res[1]

			type_with_ability = types + f" ({ability})"
			defenders["Thick Fat"][type_with_ability] = new_defense

	else:
		restype, multiplier = ability_resistances[ability]

		for types in defenders["Regular"]:
			if types not in havers: continue

			new_defense = defenders["Regular"][types].copy()
			new_defense[Type[restype]] *= multiplier

			type_with_ability = types + f" ({ability})"
			# Categorize other abilities by their resisted type for simple access.
			defenders[restype][type_with_ability] = new_defense


if __name__ == "__main__":
	from util.texthandling import compact_json_string

	with open("defenders.json", "w", encoding="utf-8", newline="\n") as f:
		f.write(compact_json_string(defenders))
