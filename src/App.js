import React, { useState, useEffect, useMemo } from "react";

// --- 1. OUR DATABASE ---
const DEFAULT_DISHES = [
  { id: "m1", name: "Pork ribs and chestnut stew", category: "main", protein: "pork", ingredients: ["pork ribs", "chestnut"] },
  { id: "m2", name: "Apple and pork rolls", category: "main", protein: "pork", ingredients: ["pork slices", "apple"] },
  { id: "m3", name: "Apple, onion and cabbage whole chicken thigh", category: "main", protein: "chicken", ingredients: ["whole chicken thigh", "apple", "onion", "cabbage"] },
  { id: "m4", name: "Chicken curry", category: "main", protein: "chicken", ingredients: ["chicken thigh", "curry powder", "onion", "coconut cream", "bell pepper", "potato", "carrots"] },
  { id: "m5", name: "Pork ribs", category: "main", protein: "pork", ingredients: ["pork ribs"] },
  { id: "m6", name: "Stir fry chicken thigh with Chinese mushroom, cashew and ginger", category: "main", protein: "chicken", ingredients: ["chicken thigh", "Chinese mushroom", "cashew", "ginger"] },
  { id: "m7", name: "Japanese style pork slice with onion and egg", category: "main", protein: "pork", ingredients: ["pork slice", "onion", "egg"] },
  { id: "m8", name: "Japanese style beef slice with onion and egg", category: "main", protein: "beef", ingredients: ["beef slice", "onion", "egg"] },
  { id: "m9", name: "Steak", category: "main", protein: "beef", ingredients: ["steak"] },
  { id: "m10", name: "Pork chop with white curry", category: "main", protein: "pork", ingredients: ["pork chop", "onion", "lemon grass", "lemon leave", "thai ginger"] },
  { id: "m11", name: "Beef & enoki mushroom roll", category: "main", protein: "beef", ingredients: ["beef slice", "enoki mushroom"] },
  { id: "m12", name: "Pan fried chicken thigh", category: "main", protein: "chicken", ingredients: ["chicken thigh"] },
  { id: "m13", name: "Stuffed tofu puff with fish paste", category: "main", protein: "seafood", ingredients: ["tofu puff", "fish paste"] },
  { id: "m14", name: "Stuffed tofu puff with minced pork and mushroom", category: "main", protein: "pork", ingredients: ["tofu puff", "minced pork", "mushroom"] },
  { id: "m15", name: "Stuffed bell pepper with fish paste", category: "main", protein: "seafood", ingredients: ["bell pepper", "fish paste"] },
  { id: "m16", name: "Stuffed eggplant with fish paste", category: "main", protein: "seafood", ingredients: ["eggplant", "fish paste"] },
  { id: "m17", name: "Eggplant and mince pork", category: "main", protein: "pork", ingredients: ["eggplant", "minced pork"] },
  { id: "m18", name: "Asparagus roll with pork slice", category: "main", protein: "pork", ingredients: ["asparagus", "pork slice"] },
  { id: "s1", name: "Osmanthus Yam", category: "side", protein: "none", ingredients: ["yam", "osmanthus"] },
  { id: "s2", name: "Steam clam with garlic and vermicelli", category: "side", protein: "seafood", ingredients: ["clam", "garlic", "vermicelli"] },
  { id: "s3", name: "Steam egg with tofu", category: "side", protein: "none", ingredients: ["egg", "tofu"] },
  { id: "s4", name: "Fry egg with shrimp", category: "side", protein: "seafood", ingredients: ["egg", "shrimp"] },
  { id: "s5", name: "Steam egg with dried scallop", category: "side", protein: "seafood", ingredients: ["egg", "dried scallop"] },
  { id: "s6", name: "Steam pomfret", category: "side", protein: "seafood", ingredients: ["pomfret", "ginger", "scallion"] },
  { id: "s7", name: "Pan fried halibut", category: "side", protein: "seafood", ingredients: ["halibut"] },
  { id: "s8", name: "Tomato, potato fish soup", category: "side", protein: "seafood", ingredients: ["tomato", "potato", "fish"] },
  { id: "v1", name: "Fry green sprouts with garlic", category: "veg", protein: "none", ingredients: ["green sprouts", "garlic"] },
  { id: "v2", name: "Spinach", category: "veg", protein: "none", ingredients: ["spinach"] },
  { id: "v3", name: "Beef slices and Choi sum", category: "veg", protein: "beef", ingredients: ["fresh beef slice", "choi sum"] },
  { id: "v4", name: "Cauliflower", category: "veg", protein: "none", ingredients: ["cauliflower", "garlic"] },
  { id: "v5", name: "Stir fry broccoli and scallops", category: "veg", protein: "seafood", ingredients: ["broccoli", "scallops"] }
];

// --- 2. HELPER FUNCTIONS ---
const getRandomDish = (dishes) => dishes[Math.floor(Math.random() * dishes.length)];

const getMasterIngredientList = (allDishes) => {
  const allIngredients = allDishes.flatMap((dish) => dish.ingredients);
  return [...new Set(allIngredients)].sort();
};

export default function DinnerApp() {
  // --- 3. STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("planner"); // 'planner' or 'inventory'
  
  // Settings
  const [diningSize, setDiningSize] = useState("medium"); // small, medium, large
  const [existingOnly, setExistingOnly] = useState(false);
  
  // Inventory (Local Storage)
  const [inventory, setInventory] = useState({});
  const masterIngredients = useMemo(() => getMasterIngredientList(DEFAULT_DISHES), []);

  useEffect(() => {
    const saved = localStorage.getItem("dinnerInventory");
    if (saved) {
      setInventory(JSON.parse(saved));
    } else {
      const initial = {};
      masterIngredients.forEach((item) => (initial[item] = true));
      setInventory(initial);
    }
  }, [masterIngredients]);

  const toggleIngredient = (item) => {
    const updated = { ...inventory, [item]: !inventory[item] };
    setInventory(updated);
    localStorage.setItem("dinnerInventory", JSON.stringify(updated));
  };

  // Menu State
  const [mode, setMode] = useState("auto"); // 'auto' or 'manual'
  const [generatedMenu, setGeneratedMenu] = useState(null);
  const [manualMenu, setManualMenu] = useState({ main: null, side: null, veg: null });

  // --- 4. LOGIC: FILTERING & VALIDATION ---
  const availableIngredientsList = Object.keys(inventory).filter((i) => inventory[i]);

  const getValidDishes = () => {
    if (!existingOnly) return DEFAULT_DISHES;
    return DEFAULT_DISHES.filter((dish) =>
      dish.ingredients.every((ing) => availableIngredientsList.includes(ing))
    );
  };

  // Flow A: Auto Generate
  const handleAutoGenerate = () => {
    const valid = getValidDishes();
    const mains = valid.filter((d) => d.category === "main");
    const sides = valid.filter((d) => d.category === "side");
    const vegs = valid.filter((d) => d.category === "veg");

    let usedProteins = [];
    let newMenu = { main: null, sides: [], veg: null };

    if (mains.length > 0) {
      newMenu.main = getRandomDish(mains);
      if (newMenu.main.protein !== "none") usedProteins.push(newMenu.main.protein);
    }

    let numSides = diningSize === "small" ? 0 : diningSize === "medium" ? 1 : 2;
    for (let i = 0; i < numSides; i++) {
      const availableSides = sides.filter(
        (s) => !usedProteins.includes(s.protein) && !newMenu.sides.includes(s)
      );
      if (availableSides.length > 0) {
        const picked = getRandomDish(availableSides);
        newMenu.sides.push(picked);
        if (picked.protein !== "none") usedProteins.push(picked.protein);
      }
    }

    const availableVegs = vegs.filter((v) => !usedProteins.includes(v.protein));
    if (availableVegs.length > 0) {
      newMenu.veg = getRandomDish(availableVegs);
    }

    setGeneratedMenu(newMenu);
  };

  // Flow B: Manual Selection (Invisible Option A logic)
  const validForManual = getValidDishes();
  const usedManualProteins = [];
  if (manualMenu.main && manualMenu.main.protein !== "none") usedManualProteins.push(manualMenu.main.protein);
  if (manualMenu.side && manualMenu.side.protein !== "none") usedManualProteins.push(manualMenu.side.protein);

  const manualOptions = {
    mains: validForManual.filter((d) => d.category === "main"),
    sides: validForManual.filter((d) => d.category === "side" && !usedManualProteins.includes(d.protein)),
    vegs: validForManual.filter((d) => d.category === "veg" && !usedManualProteins.includes(d.protein))
  };

  // --- 5. WHATSAPP & SHOPPING LIST ---
  const handleShare = (menuToShare) => {
    let required = [];
    if (menuToShare.main) required.push(...menuToShare.main.ingredients);
    if (menuToShare.sides) menuToShare.sides.forEach((s) => required.push(...s.ingredients));
    if (menuToShare.side) required.push(...menuToShare.side.ingredients); // for manual single side
    if (menuToShare.veg) required.push(...menuToShare.veg.ingredients);

    const uniqueRequired = [...new Set(required)];
    const shoppingList = uniqueRequired.filter((ing) => !inventory[ing]);

    let text = `🍽️ *Tonight's Dinner*\n`;
    if (menuToShare.main) text += `• Main: ${menuToShare.main.name}\n`;
    if (menuToShare.sides) menuToShare.sides.forEach((s, i) => (text += `• Side ${i + 1}: ${s.name}\n`));
    if (menuToShare.side) text += `• Side: ${menuToShare.side.name}\n`;
    if (menuToShare.veg) text += `• Veg: ${menuToShare.veg.name}\n`;

    text += `\n🛒 *Shopping List*\n`;
    if (shoppingList.length === 0) {
      text += `Looks like we have everything! 🎉`;
    } else {
      shoppingList.forEach((item) => (text += `☐ ${item}\n`));
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // --- 6. SIMPLE INLINE STYLES FOR QUICK TESTING ---
  const styles = {
    container: { fontFamily: "system-ui", maxWidth: "500px", margin: "0 auto", padding: "20px" },
    nav: { display: "flex", gap: "10px", marginBottom: "20px" },
    tag: (isActive) => ({
      padding: "8px 12px", borderRadius: "20px", border: "1px solid #007AFF", 
      background: isActive ? "#007AFF" : "transparent",
      color: isActive ? "white" : "#007AFF", cursor: "pointer", margin: "5px"
    }),
    block: { marginBottom: "20px", padding: "15px", background: "#f5f5f7", borderRadius: "10px" },
    btn: { background: "#34C759", color: "white", padding: "12px", border: "none", borderRadius: "10px", width: "100%", fontSize: "16px", cursor: "pointer", marginTop: "10px" }
  };

  // --- 7. RENDER UI ---
  return (
    <div style={styles.container}>
      <h2>🍽️ Dinner Planner</h2>
      
      <div style={styles.nav}>
        <button style={styles.tag(activeTab === "planner")} onClick={() => setActiveTab("planner")}>Meal Planner</button>
        <button style={styles.tag(activeTab === "inventory")} onClick={() => setActiveTab("inventory")}>Inventory</button>
      </div>

      {activeTab === "inventory" && (
        <div>
          <h3>My Fridge & Pantry</h3>
          <p>Tap to mark as unavailable (gray means you need to buy it).</p>
          <div>
            {masterIngredients.map((item) => (
              <button
                key={item}
                style={{...styles.tag(inventory[item]), borderColor: inventory[item] ? '#007AFF' : '#ccc', color: inventory[item] ? 'white' : '#666'}}
                onClick={() => toggleIngredient(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "planner" && (
        <div>
          <div style={styles.block}>
            <label>Dining Size: </label>
            <select value={diningSize} onChange={(e) => setDiningSize(e.target.value)}>
              <option value="small">Small (2 Dishes)</option>
              <option value="medium">Medium (3 Dishes)</option>
              <option value="large">Large (4 Dishes)</option>
            </select>
            <br /><br />
            <label>
              <input type="checkbox" checked={existingOnly} onChange={(e) => setExistingOnly(e.target.checked)} />
              {" "}Only use existing ingredients
            </label>
          </div>

          <div style={styles.nav}>
            <button style={styles.tag(mode === "auto")} onClick={() => setMode("auto")}>Auto-Suggest</button>
            <button style={styles.tag(mode === "manual")} onClick={() => setMode("manual")}>Manual Build</button>
          </div>

          {mode === "auto" && (
            <div>
              <button style={{...styles.btn, background: "#007AFF"}} onClick={handleAutoGenerate}>🎲 Generate Dinner</button>
              {generatedMenu && (
                <div style={styles.block}>
                  <h4>Menu Locked In:</h4>
                  <p><strong>Main:</strong> {generatedMenu.main?.name}</p>
                  {generatedMenu.sides.map((s, i) => <p key={i}><strong>Side:</strong> {s.name}</p>)}
                  <p><strong>Veg:</strong> {generatedMenu.veg?.name}</p>
                  <button style={styles.btn} onClick={() => handleShare(generatedMenu)}>Share to WhatsApp 💬</button>
                </div>
              )}
            </div>
          )}

          {mode === "manual" && (
            <div>
              <h4>Main Dish</h4>
              <div>{manualOptions.mains.map(d => (
                <button key={d.id} style={styles.tag(manualMenu.main?.id === d.id)} onClick={() => setManualMenu({...manualMenu, main: d, side: null, veg: null})}>{d.name}</button>
              ))}</div>

              {diningSize !== "small" && (
                <>
                  <h4>Side Dish</h4>
                  <div>{manualOptions.sides.map(d => (
                    <button key={d.id} style={styles.tag(manualMenu.side?.id === d.id)} onClick={() => setManualMenu({...manualMenu, side: d, veg: null})}>{d.name}</button>
                  ))}</div>
                </>
              )}

              <h4>Vegetable</h4>
              <div>{manualOptions.vegs.map(d => (
                <button key={d.id} style={styles.tag(manualMenu.veg?.id === d.id)} onClick={() => setManualMenu({...manualMenu, veg: d})}>{d.name}</button>
              ))}</div>

              {(manualMenu.main && manualMenu.veg && (diningSize === "small" || manualMenu.side)) && (
                <button style={styles.btn} onClick={() => handleShare(manualMenu)}>Share to WhatsApp 💬</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
