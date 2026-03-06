import { useState, useMemo } from "react";

const DATA = {
// ── BANCROFT PLACE ─────────────────────────────────────────────────────────
// New vs v4: Elizabeth Steenblik (G45, unit 113), Lori West (G40, unit 119)
// Madeline Mortimore G47&48 = $120 total ($60 each)
"Bancroft Place Apartments": { total: 52, revenue: 955,
  garages: [
    {id:"G4",  tenant:"David Templeton",      unit:"105", price:60,  status:"occupied"},
    {id:"G7",  tenant:"Micah Schott",          unit:"127", price:60,  status:"occupied"},
    {id:"G9",  tenant:"Maryna Golovko",        unit:"102", price:60,  status:"occupied"},
    {id:"G11", tenant:"Heather M. Plueger",    unit:"101", price:60,  status:"occupied"},
    {id:"G14", tenant:"Jame Hernane",          unit:"125", price:50,  status:"occupied"},
    {id:"G16", tenant:"Terrence Snyder",       unit:"204", price:50,  status:"occupied"},
    {id:"G17", tenant:"Anthony Ranfranz",      unit:"121", price:65,  status:"occupied"},
    {id:"G20", tenant:"Cheyanne R. Hays",      unit:"221", price:60,  status:"occupied"},
    {id:"G25", tenant:"Joshua Hartsook",       unit:"110", price:65,  status:"occupied"},
    {id:"G26", tenant:"Susan Zarn",            unit:"108", price:50,  status:"occupied"},
    {id:"G28", tenant:"Lois R. Howlett",       unit:"107", price:50,  status:"occupied"},
    {id:"G32", tenant:"Roger Downing",         unit:"206", price:60,  status:"occupied"},
    {id:"G34", tenant:"Gracie R. Terrall",     unit:"210", price:60,  status:"occupied"},
    {id:"G37", tenant:"Deann M. Lawrence",     unit:"118", price:0,   status:"occupied", notes:"Included in rent"},
    {id:"G39", tenant:"Trinity Kennedy",       unit:"219", price:0,   status:"occupied", notes:"Included in rent"},
    {id:"G40", tenant:"Lori West",             unit:"119", price:50,  status:"occupied"},
    {id:"G41", tenant:"Joel Svendsen",         unit:"213", price:60,  status:"occupied"},
    {id:"G42", tenant:"Donovan Minor",         unit:"212", price:60,  status:"occupied"},
    {id:"G43", tenant:"Irene Ford",            unit:"112", price:60,  status:"occupied"},
    {id:"G45", tenant:"Elizabeth Steenblik",   unit:"113", price:60,  status:"occupied"},
    {id:"G46", tenant:"Allison Gerry",         unit:"114", price:50,  status:"occupied"},
    {id:"G47", tenant:"Madeline E. Mortimore", unit:"116", price:60,  status:"occupied", notes:"Double garage G47+G48, $60 each"},
    {id:"G48", tenant:"Madeline E. Mortimore", unit:"116", price:60,  status:"occupied", notes:"Double garage G47+G48, $60 each"},
    {id:"G49", tenant:"Autumn Negen",          unit:"217", price:0,   status:"occupied", notes:"Included in rent"},
    {id:"G52", tenant:"Elizabeth Schreier",    unit:"115", price:50,  status:"occupied"},
    // vacant
    {id:"G1",  status:"vacant"},{id:"G2",  status:"vacant"},{id:"G3",  status:"vacant"},
    {id:"G5",  status:"vacant"},{id:"G6",  status:"vacant"},{id:"G8",  status:"vacant"},
    {id:"G10", status:"vacant"},{id:"G12", status:"vacant"},{id:"G13", status:"vacant"},
    {id:"G15", status:"vacant"},{id:"G18", status:"vacant"},{id:"G19", status:"vacant"},
    {id:"G21", status:"vacant"},{id:"G22", status:"vacant"},{id:"G23", status:"vacant"},
    {id:"G24", status:"vacant"},{id:"G27", status:"vacant"},{id:"G29", status:"vacant"},
    {id:"G30", status:"vacant"},{id:"G31", status:"vacant"},{id:"G33", status:"vacant"},
    {id:"G35", status:"vacant"},{id:"G36", status:"vacant"},{id:"G38", status:"vacant"},
    {id:"G44", status:"vacant"},{id:"G50", status:"vacant"},{id:"G51", status:"vacant"},
  ]
},

// ── BOULDER POINTE ──────────────────────────────────────────────────────────
// Rule: 1 garage included per tenant; 2nd elected garage = $50/mo
// Atkisson has individual prices: G72=$50, G77=$50, G78=$0
"Boulder Pointe Townhomes": { total: 78, revenue: 700,
  garages: [
    // Single included garages
    {id:"G23", tenant:"Joshua Faber",        unit:"7701-3", price:0,  status:"occupied", notes:"Included in rent"},
    {id:"G37", tenant:"Shaina Solem",        unit:"7713-1", price:0,  status:"occupied", notes:"Included in rent"},
    {id:"G42", tenant:"Jeffry Solis",        unit:"7713-4", price:0,  status:"occupied", notes:"Included in rent"},
    {id:"G55", tenant:"Ryan D. Shumate",     unit:"7801-1", price:0,  status:"occupied", notes:"Included in rent"},
    {id:"G58", tenant:"Thomas Anderson",     unit:"7801-3", price:0,  status:"occupied", notes:"Included in rent"},
    {id:"G70", tenant:"Rebecca K. Aman",     unit:"7809-3", price:0,  status:"occupied", notes:"Included in rent"},
    {id:"G75", tenant:"Jason R. Rygg",       unit:"7813-2", price:0,  status:"occupied", notes:"Included in rent"},
    // Double garages: 1st included, 2nd = $50
    {id:"G13", tenant:"Amy E. Sehr",         unit:"7609-1", price:0,  status:"occupied", notes:"Included (1st garage)"},
    {id:"G14", tenant:"Amy E. Sehr",         unit:"7609-1", price:50, status:"occupied", notes:"2nd garage – $50/mo"},
    {id:"G22", tenant:"Daniel Rogotzke",     unit:"7701-4", price:0,  status:"occupied", notes:"Included (1st garage)"},
    {id:"G24", tenant:"Daniel Rogotzke",     unit:"7701-4", price:50, status:"occupied", notes:"2nd garage – $50/mo"},
    {id:"G26", tenant:"Megan M. Janssen",    unit:"7705-4", price:0,  status:"occupied", notes:"Included (1st garage)"},
    {id:"G30", tenant:"Megan M. Janssen",    unit:"7705-4", price:50, status:"occupied", notes:"2nd garage – $50/mo"},
    {id:"G33", tenant:"Tracy A. Gordon",     unit:"7709-2", price:0,  status:"occupied", notes:"Included (1st garage)"},
    {id:"G53", tenant:"Tracy A. Gordon",     unit:"7709-2", price:50, status:"occupied", notes:"2nd garage – $50/mo"},
    {id:"G38", tenant:"Jazmine Myers",       unit:"7713-2", price:0,  status:"occupied", notes:"Included (1st garage)"},
    {id:"G39", tenant:"Jazmine Myers",       unit:"7713-2", price:50, status:"occupied", notes:"2nd garage – $50/mo"},
    {id:"G35", tenant:"Abbigale A. Hellevang",unit:"7713-3",price:0, status:"occupied", notes:"Included (1st garage)"},
    {id:"G40", tenant:"Abbigale A. Hellevang",unit:"7713-3",price:50,status:"occupied", notes:"2nd garage – $50/mo"},
    {id:"G44", tenant:"Jennifer Bickett",    unit:"7717-2", price:0,  status:"occupied", notes:"Included (1st garage)"},
    {id:"G45", tenant:"Jennifer Bickett",    unit:"7717-2", price:50, status:"occupied", notes:"2nd garage – $50/mo"},
    {id:"G49", tenant:"Tim J. Thorne",       unit:"7721-1", price:0,  status:"occupied", notes:"Included (1st garage)"},
    {id:"G50", tenant:"Tim J. Thorne",       unit:"7721-1", price:50, status:"occupied", notes:"2nd garage – $50/mo"},
    {id:"G29", tenant:"Matthew R. Ireland",  unit:"7721-2", price:0,  status:"occupied", notes:"Included (1st garage)"},
    {id:"G51", tenant:"Matthew R. Ireland",  unit:"7721-2", price:50, status:"occupied", notes:"2nd garage – $50/mo"},
    {id:"G59", tenant:"Roxanne Tschudy",     unit:"7801-4", price:0,  status:"occupied", notes:"Included (1st garage)"},
    {id:"G60", tenant:"Roxanne Tschudy",     unit:"7801-4", price:50, status:"occupied", notes:"2nd garage – $50/mo"},
    {id:"G61", tenant:"Ariane Devine",       unit:"7805-1", price:0,  status:"occupied", notes:"Included (1st garage)"},
    {id:"G62", tenant:"Ariane Devine",       unit:"7805-1", price:50, status:"occupied", notes:"2nd garage – $50/mo"},
    {id:"G68", tenant:"Haley G. Leisinger",  unit:"7809-2", price:0,  status:"occupied", notes:"Included (1st garage)"},
    {id:"G69", tenant:"Haley G. Leisinger",  unit:"7809-2", price:50, status:"occupied", notes:"2nd garage – $50/mo"},
    // Atkisson triple with individual prices
    {id:"G72", tenant:"Robert Atkisson",     unit:"7813-4", price:50, status:"occupied"},
    {id:"G77", tenant:"Robert Atkisson",     unit:"7813-4", price:50, status:"occupied"},
    {id:"G78", tenant:"Robert Atkisson",     unit:"7813-4", price:0,  status:"occupied", notes:"Included in rent"},
    // vacant
    {id:"G1",  status:"vacant"},{id:"G2",  status:"vacant"},{id:"G3",  status:"vacant"},
    {id:"G4",  status:"vacant"},{id:"G5",  status:"vacant"},{id:"G6",  status:"vacant"},
    {id:"G7",  status:"vacant"},{id:"G8",  status:"vacant"},{id:"G9",  status:"vacant"},
    {id:"G10", status:"vacant"},{id:"G11", status:"vacant"},{id:"G12", status:"vacant"},
    {id:"G15", status:"vacant"},{id:"G16", status:"vacant"},{id:"G17", status:"vacant"},
    {id:"G18", status:"vacant"},{id:"G19", status:"vacant"},{id:"G20", status:"vacant"},
    {id:"G21", status:"vacant"},{id:"G25", status:"vacant"},{id:"G27", status:"vacant"},
    {id:"G28", status:"vacant"},{id:"G31", status:"vacant"},{id:"G32", status:"vacant"},
    {id:"G34", status:"vacant"},{id:"G36", status:"vacant"},{id:"G41", status:"vacant"},
    {id:"G43", status:"vacant"},{id:"G46", status:"vacant"},{id:"G47", status:"vacant"},
    {id:"G48", status:"vacant"},{id:"G52", status:"vacant"},{id:"G54", status:"vacant"},
    {id:"G56", status:"vacant"},{id:"G57", status:"vacant"},{id:"G63", status:"vacant"},
    {id:"G64", status:"vacant"},{id:"G65", status:"vacant"},{id:"G66", status:"vacant"},
    {id:"G67", status:"vacant"},{id:"G71", status:"vacant"},{id:"G73", status:"vacant"},
    {id:"G74", status:"vacant"},{id:"G76", status:"vacant"},
  ]
},

// ── COPPERLEAF ─────────────────────────────────────────────────────────────
"Copperleaf": { total: 14, revenue: 520,
  garages: [
    {id:"G1",  tenant:"Maintenance",       price:0,  status:"mgmt_hold", notes:"Management Hold"},
    {id:"G2",  tenant:"Luís Pena",         unit:"4216-38", price:65, status:"occupied"},
    {id:"G3",  status:"vacant"},
    {id:"G4",  tenant:"Jeffrey Nisley",    unit:"4216-57", price:65, status:"occupied"},
    {id:"G5",  tenant:"Neilyn Quintanilla",unit:"4206-22", price:65, status:"occupied"},
    {id:"G6",  tenant:"Gwendolyn Summers", unit:"4216-39", price:65, status:"occupied"},
    {id:"G7",  status:"vacant"},
    {id:"G8",  tenant:"Carlos Rivera",     unit:"4206-18", price:65, status:"occupied"},
    {id:"G9",  tenant:"Evelyn Benard",     unit:"4216-37", price:65, status:"occupied"},
    {id:"G10", tenant:"Nolan Kelt",        unit:"4226-76", price:65, status:"occupied"},
    {id:"G11", tenant:"Milton Peterson",   unit:"4206-19", price:65, status:"occupied"},
    {id:"G12", tenant:"Terrence Smith",    unit:"4206-31", price:65, status:"occupied"},
    {id:"G13", tenant:"Maintenance",       price:0,  status:"mgmt_hold", notes:"Management Hold"},
    {id:"G14", tenant:"Kevin Brooks",      unit:"4216-42", price:65, status:"occupied"},
  ]
},

// ── JUDEE ESTATES ──────────────────────────────────────────────────────────
// All garages included in rent — $0 additional charge
"Judee Estates": { total: 60, revenue: 0,
  garages: [
    {id:"G1701-1", tenant:"Tiffany Tysdal",      unit:"1701-1", price:0, status:"occupied", notes:"Included in rent"},
    {id:"G1701-2", tenant:"Dawn Shields",         unit:"1701-2", price:0, status:"occupied", notes:"Included in rent"},
    {id:"G1701-3", tenant:"Angela Bostater",      unit:"1701-3", price:0, status:"occupied", notes:"Included in rent"},
    {id:"G1701-4", tenant:"Danaka Rodriguez",     unit:"1701-4", price:0, status:"occupied", notes:"Included in rent"},
    {id:"G1705-1", tenant:"Mike Martin",          unit:"1705-1", price:0, status:"occupied", notes:"Included in rent"},
    {id:"G1705-2", tenant:"Jeanne M. Josten",     unit:"1705-2", price:0, status:"occupied", notes:"Included in rent"},
    {id:"G1705-3", tenant:"Caitlin M. Schwarz",   unit:"1705-3", price:0, status:"occupied", notes:"Included in rent"},
    {id:"G1705-4", tenant:"Viyada Thammakesy",    unit:"1705-4", price:0, status:"occupied", notes:"Included in rent"},
    ...Array.from({length:52},(_,i)=>({id:`G-V${i+1}`, status:"vacant"}))
  ]
},

// ── MAPLE PARK ─────────────────────────────────────────────────────────────
// Glenda Ashcroft: G7 & G12 = $130 total ($65 each)
// Milton Bolvito: G9 & G10 = $130 total ($65 each)
// Aroldo Moises: G2 & G3 = $130 total ($65 each)
// Larry Gotch G6 & Philip Davis G1: not in lease, not charged — excluded
// Rachel Abbas: "2600-G4" — non-standard ID, included at $0
// Aimee Burgess G11: noted "free" — $0
// Robert Klutch G13: $0
"Maple Park Apartments": { total: 38, revenue: 1300,
  garages: [
    {id:"G2",  tenant:"Aroldo Moises",      unit:"2601-302", price:65,  status:"occupied", notes:"Double G2+G3, $65 each"},
    {id:"G3",  tenant:"Aroldo Moises",      unit:"2601-302", price:65,  status:"occupied", notes:"Double G2+G3, $65 each"},
    {id:"G5",  tenant:"Derrick Veurink",    unit:"2601-101", price:65,  status:"occupied"},
    {id:"G7",  tenant:"Glenda Ashcroft",    unit:"2601-101", price:65,  status:"occupied", notes:"Double G7+G12, $65 each"},
    {id:"G8",  tenant:"Joshua B. Donahoe", unit:"2601-101", price:65,  status:"occupied"},
    {id:"G8B", tenant:"Workine Chage",      unit:"2601-208", price:65,  status:"occupied"},
    {id:"G8C", tenant:"Christopher DeLeon", unit:"2701-308", price:65,  status:"occupied"},
    {id:"G9",  tenant:"Milton Bolvito",     unit:"2601-101", price:65,  status:"occupied", notes:"Double G9+G10, $65 each"},
    {id:"G9B", tenant:"Frank Huerta",       unit:"2701-208", price:65,  status:"occupied"},
    {id:"G10", tenant:"Milton Bolvito",     unit:"2601-101", price:65,  status:"occupied", notes:"Double G9+G10, $65 each"},
    {id:"G10B",tenant:"Jerrod Atkinson",    unit:"2601-101", price:65,  status:"occupied"},
    {id:"G11", tenant:"Aimee Burgess",      unit:"2601-101", price:0,   status:"occupied", notes:"Free per lease"},
    {id:"G11B",tenant:"Joshua Dutcher",     unit:"2601-305", price:65,  status:"occupied"},
    {id:"G12", tenant:"Glenda Ashcroft",    unit:"2601-101", price:65,  status:"occupied", notes:"Double G7+G12, $65 each"},
    {id:"G13", tenant:"Deidree Blacksmith", unit:"2601-101", price:65,  status:"occupied"},
    {id:"G13B",tenant:"Robert Klutch",      unit:"2701-302", price:0,   status:"occupied", notes:"$0 per lease"},
    {id:"G18", tenant:"Jonathan Kaufmann",  unit:"2701-108", price:65,  status:"occupied"},
    {id:"G21", tenant:"Conner Brand",       unit:"2601-102", price:65,  status:"occupied"},
    {id:"G23", tenant:"Berkeley Donohue",   unit:"2601-304", price:65,  status:"occupied"},
    {id:"G4",  tenant:"Rachel Abbas",       unit:"2601-101", price:0,   status:"occupied", notes:"2600-G4 per lease, not formally charged"},
    {id:"G7B", tenant:"William Metheny",    unit:"2601-201", price:65,  status:"occupied"},
    {id:"G1",  status:"vacant", notes:"Noted in lease but not charged"},
    {id:"G6",  status:"vacant", notes:"Noted in lease but not charged"},
    {id:"G14", status:"vacant"},{id:"G15", status:"vacant"},{id:"G16", status:"vacant"},
    {id:"G17", status:"vacant"},{id:"G19", status:"vacant"},{id:"G20", status:"vacant"},
    {id:"G22", status:"vacant"},{id:"G24", status:"vacant"},{id:"G25", status:"vacant"},
  ]
},

// ── SIERRA GARDENS ─────────────────────────────────────────────────────────
"Sierra Gardens": { total: 23, revenue: 25,
  garages: [
    {id:"Carport 11",  status:"vacant"},
    {id:"Carport 26",  tenant:"Perez",               unit:"1323", price:null, status:"occupied", notes:"2nd vehicle"},
    {id:"Carport 27",  tenant:"Perez",               unit:"1323", price:null, status:"occupied"},
    {id:"Carport 28",  tenant:"Garcia-Gutierrez",    unit:"723",  price:null, status:"occupied"},
    {id:"Carport 52",  tenant:"Micah Paul",          unit:"100",  price:null, status:"occupied"},
    {id:"Carport 69",  tenant:"Bobby Tate",          unit:"106",  price:null, status:"occupied"},
    {id:"Carport 71",  tenant:"Whatley",             unit:"111",  price:null, status:"occupied"},
    {id:"Carport 82",  tenant:"Robert Carroll",      unit:"72",   price:25,   status:"occupied"},
    {id:"Carport 83",  tenant:"Stephen Parker",      unit:"116",  price:null, status:"occupied"},
    {id:"Carport 88",  tenant:"Carpenter",           unit:"15",   price:null, status:"occupied"},
    {id:"Carport 136", tenant:"Sebastian Ososky",    unit:"41",   price:null, status:"occupied"},
    {id:"Carport 138", tenant:"Ogletree",            unit:"35",   price:null, status:"occupied"},
    {id:"Carport 139", tenant:"Catalanotto",         unit:"40",   price:null, status:"occupied"},
    {id:"Carport 144", tenant:"Davis",               unit:"49",   price:null, status:"occupied"},
    {id:"Carport 147", tenant:"Smith",               unit:"9",    price:null, status:"occupied"},
    {id:"Carport 149", tenant:"Weathered",           unit:"25",   price:null, status:"occupied"},
    {id:"Space 36",    tenant:"Daniela Martinez",    unit:"1001", price:null, status:"occupied"},
    {id:"Space 40",    tenant:"Hamilton",            unit:"86",   price:null, status:"occupied"},
    {id:"Space 45",    tenant:"Higginbotham",        unit:"93",   price:null, status:"occupied"},
    {id:"Space 51",    tenant:"Ezukanm",             unit:"104W", price:null, status:"occupied"},
    {id:"Space 72",    tenant:"Robert Carroll",      unit:"109",  price:null, status:"occupied"},
    {id:"Space 107",   tenant:"Monrrial",            unit:"10",   price:null, status:"occupied"},
    {id:"Space 140",   tenant:"Dominguez",           unit:"45",   price:null, status:"occupied"},
  ]
},

// ── STONEYBROOK ────────────────────────────────────────────────────────────
// Cynthia Cruz-Valenzuela moved from waitlist → active tenant G7
"Stoneybrook Apartments": { total: 8, total_storage: 4, revenue: 510,
  garages: [
    {id:"G-1", tenant:"Maintenance",              price:0,   status:"mgmt_hold", notes:"Management Hold – not empty"},
    {id:"G-2", tenant:"Maintenance",              price:0,   status:"mgmt_hold", notes:"Management Hold"},
    {id:"G-3", tenant:"Roscoe Ortiz",             unit:"2755-3", price:100, status:"occupied"},
    {id:"G-4", tenant:"Hanson/Osborn",            price:55,  status:"occupied", non_resident:true, notes:"Non-resident"},
    {id:"G-5", tenant:"Braden Carney",            unit:"2816-4", price:100, status:"occupied"},
    {id:"G-6", tenant:"Sandy Hudspeth",           price:50,  status:"occupied", non_resident:true, notes:"Non-resident"},
    {id:"G-7", tenant:"Cynthia Cruz-Valenzuela",  unit:"2812-1", price:100, status:"occupied", notes:"Moved from waitlist"},
    {id:"G-8", tenant:"Tim Logan",                price:0,   status:"occupied", non_resident:true, notes:"Non-resident – $0/mo"},
  ],
  storage: [
    {id:"S-1", tenant:"Rosa Arambula",   unit:"2806-3", price:50,  status:"occupied"},
    {id:"S-2", tenant:"Office",          price:0,  status:"mgmt_hold", notes:"Management Hold – office use"},
    {id:"S-3", tenant:"Alfonso Orozco",  unit:"2802-2", price:25,  status:"occupied"},
    {id:"S-4", tenant:"Rose Alvarez",    unit:"2808-1", price:50,  status:"occupied"},
  ],
  waitlist: [
    {name:"Danielle Clark",    unit:"2756-3",  type:"Garage/Storage", date:"2025-03-18"},
    {name:"Brandon Montiel",   unit:"2755-1",  type:"Garage",         date:"2025-03-29"},
    {name:"Mark Towey",        unit:"2808-4",  type:"Garage",         date:"2025-05-20"},
    {name:"Steven Harris",     unit:"2749-2",  type:"Garage",         date:"2025-07-09"},
  ]
},

// ── TALL OAKS ──────────────────────────────────────────────────────────────
// Paul Bricker now confirmed at 7015-G5 $100 (replaces Monica Camacho flag)
// Robert Perillo: G4 $75 + G1 $0 (second space)
"Tall Oaks": { total: 27, revenue: 1515,
  garages: [
    {id:"7001-G1", tenant:"Becky Robertson",    price:null, status:"occupied", non_resident:true, notes:"Non-resident – rate unconfirmed"},
    {id:"7001-G2", tenant:"PGM Maintenance",    price:0,   status:"mgmt_hold", notes:"Management Hold"},
    {id:"7001-G3", tenant:"Nancy Olson",         unit:"7001-D",  price:100, status:"occupied"},
    {id:"7005-G1", tenant:"Cody Smith",          unit:"7005-C",  price:100, status:"occupied"},
    {id:"7005-G2", tenant:"PGM Maintenance",     price:0,   status:"mgmt_hold", notes:"Management Hold"},
    {id:"7005-G3", tenant:"Thomas Wurtenberger", price:150, status:"occupied", non_resident:true, notes:"Non-resident"},
    {id:"7005-G4", tenant:"Thomas Wurtenberger", price:150, status:"occupied", non_resident:true, notes:"Non-resident"},
    {id:"7005-G5", tenant:"Michael Cahill",      unit:"7101-G",  price:100, status:"occupied"},
    {id:"7005-G6", tenant:"Jennifer Mwai",       unit:"7005-D",  price:75,  status:"occupied"},
    {id:"7009-G1", tenant:"Rick Scarborough",    price:75,  status:"occupied", non_resident:true, notes:"Non-resident"},
    {id:"7009-G2", tenant:"Rick Scarborough",    price:75,  status:"occupied", non_resident:true, notes:"Non-resident"},
    {id:"7009-G3", tenant:"Rick Scarborough",    price:75,  status:"occupied", non_resident:true, notes:"Non-resident"},
    {id:"7009-G4", tenant:"Robert Perillo",      unit:"7009-D",  price:75,  status:"occupied"},
    {id:"7009-G5", tenant:"Rick Scarborough",    price:0,   status:"occupied", non_resident:true, notes:"Non-resident – free"},
    {id:"7009-G6", tenant:"Jessica Clampitt",    unit:"7103-H",  price:75,  status:"occupied"},
    {id:"7013-G1", tenant:"Jermira Murray",      unit:"7013-C",  price:75,  status:"occupied", notes:"Until 5/31/2026"},
    {id:"7013-G2", tenant:"Matthew Bartram",     unit:"7013-E",  price:100, status:"occupied"},
    {id:"7013-G3", tenant:"Marcia Dotson",       unit:"7013-F",  price:100, status:"occupied"},
    {id:"7013-G4", tenant:"Doug Prewitt",        unit:"7101-H",  price:70,  status:"occupied"},
    {id:"7013-G5", tenant:"David Kliewer",       unit:"7015-B",  price:90,  status:"occupied"},
    {id:"7013-G6", tenant:"James Foley",         unit:"7013-F",  price:100, status:"occupied"},
    {id:"7015-G1", tenant:"Robert Perillo",      unit:"7009-D",  price:0,   status:"occupied", notes:"2nd space – included"},
    {id:"7015-G2", tenant:"Doug Prewitt",        unit:"7101-H",  price:70,  status:"occupied"},
    {id:"7015-G3", tenant:"James Ruth",          price:150, status:"occupied", non_resident:true, notes:"Non-resident"},
    {id:"7015-G4", tenant:"Gina Gomez",          unit:"7015-D",  price:100, status:"occupied"},
    {id:"7015-G5", tenant:"Paul Bricker",        unit:"7015-E",  price:100, status:"occupied"},
    {id:"7015-G6", tenant:"Hannah Hunt",         unit:"7105-F",  price:100, status:"occupied"},
  ]
},

// ── THE PRESERVE ───────────────────────────────────────────────────────────
// Christopher Smith 4101-4 has TWO garages: Bldg 4101-G4 AND Bldg 4009-G3
// Decarlos Brooks 4105-6: Bldg 4201-G6 at $65/mo (only one with confirmed price)
// Note: Emma Kelly 4105-3 also listed at Bldg 4201-G6 — possible conflict flagged
"The Preserve": { total: 78, revenue: 65,
  garages: [
    {id:"Bldg 100-G2",  tenant:"Spencer Drovdal",          unit:"100-31", price:null, status:"occupied"},
    {id:"Bldg 100-G3",  tenant:"Joan Neilan",              unit:"100-30", price:null, status:"occupied"},
    {id:"Bldg 100-G4",  tenant:"Ashely Nielson",           unit:"100-29", price:null, status:"occupied"},
    {id:"Bldg 100-G5",  tenant:"Jack Cunningham",          unit:"100-25", price:null, status:"occupied"},
    {id:"Bldg 100-G6",  tenant:"Abigail Rhodes",           unit:"100-32", price:null, status:"occupied"},
    {id:"Bldg 100-G7",  tenant:"Linn Crowser",             unit:"100-26", price:null, status:"occupied"},
    {id:"Bldg 100-G8",  tenant:"Trista Linder",            unit:"100-27", price:null, status:"occupied"},
    {id:"Bldg 100-G1",  status:"vacant"},
    {id:"Bldg 116-G1",  tenant:"Addison K. Drovdal",       unit:"116-39", price:null, status:"occupied"},
    {id:"Bldg 116-G2",  tenant:"Paige Wilts",              unit:"116-34", price:null, status:"occupied"},
    {id:"Bldg 116-G3",  tenant:"Laurel Trautwein",         unit:"116-37", price:null, status:"occupied"},
    {id:"Bldg 116-G4",  tenant:"Billie Mondloch",          unit:"116-40", price:null, status:"occupied"},
    {id:"Bldg 116-G5",  tenant:"Stefany Colomo Gonzalez",  unit:"116-33", price:null, status:"occupied"},
    {id:"Bldg 116-G8",  tenant:"Logan J. Mcpadden",        unit:"116-38", price:null, status:"occupied"},
    {id:"Bldg 116-G6",  status:"vacant"},{id:"Bldg 116-G7", status:"vacant"},
    {id:"Bldg 117-G1",  tenant:"Dawson Slendy",            unit:"117-49", price:null, status:"occupied"},
    {id:"Bldg 117-G2",  tenant:"Autumn Lerew",             unit:"117-53", price:null, status:"occupied"},
    {id:"Bldg 117-G3",  tenant:"Stephanie Muilenburg",     unit:"117-51", price:null, status:"occupied"},
    {id:"Bldg 117-G4",  tenant:"Samuel Gilkerson",         unit:"117-56", price:null, status:"occupied"},
    {id:"Bldg 117-G5",  tenant:"Markcus Williams",         unit:"117-50", price:null, status:"occupied"},
    {id:"Bldg 117-G6",  tenant:"Kristin Schulte",          unit:"117-55", price:null, status:"occupied"},
    {id:"Bldg 117-G7",  status:"vacant"},{id:"Bldg 117-G8", status:"vacant"},
    {id:"Bldg 133-G3",  tenant:"Kelsey B. Lynch",          unit:"133-42", price:null, status:"occupied"},
    {id:"Bldg 133-G4",  tenant:"Joan Barry",               unit:"133-47", price:null, status:"occupied"},
    {id:"Bldg 133-G6",  tenant:"Roger Richter",            unit:"133-46", price:null, status:"occupied"},
    {id:"Bldg 133-G8",  tenant:"Leila Knouse",             unit:"133-41", price:null, status:"occupied"},
    {id:"Bldg 133-G1",  status:"vacant"},{id:"Bldg 133-G2", status:"vacant"},
    {id:"Bldg 4009-G1", tenant:"Besy O. Diaz",             unit:"4101-8", price:null, status:"occupied"},
    {id:"Bldg 4009-G2", tenant:"Andrew M. Leacraft",       unit:"4009-2", price:null, status:"occupied"},
    {id:"Bldg 4009-G3", tenant:"James Swanson / C. Smith", unit:"4009-4", price:null, status:"occupied", notes:"Shared: James Swanson (4009-4) & Christopher Smith (4101-4)"},
    {id:"Bldg 4009-G4", tenant:"Rory N. Fox",              unit:"4009-7", price:null, status:"occupied"},
    {id:"Bldg 4009-G6", tenant:"Joseph Leimbach",          unit:"4009-5", price:null, status:"occupied"},
    {id:"Bldg 4009-G7", tenant:"Joseph G. Mastroianni",    unit:"4009-1", price:null, status:"occupied"},
    {id:"Bldg 4009-G5", status:"vacant"},{id:"Bldg 4009-G8", status:"vacant"},
    {id:"Bldg 4101-G1", tenant:"Lindsey J. Lothrop",       unit:"4101-6", price:null, status:"occupied"},
    {id:"Bldg 4101-G2", tenant:"Marvin Darryl Y. Basco",   unit:"4101-3", price:null, status:"occupied"},
    {id:"Bldg 4101-G3", tenant:"Kenneth Anglin",           unit:"4101-1", price:null, status:"occupied"},
    {id:"Bldg 4101-G4", tenant:"Christopher Smith",        unit:"4101-4", price:null, status:"occupied", notes:"Also has Bldg 4009-G3"},
    {id:"Bldg 4101-G5", tenant:"Jacob Ellefson",           unit:"4009-8", price:null, status:"occupied"},
    {id:"Bldg 4101-G6", tenant:"Heidi Namken",             unit:"4101-7", price:null, status:"occupied"},
    {id:"Bldg 4105-G1", tenant:"Tanika White",             unit:"4101-2", price:null, status:"occupied"},
    {id:"Bldg 4105-G3", tenant:"Scott Fitzgerald",         unit:"4105-1", price:null, status:"occupied"},
    {id:"Bldg 4105-G4", tenant:"Brandon S. Schweitzer",    unit:"4105-5", price:null, status:"occupied"},
    {id:"Bldg 4105-G5", tenant:"Elizabeth J. Davelaar",    unit:"4105-4", price:null, status:"occupied"},
    {id:"Bldg 4105-G7", tenant:"Seth Woodford",            unit:"4105-6", price:null, status:"occupied"},
    {id:"Bldg 4105-G8", tenant:"Christopher Becker",       unit:"4105-8", price:null, status:"occupied"},
    {id:"Bldg 4201-G1", tenant:"Cayden R. Tollefson",      unit:"4201-6", price:null, status:"occupied"},
    {id:"Bldg 4201-G2", tenant:"Brenna Napier-Dwyer",      unit:"4201-1", price:null, status:"occupied"},
    {id:"Bldg 4201-G3", tenant:"Johnmichael Paradise",     unit:"4201-2", price:null, status:"occupied"},
    {id:"Bldg 4201-G4", tenant:"Jacqueline Bouthot",       unit:"4201-8", price:null, status:"occupied"},
    {id:"Bldg 4201-G5", tenant:"Nicole M. Madison",        unit:"4201-7", price:null, status:"occupied"},
    {id:"Bldg 4201-G6", tenant:"Decarlos Brooks",          unit:"4105-6", price:65,   status:"occupied", notes:"$65/mo confirmed. Emma Kelly also listed here — verify."},
    {id:"Bldg 4201-G7", tenant:"Michele M. Deharty",       unit:"4201-3", price:null, status:"occupied"},
    {id:"Bldg 4201-G8", tenant:"Stacie White",             unit:"4201-4", price:null, status:"occupied"},
    {id:"Bldg 4205-G1", tenant:"Jeremy Castle",            unit:"4205-4", price:null, status:"occupied"},
    {id:"Bldg 4205-G2", tenant:"Arlina Buliche",           unit:"4205-1", price:null, status:"occupied"},
    {id:"Bldg 4205-G3", tenant:"Marcus Mollberg",          unit:"4205-5", price:null, status:"occupied"},
    {id:"Bldg 4205-G4", tenant:"Todd Balzer",              unit:"4205-3", price:null, status:"occupied"},
    {id:"Bldg 4205-G5", tenant:"Thomas A. Grandy",         unit:"4205-2", price:null, status:"occupied"},
    {id:"Bldg 4205-G6", tenant:"Michelle Fischer",         unit:"4205-6", price:null, status:"occupied"},
    {id:"Bldg 4205-G7", tenant:"Rawhide S. Hulit",         unit:"4205-7", price:null, status:"occupied"},
    {id:"Bldg 4205-G8", tenant:"Amanda Anderson-Schager",  unit:"4205-8", price:null, status:"occupied"},
  ]
},

// ── VILLA BLANCA ───────────────────────────────────────────────────────────
// Coleen Bockelmann REMOVED — Dale McGregor replaced on all 3 (G19, G20, G21)
"Villa Blanca Apartments": { total: 24, revenue: 185,
  garages: [
    {id:"G7",  tenant:"Dion Cribbs",    unit:"2706-7",  price:35, status:"occupied"},
    {id:"G10", tenant:"Eric Glenn",     unit:"2706-10", price:50, status:"occupied"},
    {id:"G12", tenant:"Darryl Frazier", unit:"2706-12", price:50, status:"occupied"},
    {id:"G19", tenant:"Dale McGregor",  unit:"2706-1",  price:50, status:"occupied"},
    {id:"G20", tenant:"Dale McGregor",  unit:"2706-1",  price:50, status:"occupied", notes:"G19+G20+G21, $50 each"},
    {id:"G21", tenant:"Dale McGregor",  unit:"2706-1",  price:50, status:"occupied", notes:"G19+G20+G21, $50 each"},
    {id:"G17", status:"vacant", notes:"Verify: Debra Jones was paying $50/mo"},
    {id:"G1",  status:"vacant"},{id:"G2",  status:"vacant"},{id:"G3",  status:"vacant"},
    {id:"G4",  status:"vacant"},{id:"G5",  status:"vacant"},{id:"G6",  status:"vacant"},
    {id:"G8",  status:"vacant"},{id:"G9",  status:"vacant"},{id:"G11", status:"vacant"},
    {id:"G13", status:"vacant"},{id:"G14", status:"vacant"},{id:"G15", status:"vacant"},
    {id:"G16", status:"vacant"},{id:"G18", status:"vacant"},{id:"G22", status:"vacant"},
    {id:"G23", status:"vacant"},{id:"G24", status:"vacant"},
  ]
},

// ── BRENT VILLAGE ──────────────────────────────────────────────────────────
// G51/56/57 now VACANT (Greg Hilgendorf — Past lease confirmed)
// All multi-garage pricing corrected per "$X/ea" logic
// Jody Crews G45+G46 = $90 total (no "each" = total per your rule)
// Ramon Garcia G21+G73 = no price listed
// Suzanne Richards G1+G2 = $55 each = $110/mo
"Brent Village": { total: 87, revenue: 3052,
  garages: [
    {id:"G1",  tenant:"Suzanne Richards",     unit:"1510-177", price:55,  status:"occupied", notes:"$55 each (G1+G2)"},
    {id:"G2",  tenant:"Suzanne Richards",     unit:"1510-177", price:55,  status:"occupied", notes:"$55 each (G1+G2)"},
    {id:"G3",  tenant:"Michael Leonard",      unit:"1506-4",   price:55,  status:"occupied"},
    {id:"G4",  tenant:"Jarad Shively",        unit:"1502-29",  price:55,  status:"occupied"},
    {id:"G5",  tenant:"Arlet Martell Sanchez",unit:"1504-15",  price:85,  status:"occupied"},
    {id:"G6",  tenant:"Mary Kline",           unit:"1502-31",  price:55,  status:"occupied"},
    {id:"G7",  tenant:"Ricky Graef",          unit:"1506-9",   price:85,  status:"occupied"},
    {id:"G8",  tenant:"Non-resident (unidentified)", price:null, status:"occupied", non_resident:true, notes:"Non-resident – ID needed"},
    {id:"G9",  tenant:"Non-resident (unidentified)", price:null, status:"occupied", non_resident:true, notes:"Non-resident – ID needed"},
    {id:"G10", tenant:"Donald Mabe",          unit:"1502-28",  price:65,  status:"occupied"},
    {id:"G11", tenant:"Leticia-Ann Purvis",   unit:"1502-27",  price:85,  status:"occupied", notes:"$85 each (G11+G12)"},
    {id:"G12", tenant:"Leticia-Ann Purvis",   unit:"1502-27",  price:85,  status:"occupied", notes:"$85 each (G11+G12)"},
    {id:"G13", tenant:"Kimberly Clupny",      unit:"1406-52",  price:0,   status:"occupied", notes:"Included in rent"},
    {id:"G14", tenant:"Idel Morales",         unit:"1504-13",  price:0,   status:"occupied", notes:"Included in rent"},
    {id:"G15", tenant:"Destiny Wenck",        unit:"1501-143", price:55,  status:"occupied"},
    {id:"G17", tenant:"Roshelly Rivas",       unit:"1504-23",  price:85,  status:"occupied"},
    {id:"G18", tenant:"Malinda Ramos",        unit:"1408-44",  price:85,  status:"occupied"},
    {id:"G21", tenant:"Ramon Garcia",         unit:"1506-3",   price:0,   status:"occupied", notes:"Price not listed in lease"},
    {id:"G22", tenant:"Geordanis Labrada",    unit:"1406-49",  price:70,  status:"occupied", notes:"$70 each (G22+G24)"},
    {id:"G23", tenant:"Jeff Long",            unit:"1406-57",  price:55,  status:"occupied"},
    {id:"G24", tenant:"Geordanis Labrada",    unit:"1406-49",  price:70,  status:"occupied", notes:"$70 each (G22+G24)"},
    {id:"G27", tenant:"Management",          price:0,  status:"mgmt_hold", notes:"Management Hold – Storage"},
    {id:"G30", tenant:"Management",          price:0,  status:"mgmt_hold", notes:"Management Hold – Shop"},
    {id:"G31", tenant:"Management",          price:0,  status:"mgmt_hold", notes:"Management Hold – Shop"},
    {id:"G32", tenant:"Scott Burkhart",       unit:"1404-67",  price:55,  status:"occupied"},
    {id:"G33", tenant:"Brenda Bostic",        unit:"1408-43",  price:0,   status:"occupied", notes:"Included in rent"},
    {id:"G34", tenant:"Justin Fester",        unit:"1404-72",  price:55,  status:"occupied"},
    {id:"G36", tenant:"Karen Anderson",       unit:"1402-82",  price:40,  status:"occupied", notes:"$40 each (G36+G63)"},
    {id:"G40", tenant:"Berlin Rivera",        unit:"1404-62",  price:50,  status:"occupied"},
    {id:"G41", tenant:"Alex Rodriguez",       unit:"1403-97",  price:70,  status:"occupied"},
    {id:"G43", tenant:"Kenneth Cook",         unit:"1405-120", price:55,  status:"occupied"},
    {id:"G44", tenant:"Andrew Doxey",         unit:"1403-107", price:55,  status:"occupied"},
    {id:"G45", tenant:"Jody Crews",           unit:"1402-77",  price:45,  status:"occupied", notes:"$90 total for G45+G46 ($45 each)"},
    {id:"G46", tenant:"Jody Crews",           unit:"1402-77",  price:45,  status:"occupied", notes:"$90 total for G45+G46 ($45 each)"},
    {id:"G47", tenant:"Jayc Knight Rezac",    unit:"1403-105", price:65,  status:"occupied", notes:"$65 each (G47+G59)"},
    {id:"G49", tenant:"Stephanie Fink",       unit:"1400-96",  price:65,  status:"occupied"},
    {id:"G50", tenant:"Karen Velasquez",      unit:"1404-66",  price:55,  status:"occupied"},
    {id:"G51", status:"vacant", notes:"Previously Greg Hilgendorf – Past lease"},
    {id:"G52", tenant:"Jerick Quiambao",      unit:"1403-108", price:65,  status:"occupied"},
    {id:"G53", tenant:"Leonard Meredith",     unit:"1406-53",  price:55,  status:"occupied"},
    {id:"G54", tenant:"David Lee Patterson",  unit:"1400-88",  price:70,  status:"occupied"},
    {id:"G55", tenant:"Johnathan Poindexter", unit:"1407-131", price:55,  status:"occupied"},
    {id:"G56", status:"vacant", notes:"Previously Greg Hilgendorf – Past lease"},
    {id:"G57", status:"vacant", notes:"Previously Greg Hilgendorf – Past lease"},
    {id:"G59", tenant:"Jayc Knight Rezac",    unit:"1403-105", price:65,  status:"occupied", notes:"$65 each (G47+G59)"},
    {id:"G60", tenant:"Peggy Hansen",         unit:"1407-124", price:35,  status:"occupied", notes:"$35 each (G60+G61+G62)"},
    {id:"G61", tenant:"Peggy Hansen",         unit:"1407-124", price:35,  status:"occupied", notes:"$35 each (G60+G61+G62)"},
    {id:"G62", tenant:"Peggy Hansen",         unit:"1407-124", price:35,  status:"occupied", notes:"$35 each (G60+G61+G62)"},
    {id:"G63", tenant:"Karen Anderson",       unit:"1402-82",  price:40,  status:"occupied", notes:"$40 each (G36+G63)"},
    {id:"G64", tenant:"Mahmoud Hendawi",      unit:"1501-144", price:55,  status:"occupied"},
    {id:"G65", tenant:"Marlenne Moreno",      unit:"1503-156", price:70,  status:"occupied"},
    {id:"G66", tenant:"Marissa Kisler",       unit:"1503-146", price:85,  status:"occupied", notes:"$85 each (G66+G68)"},
    {id:"G67", tenant:"Sierra Cardenas",      unit:"1502-32",  price:48,  status:"occupied", notes:"$47.50 each (G67+G84)"},
    {id:"G68", tenant:"Marissa Kisler",       unit:"1503-146", price:85,  status:"occupied", notes:"$85 each (G66+G68)"},
    {id:"G69", tenant:"Dustin Bradley",       unit:"1502-25",  price:70,  status:"occupied"},
    {id:"G72", tenant:"Peter Chol",           unit:"1503-154", price:55,  status:"occupied"},
    {id:"G73", tenant:"Ramon Garcia",         unit:"1506-3",   price:0,   status:"occupied", notes:"Price not listed in lease"},
    {id:"G75", tenant:"Conor Haggerty",       unit:"1402-75",  price:0,   status:"occupied", notes:"Included in rent"},
    {id:"G77", tenant:"Brandy Graef",         unit:"1506-12",  price:85,  status:"occupied"},
    {id:"G78", tenant:"Kavin Cannon",         unit:"1508-159", price:70,  status:"occupied"},
    {id:"G79", tenant:"Charity Ayala",        unit:"1506-6",   price:65,  status:"occupied"},
    {id:"G80", tenant:"Sharon McCray",        unit:"1504-20",  price:30,  status:"occupied"},
    {id:"G84", tenant:"Sierra Cardenas",      unit:"1502-32",  price:48,  status:"occupied", notes:"$47.50 each (G67+G84)"},
    {id:"G86", tenant:"Diane Adkins",         unit:"1510-174", price:40,  status:"occupied"},
    // vacant
    {id:"G16", status:"vacant"},{id:"G19", status:"vacant"},{id:"G20", status:"vacant"},
    {id:"G25", status:"vacant"},{id:"G26", status:"vacant"},{id:"G28", status:"vacant"},
    {id:"G29", status:"vacant"},{id:"G35", status:"vacant"},{id:"G37", status:"vacant"},
    {id:"G38", status:"vacant"},{id:"G39", status:"vacant"},{id:"G42", status:"vacant"},
    {id:"G48", status:"vacant"},{id:"G58", status:"vacant"},{id:"G70", status:"vacant"},
    {id:"G71", status:"vacant"},{id:"G74", status:"vacant"},{id:"G76", status:"vacant"},
    {id:"G81", status:"vacant"},{id:"G82", status:"vacant"},{id:"G83", status:"vacant"},
    {id:"G85", status:"vacant"},{id:"G87", status:"vacant"},
  ]
},
};

// ── FLAGS ──────────────────────────────────────────────────────────────────
const FLAGS = [
  {prop:"Brent Village",        garage:"G8",           msg:"G8 & G9: Non-resident tenants – identities still unknown. Who are they?"},
  {prop:"Brent Village",        garage:"G9",           msg:"G8 & G9: Non-resident tenants – identities still unknown. Who are they?"},
  {prop:"Brent Village",        garage:"G21",          msg:"Ramon Garcia (G21+G73) has no price listed in lease. Confirm rate."},
  {prop:"Brent Village",        garage:"G73",          msg:"Ramon Garcia (G21+G73) has no price listed in lease. Confirm rate."},
  {prop:"Villa Blanca Apartments",garage:"G17",        msg:"G17 vacant – Debra Jones was paying $50/mo. Confirm still vacant."},
  {prop:"Judee Estates",        garage:null,           msg:"Only 8 of 60 garages confirmed occupied (all included in rent). Verify remaining units."},
  {prop:"Stoneybrook Apartments",garage:"G-1",         msg:"G-1 on Management Hold noted as 'not empty'. Still needed or available?"},
  {prop:"Stoneybrook Apartments",garage:"G-8",         msg:"Tim Logan (non-resident) paying $0/mo. Should this be charged or released?"},
  {prop:"The Preserve",         garage:"Bldg 4201-G6", msg:"Both Decarlos Brooks (4105-6) and Emma Kelly (4105-3) are listed at Bldg 4201-G6. Verify who actually has this garage."},
  {prop:"Tall Oaks",            garage:"7001-G1",      msg:"Becky Robertson (non-resident) – rate unconfirmed in lease report. Verify amount charged."},
];

const COLORS = {
  "Bancroft Place Apartments":"#e63946","Boulder Pointe Townhomes":"#7209b7",
  "Brent Village":"#f72585","Copperleaf":"#fb8500","Judee Estates":"#06d6a0",
  "Maple Park Apartments":"#f4d35e","Sierra Gardens":"#0096c7",
  "Stoneybrook Apartments":"#80b918","Tall Oaks":"#9b5de5",
  "The Preserve":"#f4a261","Villa Blanca Apartments":"#4cc9f0"
};

function getStats(d) {
  const g = d.garages || [];
  const s = d.storage || [];
  const total = d.total || g.length;
  const occ   = g.filter(x => x.status === "occupied").length;
  const mgmt  = g.filter(x => x.status === "mgmt_hold").length;
  const rev   = d.revenue || [...g,...s].filter(x=>x.price>0).reduce((a,x)=>a+(x.price||0),0);
  const nonRes= g.filter(x => x.non_resident).length;
  return { total, occ, mgmt, vacant: Math.max(0,total-occ-mgmt), rev, nonRes };
}

function OccBar({occ,mgmt,total,color}) {
  const op = total>0?(occ/total)*100:0;
  const mp = total>0?(mgmt/total)*100:0;
  return (
    <div style={{height:5,borderRadius:3,background:"#1e293b",overflow:"hidden",display:"flex"}}>
      <div style={{width:`${op}%`,background:color||"#22c55e"}}/>
      <div style={{width:`${mp}%`,background:"#f59e0b"}}/>
    </div>
  );
}

export default function App() {
  const [sel,setSel]           = useState(null);
  const [filter,setFilter]     = useState("all");
  const [search,setSearch]     = useState("");
  const [selGarage,setSelGarage] = useState(null);
  const [showUpload,setShowUpload] = useState(false);

  const propNames = Object.keys(DATA);

  const totals = useMemo(()=>{
    let total=0,occ=0,mgmt=0,rev=0,nonRes=0;
    propNames.forEach(p=>{const s=getStats(DATA[p]);total+=s.total;occ+=s.occ;mgmt+=s.mgmt;rev+=s.rev;nonRes+=s.nonRes;});
    return{total,occ,mgmt,vacant:total-occ-mgmt,rev,nonRes};
  },[]);

  const revenueData = useMemo(()=>
    propNames.map(p=>({name:p,rev:getStats(DATA[p]).rev,color:COLORS[p]}))
      .filter(x=>x.rev>0).sort((a,b)=>b.rev-a.rev)
  ,[]);

  const pd=sel?DATA[sel]:null, pg=pd?(pd.garages||[]):[], ps=pd?(pd.storage||[]):[], pw=pd?(pd.waitlist||[]):[];
  const pc=sel?(COLORS[sel]||"#3b82f6"):"#3b82f6";
  const pStats=pd?getStats(pd):{};
  const propFlags=sel?FLAGS.filter(f=>f.prop===sel):FLAGS;

  const filtered = useMemo(()=>{
    let g=pg;
    if(filter!=="all") g=g.filter(x=>x.status===filter);
    if(search){const q=search.toLowerCase();g=g.filter(x=>(x.tenant||"").toLowerCase().includes(q)||(x.id||"").toLowerCase().includes(q)||(x.unit||"").toLowerCase().includes(q));}
    return g;
  },[pg,filter,search]);

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#070f1a",minHeight:"100vh",color:"#f1f5f9"}}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1e293b}.gc:hover{opacity:.85;transform:translateY(-1px)}.pr:hover{background:#0f1f35!important}`}</style>

      {/* HEADER */}
      <div style={{background:"#050c17",borderBottom:"1px solid #0f1f35",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:9,letterSpacing:"0.2em",color:"#475569",textTransform:"uppercase"}}>Point Guard Management</div>
          <div style={{fontSize:18,fontWeight:800,letterSpacing:"-0.5px",marginTop:1}}>🚗 Garage Rental Tracker <span style={{fontSize:11,fontWeight:400,color:"#334155",marginLeft:6}}>v5 · Verified March 2026</span></div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {[["Total",totals.total,"#94a3b8"],["Occupied",totals.occ,"#22c55e"],["Mgmt Hold",totals.mgmt,"#f59e0b"],["Vacant",totals.vacant,"#f87171"],["Non-Res",totals.nonRes,"#a78bfa"]].map(([l,v,c])=>(
            <div key={l} style={{background:"#0a1628",border:"1px solid #0f1f35",borderRadius:8,padding:"6px 12px",textAlign:"center",minWidth:64}}>
              <div style={{fontSize:16,fontWeight:800,color:c}}>{v}</div>
              <div style={{fontSize:9,color:"#475569",textTransform:"uppercase",letterSpacing:"0.1em"}}>{l}</div>
            </div>
          ))}
          <div style={{background:"#0a1628",border:"1px solid #16a34a",borderRadius:8,padding:"6px 16px",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:800,color:"#4ade80"}}>${totals.rev.toLocaleString()}/mo</div>
            <div style={{fontSize:9,color:"#475569",textTransform:"uppercase",letterSpacing:"0.1em"}}>Total Revenue</div>
          </div>
          <button onClick={()=>setShowUpload(true)} style={{background:"#2563eb",color:"white",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>↑ Refresh Data</button>
          {FLAGS.length>0&&<div style={{background:"#7c1d1d",border:"1px solid #dc2626",borderRadius:8,padding:"8px 12px",fontSize:11,fontWeight:700,color:"#fca5a5"}}>⚑ {FLAGS.length} Flags</div>}
        </div>
      </div>

      <div style={{display:"flex",height:"calc(100vh - 64px)"}}>
        {/* SIDEBAR */}
        <div style={{width:255,flexShrink:0,background:"#080f1c",borderRight:"1px solid #0f1f35",overflowY:"auto",padding:10}}>
          {propNames.map(name=>{
            const s=getStats(DATA[name]),pct=s.total>0?Math.round(((s.occ+s.mgmt)/s.total)*100):0,c=COLORS[name]||"#64748b",isSel=sel===name,pf=FLAGS.filter(f=>f.prop===name).length;
            return(
              <div key={name} className="pr" onClick={()=>{setSel(isSel?null:name);setSelGarage(null);setSearch("");setFilter("all");}}
                style={{borderRadius:10,padding:"9px 11px",cursor:"pointer",marginBottom:3,background:isSel?"#0f1f35":"transparent",border:isSel?`1px solid ${c}50`:"1px solid transparent",transition:"all .15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:c}}/>
                  <div style={{fontSize:11,fontWeight:600,flex:1,color:isSel?"#f1f5f9":"#64748b",lineHeight:1.3}}>{name}</div>
                  <div style={{fontSize:12,fontWeight:800,color:c}}>{pct}%</div>
                  {pf>0&&<div style={{background:"#7c1d1d",color:"#fca5a5",borderRadius:5,padding:"1px 5px",fontSize:9,fontWeight:800}}>⚑{pf}</div>}
                </div>
                <OccBar occ={s.occ} mgmt={s.mgmt} total={s.total} color={c}/>
                <div style={{display:"flex",gap:8,marginTop:4,fontSize:9,color:"#475569",justifyContent:"space-between"}}>
                  <span><span style={{color:"#22c55e"}}>{s.occ}</span> occ · {s.vacant} vac · {s.total} tot</span>
                  {s.rev>0&&<span style={{color:"#4ade80",fontWeight:700}}>${s.rev.toLocaleString()}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN */}
        <div style={{flex:1,overflowY:"auto",padding:18}}>

          {/* Flags panel */}
          {propFlags.length>0&&sel&&(
            <div style={{background:"#1c0a00",border:"1px solid #c2410c",borderRadius:12,padding:"12px 16px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:800,color:"#fb923c",marginBottom:8}}>⚑ {propFlags.length} Item{propFlags.length>1?"s":""} Need Attention</div>
              {propFlags.map((f,i)=>(
                <div key={i} style={{fontSize:11,color:"#fed7aa",paddingLeft:10,marginBottom:4,borderLeft:"2px solid #c2410c"}}>{f.msg}</div>
              ))}
            </div>
          )}

          {!sel?(
            // PORTFOLIO VIEW
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"#475569",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.1em"}}>Portfolio Revenue Breakdown</div>
              <div style={{background:"#080f1c",border:"1px solid #0f1f35",borderRadius:14,padding:"18px 20px",marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:16}}>
                  <div style={{fontSize:28,fontWeight:900,color:"#4ade80",letterSpacing:"-1px"}}>${totals.rev.toLocaleString()}<span style={{fontSize:14,fontWeight:400,color:"#475569"}}>/mo</span></div>
                  <div style={{fontSize:11,color:"#475569"}}>tracked garage revenue across {propNames.length} properties</div>
                </div>
                {revenueData.map(({name,rev,color})=>{
                  const pct=totals.rev>0?(rev/totals.rev)*100:0;
                  return(
                    <div key={name} style={{marginBottom:10,cursor:"pointer"}} onClick={()=>setSel(name)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:color}}/>
                          <span style={{fontSize:11,fontWeight:600,color:"#94a3b8"}}>{name}</span>
                        </div>
                        <div style={{display:"flex",gap:12,alignItems:"center"}}>
                          <span style={{fontSize:10,color:"#475569"}}>{pct.toFixed(1)}%</span>
                          <span style={{fontSize:12,fontWeight:700,color:"#4ade80",minWidth:70,textAlign:"right"}}>${rev.toLocaleString()}/mo</span>
                        </div>
                      </div>
                      <div style={{height:6,borderRadius:3,background:"#1e293b",overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:3,transition:"width .5s"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              {FLAGS.length>0&&(
                <div style={{background:"#1c0a00",border:"1px solid #c2410c",borderRadius:12,padding:"12px 16px"}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#fb923c",marginBottom:8}}>⚑ {FLAGS.length} Portfolio Flags</div>
                  {FLAGS.map((f,i)=>(
                    <div key={i} style={{fontSize:11,color:"#fed7aa",paddingLeft:10,marginBottom:5,borderLeft:"2px solid #c2410c",cursor:"pointer"}} onClick={()=>setSel(f.prop)}>
                      <span style={{color:"#fb923c",fontWeight:700}}>{f.prop}{f.garage?` · ${f.garage}`:""}</span> — {f.msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ):(
            <>
              {/* PROPERTY HEADER */}
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:pc}}/>
                    <div style={{fontSize:16,fontWeight:800}}>{sel}</div>
                  </div>
                  <div style={{fontSize:10,color:"#475569",marginTop:2}}>
                    {pStats.occ}/{pStats.total} occupied · {pStats.vacant} vacant{pStats.nonRes>0?` · ${pStats.nonRes} non-resident`:""}
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{background:"#0a1628",border:"1px solid #0f1f35",borderRadius:7,padding:"6px 10px",color:"#f1f5f9",fontSize:11,width:140,outline:"none"}}/>
                  {["all","occupied","mgmt_hold","vacant"].map(s=>(
                    <button key={s} onClick={()=>setFilter(s)} style={{padding:"6px 10px",borderRadius:7,fontSize:10,fontWeight:700,border:"none",cursor:"pointer",background:filter===s?pc:"#0a1628",color:filter===s?"white":"#475569"}}>
                      {s==="all"?"All":s==="mgmt_hold"?"Mgmt":s.charAt(0).toUpperCase()+s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* STAT TILES */}
              {(pStats.rev>0||pStats.occ>0)&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:14}}>
                  <div style={{background:"#052e16",border:"1px solid #16a34a",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#16a34a",marginBottom:4}}>Monthly Revenue</div>
                    <div style={{fontSize:22,fontWeight:900,color:"#4ade80",letterSpacing:"-0.5px"}}>${pStats.rev.toLocaleString()}</div>
                    <div style={{fontSize:9,color:"#166534",marginTop:2}}>{totals.rev>0?((pStats.rev/totals.rev)*100).toFixed(1):0}% of portfolio</div>
                  </div>
                  <div style={{background:"#080f1c",border:"1px solid #0f1f35",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#475569",marginBottom:4}}>Occupied</div>
                    <div style={{fontSize:22,fontWeight:900,color:"#22c55e",letterSpacing:"-0.5px"}}>{pStats.occ}<span style={{fontSize:12,color:"#475569",fontWeight:400}}>/{pStats.total}</span></div>
                    <div style={{fontSize:9,color:"#475569",marginTop:2}}>{pStats.total>0?Math.round((pStats.occ/pStats.total)*100):0}% occupancy</div>
                  </div>
                  <div style={{background:"#080f1c",border:"1px solid #0f1f35",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#475569",marginBottom:4}}>Vacant</div>
                    <div style={{fontSize:22,fontWeight:900,color:"#f87171",letterSpacing:"-0.5px"}}>{pStats.vacant}</div>
                    <div style={{fontSize:9,color:"#475569",marginTop:2}}>available to rent</div>
                  </div>
                  {pStats.mgmt>0&&(
                    <div style={{background:"#1a1000",border:"1px solid #d97706",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#d97706",marginBottom:4}}>Mgmt Hold</div>
                      <div style={{fontSize:22,fontWeight:900,color:"#fbbf24",letterSpacing:"-0.5px"}}>{pStats.mgmt}</div>
                      <div style={{fontSize:9,color:"#92400e",marginTop:2}}>review if releasable</div>
                    </div>
                  )}
                </div>
              )}

              {/* OCC BAR */}
              <div style={{background:"#080f1c",borderRadius:10,padding:"10px 14px",marginBottom:14,border:"1px solid #0f1f35"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:9,color:"#475569"}}>
                  <span style={{color:"#22c55e"}}>■ Occupied {pStats.occ}</span>
                  {pStats.mgmt>0&&<span style={{color:"#f59e0b"}}>■ Mgmt {pStats.mgmt}</span>}
                  <span>■ Vacant {pStats.vacant}</span>
                  <span style={{color:pc,fontWeight:800}}>{pStats.total>0?Math.round(((pStats.occ+pStats.mgmt)/pStats.total)*100):0}% utilized</span>
                </div>
                <OccBar occ={pStats.occ} mgmt={pStats.mgmt} total={pStats.total} color={pc}/>
              </div>

              {/* LEGEND */}
              <div style={{display:"flex",gap:12,marginBottom:12,fontSize:9,color:"#475569",flexWrap:"wrap"}}>
                {[["#052e16","#16a34a","Resident"],["#1e1333","#7c3aed","★ Non-Resident"],["#1a1000","#d97706","🔧 Mgmt Hold"],["#080f1c","#1e293b","Vacant"]].map(([bg,bdr,label])=>(
                  <div key={label} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:11,height:11,borderRadius:3,background:bg,border:`1.5px solid ${bdr}`}}/>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* GARAGE GRID */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:7,marginBottom:18}}>
                {filtered.map(g=>{
                  const occ=g.status==="occupied",mgmt=g.status==="mgmt_hold",nr=g.non_resident;
                  const hasFlag=FLAGS.some(f=>f.prop===sel&&f.garage===g.id);
                  const isSel2=selGarage?.id===g.id;
                  return(
                    <div key={g.id} className="gc" onClick={()=>setSelGarage(isSel2?null:g)}
                      style={{background:nr?"#1e1333":mgmt?"#1a1000":occ?"#052e16":"#080f1c",border:`1.5px solid ${isSel2?pc:nr?"#7c3aed":mgmt?"#d97706":occ?"#16a34a":"#0f1f35"}`,borderRadius:9,padding:"8px 9px",cursor:"pointer",transition:"all .15s",position:"relative"}}>
                      {hasFlag&&<div style={{position:"absolute",top:4,right:4,width:6,height:6,borderRadius:"50%",background:"#f97316"}}/>}
                      <div style={{fontSize:9,fontWeight:700,color:"#475569",marginBottom:2,fontFamily:"monospace"}}>{g.id}</div>
                      <div style={{fontSize:10,fontWeight:600,color:occ?"#f1f5f9":"#334155",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {g.status==="vacant"?<span style={{fontStyle:"italic",color:"#1e293b"}}>Vacant</span>
                          :mgmt?<span style={{color:"#fbbf24"}}>🔧 Mgmt</span>
                          :<>{nr&&<span style={{color:"#a78bfa"}}>★ </span>}{g.tenant}</>}
                      </div>
                      {g.unit&&<div style={{fontSize:8,color:"#1e3a5f",marginTop:1}}>Unit {g.unit}</div>}
                      {g.price!=null&&g.status!=="vacant"&&<div style={{fontSize:9,color:g.price>0?"#22c55e":"#334155",fontWeight:700,marginTop:1}}>{g.price===0?"Free":g.price===null?"—":`$${g.price}/mo`}</div>}
                    </div>
                  );
                })}
              </div>

              {/* STORAGE */}
              {ps.length>0&&(
                <div style={{background:"#080f1c",borderRadius:10,padding:"12px 14px",marginBottom:14,border:"1px solid #0f1f35"}}>
                  <div style={{fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#475569",marginBottom:10}}>Storage Units</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:7}}>
                    {ps.map(g=>(
                      <div key={g.id} style={{background:g.status==="mgmt_hold"?"#1a1000":"#052e16",border:`1.5px solid ${g.status==="mgmt_hold"?"#d97706":"#16a34a"}`,borderRadius:9,padding:"8px 9px"}}>
                        <div style={{fontSize:9,fontWeight:700,color:"#475569",marginBottom:2}}>{g.id}</div>
                        <div style={{fontSize:10,fontWeight:600,color:"#f1f5f9"}}>{g.tenant||"Vacant"}</div>
                        {g.price!=null&&<div style={{fontSize:9,color:g.price>0?"#22c55e":"#334155",marginTop:1}}>{g.price===0?"Free":`$${g.price}/mo`}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WAITLIST */}
              {pw.length>0&&(
                <div style={{background:"#080f1c",borderRadius:10,padding:"12px 14px",border:"1px solid #0f1f35"}}>
                  <div style={{fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#475569",marginBottom:10}}>Waitlist ({pw.length})</div>
                  {pw.map((w,i)=>(
                    <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"7px 0",borderBottom:i<pw.length-1?"1px solid #0f1f35":"none"}}>
                      <div style={{background:"#1e1333",color:"#a78bfa",borderRadius:5,padding:"2px 7px",fontSize:9,fontWeight:700}}>{w.type}</div>
                      <div style={{fontSize:11,fontWeight:600,flex:1}}>{w.name}</div>
                      <div style={{fontSize:10,color:"#475569",fontFamily:"monospace"}}>{w.unit}</div>
                      <div style={{fontSize:9,color:"#334155"}}>{w.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* DETAIL PANEL */}
        {selGarage&&(
          <div style={{width:240,flexShrink:0,background:"#080f1c",borderLeft:"1px solid #0f1f35",padding:16,overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:13,fontFamily:"monospace",color:pc}}>{selGarage.id}</div>
              <button onClick={()=>setSelGarage(null)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer"}}>✕</button>
            </div>
            {[
              ["Status", selGarage.status==="occupied"?(selGarage.non_resident?"★ Non-Resident":"Occupied"):selGarage.status==="mgmt_hold"?"🔧 Mgmt Hold":"Vacant"],
              ["Tenant", selGarage.tenant||"—"],
              ["Unit", selGarage.unit||"—"],
              ["Rate", selGarage.price!=null?(selGarage.price===0?"Free / Included":`$${selGarage.price}/mo`):"Not in lease"],
              ["Notes", selGarage.notes||"—"],
            ].map(([l,v])=>(
              <div key={l} style={{background:"#0a1628",borderRadius:7,padding:"9px 11px",marginBottom:7}}>
                <div style={{fontSize:8,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#334155",marginBottom:2}}>{l}</div>
                <div style={{fontSize:12,fontWeight:600,color:"#f1f5f9"}}>{v}</div>
              </div>
            ))}
            {selGarage.non_resident&&(
              <div style={{background:"#1e1333",borderRadius:7,padding:"9px 11px",border:"1px solid #7c3aed",marginTop:8}}>
                <div style={{fontSize:10,fontWeight:700,color:"#a78bfa"}}>★ Non-Resident Renter</div>
                <div style={{fontSize:10,color:"#c4b5fd",marginTop:3}}>Does not live at this property.</div>
              </div>
            )}
            {FLAGS.some(f=>f.prop===sel&&f.garage===selGarage.id)&&(
              <div style={{background:"#1c0a00",borderRadius:7,padding:"9px 11px",border:"1px solid #c2410c",marginTop:8}}>
                <div style={{fontSize:10,fontWeight:800,color:"#fb923c",marginBottom:4}}>⚑ Flagged</div>
                {FLAGS.filter(f=>f.prop===sel&&f.garage===selGarage.id).map((f,i)=>(
                  <div key={i} style={{fontSize:10,color:"#fed7aa"}}>{f.msg}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {showUpload&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setShowUpload(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#080f1c",borderRadius:16,padding:28,width:460,maxWidth:"90vw",border:"1px solid #0f1f35"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <div style={{fontSize:16,fontWeight:800}}>Monthly Data Refresh</div>
              <button onClick={()=>setShowUpload(false)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:18}}>✕</button>
            </div>
            {[["Lease Details Report","Excel export from your property management system"],["Garage Tracker Form","Completed PGM_Garage_Tracker.xlsx from your team"]].map(([label,desc])=>(
              <div key={label} style={{background:"#0a1628",borderRadius:10,padding:14,marginBottom:12,border:"1px solid #0f1f35"}}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:3}}>{label}</div>
                <div style={{fontSize:10,color:"#475569",marginBottom:10}}>{desc}</div>
                <label style={{display:"block",background:"#050c17",border:"1px dashed #1e293b",borderRadius:8,padding:10,color:"#475569",fontSize:11,cursor:"pointer",textAlign:"center"}}>
                  + Click to upload .xlsx file<input type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}}/>
                </label>
              </div>
            ))}
            <div style={{background:"#0a1628",borderRadius:8,padding:"10px 12px",fontSize:10,color:"#64748b",marginBottom:16}}>
              💡 Tip: Standardize garage notes as <strong style={{color:"#94a3b8"}}>"Garage X – $Y/mo each"</strong> in your PM system to ensure prices are read correctly for multi-garage tenants.
            </div>
            <button onClick={()=>setShowUpload(false)} style={{width:"100%",background:"#2563eb",color:"white",border:"none",borderRadius:10,padding:12,fontSize:13,fontWeight:800,cursor:"pointer"}}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
