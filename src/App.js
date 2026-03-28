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

const getIngredientCategory = (item) => {
  const lower = item.toLowerCase();
  if (lower.includes("pork")) return "Pork";
  if (lower.includes("beef") || lower.includes("steak")) return "Beef";
  if (lower.includes("chicken")) return "Chicken";
  if (lower.includes("fish") || lower.includes("clam") || lower.includes("shrimp") || lower.includes("scallop") || lower.includes("pomfret") || lower.includes("halibut")) return "Seafood";
  if (lower.includes("tofu")) return "Soy";
  if (lower.includes("eggplant")) return "Vegetables"; 
  if (lower.includes("scallion") || lower.includes("curry") || lower.includes("coconut") || lower.includes("garlic") || lower.includes("ginger") || lower.includes("lemon") || lower.includes("osmanthus") || lower.includes("vermicelli") || lower.includes("cashew") || lower.includes("egg")) return "Condiments"; 
  return "Vegetables"; 
};

export default function DinnerApp() {
  // --- 3. STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("planner"); 
  const [diningSize, setDiningSize] = useState("medium");
  const [existingOnly, setExistingOnly] = useState(false);
  
  // Custom Dishes State
  const [customDishes, setCustomDishes] = useState([]);
  const [newDish, setNewDish] = useState({ name: "", category: "main", protein: "pork", ingredients: "" });

  const [inventory, setInventory] = useState({});
  
  // Combine default and custom dishes
  const allDishes = useMemo(() => [...DEFAULT_DISHES, ...customDishes], [customDishes]);
  const masterIngredients = useMemo(() => getMasterIngredientList(allDishes), [allDishes]);

  // Load saved data on startup
  useEffect(() => {
    const savedInventory = localStorage.getItem("dinnerInventory");
    const savedDishes = localStorage.getItem("customDishes");
    
    if (savedDishes) setCustomDishes(JSON.parse(savedDishes));
    
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      const initial = {};
      masterIngredients.forEach((item) => (initial[item] = true));
      setInventory(initial);
    }
  }, []);

  // Sync new ingredients to inventory automatically
  useEffect(() => {
    setInventory(prev => {
      const updated = { ...prev };
      let changed = false;
      masterIngredients.forEach(item => {
        if (updated[item] === undefined) {
          updated[item] = true; 
          changed = true;
        }
      });
      if (changed) localStorage.setItem("dinnerInventory", JSON.stringify(updated));
      return updated;
    });
  }, [masterIngredients]);

  const toggleIngredient = (item) => {
    const updated = { ...inventory, [item]: !inventory[item] };
    setInventory(updated);
    localStorage.setItem("dinnerInventory", JSON.stringify(updated));
  };

  const handleAddDish = () => {
    if (!newDish.name || !newDish.ingredients) return alert("Please fill in name and ingredients!");
    
    const dishToSave = {
      id: "c_" + Date.now(),
      name: newDish.name,
      category: newDish.category,
      protein: newDish.protein,
      ingredients: newDish.ingredients.split(",").map(i => i.trim().toLowerCase()).filter(i => i)
    };
    
    const updatedDishes = [...customDishes, dishToSave];
    setCustomDishes(updatedDishes);
    localStorage.setItem("customDishes", JSON.stringify(updatedDishes));
    
    alert("Dish added successfully!");
    setNewDish({ name: "", category: "main", protein: "pork", ingredients: "" });
  };

  const [mode, setMode] = useState("auto");
  const [generatedMenu, setGeneratedMenu] = useState(null);
  const [manualMenu, setManualMenu] = useState({ main: null, side: null, veg: null });

  // --- 4. LOGIC ---
  const availableIngredientsList = Object.keys(inventory).filter((i) => inventory[i]);

  const getValidDishes = () => {
    if (!existingOnly) return allDishes;
    return allDishes.filter((dish) =>
      dish.ingredients.every((ing) => availableIngredientsList.includes(ing))
    );
  };

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

  const validForManual = getValidDishes();
  const usedManualProteins = [];
  if (manualMenu.main && manualMenu.main.protein !== "none") usedManualProteins.push(manualMenu.main.protein);
  if (manualMenu.side && manualMenu.side.protein !== "none") usedManualProteins.push(manualMenu.side.protein);

  const manualOptions = {
    mains: validForManual.filter((d) => d.category === "main"),
    sides: validForManual.filter((d) => d.category === "side" && !usedManualProteins.includes(d.protein)),
    vegs: validForManual.filter((d) => d.category === "veg" && !usedManualProteins.includes(d.protein))
  };

  const handleShare = (menuToShare) => {
    let required = [];
    if (menuToShare.main) required.push(...menuToShare.main.ingredients);
    if (menuToShare.sides) menuToShare.sides.forEach((s) => required.push(...s.ingredients));
    if (menuToShare.side) required.push(...menuToShare.side.ingredients);
    if (menuToShare.veg) required.push(...menuToShare.veg.ingredients);

    const uniqueRequired = [...new Set(required)];
    const shoppingList = uniqueRequired.filter((ing) => !inventory[ing]);

    let text = `Tonight's Dinner\n`;
    if (menuToShare.main) text += `${menuToShare.main.name}\n`;
    if (menuToShare.sides) menuToShare.sides.forEach((s) => (text += `${s.name}\n`));
    if (menuToShare.side) text += `${menuToShare.side.name}\n`;
    if (menuToShare.veg) text += `${menuToShare.veg.name}\n`;

    text += `\nShopping List\n`;
    if (shoppingList.length === 0) text += `Looks like we have everything!`;
    else shoppingList.forEach((item) => (text += `${item}\n`));

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // --- 5. UI COMPONENTS & STYLES ---
  const styles = {
    container: { fontFamily: "system-ui", maxWidth: "500px", margin: "0 auto", padding: "15px", color: "#333" },
    nav: { display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "5px" },
    tag: (isActive) => ({
      padding: "10px 16px", borderRadius: "20px", border: "1.5px solid #FF8CA1", 
      background: isActive ? "#FF8CA1" : "transparent", fontWeight: "600", whiteSpace: "nowrap",
      color: isActive ? "white" : "#FF8CA1", cursor: "pointer", margin: "5px 5px 5px 0"
    }),
    block: { marginBottom: "20px", padding: "20px", background: "#f9f9f9", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" },
    btn: { background: "#FF8CA1", color: "white", padding: "16px", border: "none", borderRadius: "14px", width: "100%", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", boxShadow: "0 4px 12px rgba(255, 140, 161, 0.3)" },
    categoryHeader: { fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "#888", marginTop: "15px", marginBottom: "8px" },
    menuCard: { display: "flex", alignItems: "center", gap: "15px", padding: "12px 0", borderBottom: "1px solid #eee" },
    input: { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", marginBottom: "15px", boxSizing: "border-box", fontSize: "16px" }
  };

  // The updated big squircle icons!
  const DishIcon = ({ type }) => {
    let emoji = "🍛"; let bgColor = "#FFF0C2"; // Option C: Curry
    if (type === "side") { emoji = "🍤🥣"; bgColor = "#D0E8FF"; } // Option B: Fried Shrimp Bowl
    if (type === "veg") { emoji = "🥦"; bgColor = "#D4F0D0"; } // Option B: Broccoli

    return (
      <div style={{ 
        width: "64px", height: "64px", 
        borderRadius: "16px", 
        backgroundColor: bgColor, 
        display: "flex", alignItems: "center", justifyContent: "center", 
        fontSize: "36px", 
        flexShrink: 0 
      }}>
        {emoji}
      </div>
    );
  };

  const renderGroupedDishes = (dishes, onSelect, selectedItem) => {
    const proteins = ["pork", "beef", "chicken", "seafood", "none"];
    return proteins.map(protein => {
      const filtered = dishes.filter(d => d.protein === protein);
      if (filtered.length === 0) return null;
      return (
        <div key={protein}>
          <div style={styles.categoryHeader}>{protein === "none" ? "Veg/Other" : protein}</div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {filtered.map(d => (
              <button key={d.id} style={styles.tag(selectedItem?.id === d.id)} onClick={() => onSelect(d)}>{d.name}</button>
            ))}
          </div>
        </div>
      );
    });
  };

  const inventoryCategories = ["Pork", "Beef", "Chicken", "Seafood", "Soy", "Vegetables", "Condiments"];
  
  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: "center", color: "#FF8CA1", margin: "10px 0 20px 0" }}>🍽️ Dinner Planner</h2>
      
      <div style={styles.nav}>
        <button style={styles.tag(activeTab === "planner")} onClick={() => setActiveTab("planner")}>Meal Planner</button>
        <button style={styles.tag(activeTab === "inventory")} onClick={() => setActiveTab("inventory")}>Inventory</button>
        <button style={styles.tag(activeTab === "add")} onClick={() => setActiveTab("add")}>+ Add Dish</button>
      </div>

      {activeTab === "add" && (
        <div style={styles.block}>
          <h3 style={{ marginTop: 0 }}>Add a New Recipe</h3>
          
          <label style={{fontWeight: "bold", fontSize: "14px"}}>Dish Name</label>
          <input style={styles.input} placeholder="e.g. Tomato Egg Stir Fry" value={newDish.name} onChange={e => setNewDish({...newDish, name: e.target.value})} />

          <label style={{fontWeight: "bold", fontSize: "14px", display: "block", marginBottom: "8px"}}>Category</label>
          <div style={{ display: "flex", gap: "5px", marginBottom: "15px", flexWrap: "wrap" }}>
            {["main", "side", "veg"].map(cat => (
              <button key={cat} style={styles.tag(newDish.category === cat)} onClick={() => setNewDish({...newDish, category: cat})}>{cat.toUpperCase()}</button>
            ))}
          </div>

          <label style={{fontWeight: "bold", fontSize: "14px", display: "block", marginBottom: "8px"}}>Main Protein</label>
          <div style={{ display: "flex", gap: "5px", marginBottom: "15px", flexWrap: "wrap" }}>
            {["pork", "beef", "chicken", "seafood", "none"].map(pro => (
              <button key={pro} style={styles.tag(newDish.protein === pro)} onClick={() => setNewDish({...newDish, protein: pro})}>{pro.toUpperCase()}</button>
            ))}
          </div>

          <label style={{fontWeight: "bold", fontSize: "14px"}}>Ingredients (Comma separated)</label>
          <input style={styles.input} placeholder="e.g. tomato, egg, garlic" value={newDish.ingredients} onChange={e => setNewDish({...newDish, ingredients: e.target.value})} />

          <button style={styles.btn} onClick={handleAddDish}>Save Dish</button>
        </div>
      )}

      {activeTab === "inventory" && (
        <div>
          <p style={{ color: "#666" }}>Tap to mark as unavailable (gray means you need to buy it).</p>
          {inventoryCategories.map(category => {
            const itemsInCategory = masterIngredients.filter(item => getIngredientCategory(item) === category);
            if (itemsInCategory.length === 0) return null;
            return (
              <div key={category} style={styles.block}>
                <h3 style={{ marginTop: 0, color: "#444" }}>{category}</h3>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {itemsInCategory.map((item) => (
                    <button
                      key={item}
                      style={{...styles.tag(inventory[item]), borderColor: inventory[item] ? '#FF8CA1' : '#ddd', color: inventory[item] ? 'white' : '#aaa'}}
                      onClick={() => toggleIngredient(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "planner" && (
        <div>
          <div style={styles.block}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>Dining Size:</label>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {[
                { id: "small", label: "Small (2)" },
                { id: "medium", label: "Medium (3)" },
                { id: "large", label: "Large (4)" }
              ].map(size => (
                <button 
                  key={size.id} 
                  style={styles.tag(diningSize === size.id)} 
                  onClick={() => setDiningSize(size.id)}
                >
                  {size.label}
                </button>
              ))}
            </div>
            
            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "500" }}>
                <input type="checkbox" checked={existingOnly} onChange={(e) => setExistingOnly(e.target.checked)} style={{ width: "20px", height: "20px", accentColor: "#FF8CA1" }}/>
                Only use existing ingredients
              </label>
            </div>
          </div>

          <div style={{...styles.nav, borderBottom: "2px solid #eee", paddingBottom: "15px"}}>
            <button style={{...styles.tag(mode === "auto"), flex: 1}} onClick={() => setMode("auto")}>Auto-Suggest</button>
            <button style={{...styles.tag(mode === "manual"), flex: 1}} onClick={() => setMode("manual")}>Manual Build</button>
          </div>

          {mode === "auto" && (
            <div>
              <button style={styles.btn} onClick={handleAutoGenerate}>✨ Whip Up a Delicious Menu! ✨</button>
              {generatedMenu && (
                <div style={{...styles.block, marginTop: "20px"}}>
                  <h3 style={{ marginTop: 0 }}>Tonights Menu:</h3>
                  
                  {generatedMenu.main && (
                    <div style={styles.menuCard}>
                      <DishIcon type="main" />
                      <div><div style={{ fontSize: "18px", fontWeight: "bold" }}>{generatedMenu.main.name}</div></div>
                    </div>
                  )}
                  
                  {generatedMenu.sides.map((s, i) => (
                    <div style={styles.menuCard} key={i}>
                      <DishIcon type="side" />
                      <div><div style={{ fontSize: "18px", fontWeight: "bold" }}>{s.name}</div></div>
                    </div>
                  ))}

                  {generatedMenu.veg && (
                    <div style={{...styles.menuCard, borderBottom: "none"}}>
                      <DishIcon type="veg" />
                      <div><div style={{ fontSize: "18px", fontWeight: "bold" }}>{generatedMenu.veg.name}</div></div>
                    </div>
                  )}

                  <button style={{...styles.btn, background: "#34C759", boxShadow: "0 4px 12px rgba(52, 199, 89, 0.3)", marginTop: "20px"}} onClick={() => handleShare(generatedMenu)}>Send to WhatsApp</button>
                </div>
              )}
            </div>
          )}

          {mode === "manual" && (
            <div>
              <div style={styles.block}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}><DishIcon type="main" /><h3 style={{ margin: 0, fontSize: "20px" }}>Select Main</h3></div>
                {renderGroupedDishes(manualOptions.mains, (d) => setManualMenu({...manualMenu, main: d, side: null, veg: null}), manualMenu.main)}
              </div>

              {diningSize !== "small" && (
                <div style={styles.block}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}><DishIcon type="side" /><h3 style={{ margin: 0, fontSize: "20px" }}>Select Side</h3></div>
                  {renderGroupedDishes(manualOptions.sides, (d) => setManualMenu({...manualMenu, side: d, veg: null}), manualMenu.side)}
                </div>
              )}

              <div style={styles.block}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}><DishIcon type="veg" /><h3 style={{ margin: 0, fontSize: "20px" }}>Select Vegetable</h3></div>
                {renderGroupedDishes(manualOptions.vegs, (d) => setManualMenu({...manualMenu, veg: d}), manualMenu.veg)}
              </div>

              {(manualMenu.main && manualMenu.veg && (diningSize === "small" || manualMenu.side)) && (
                <button style={{...styles.btn, background: "#34C759", boxShadow: "0 4px 12px rgba(52, 199, 89, 0.3)", marginBottom: "30px"}} onClick={() => handleShare(manualMenu)}>Send to WhatsApp</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
