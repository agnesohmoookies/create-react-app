import React, { useState, useEffect, useMemo, useRef } from "react";

// --- CLOUD API URL ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwPuEREoE7cGkKzWEF_H17DO9-o-kKn0COEJDE-1SSlhSYfypFvHlRLiUy4GF9gUINr8g/exec";

// --- HELPER FUNCTIONS ---
const formatNameUI = (name) => name ? name.replace(/\s*\(.*?\)/g, '') : "";
const getRandomDish = (dishes) => dishes[Math.floor(Math.random() * dishes.length)];

const getIngredientCategory = (item) => {
  const lower = item.toLowerCase();
  const hasWord = (words) => new RegExp(`\\b(${words.join('|')})(s|es)?\\b`, 'i').test(lower);

  if (hasWord(["spring onion"])) return "Condiments";
  if (hasWord(["apple", "lemon"])) return "Fruits";
  if (hasWord(["peanut", "cashew"])) return "Nuts";
  if (hasWord(["rice paper", "dumpling skin", "vermicelli", "udon", "noodle"])) return "Grains & Wrappers";
  if (hasWord(["pork", "cha siu"])) return "Pork";
  if (hasWord(["fish", "clam", "shrimp", "scallop", "pomfret", "halibut", "squid", "octopus", "salmon", "noodlefish"])) return "Seafood";
  if (hasWord(["beef", "steak", "oxtail"])) return "Beef";
  if (hasWord(["chicken"])) return "Chicken";
  if (hasWord(["tofu", "soy"])) return "Soy";
  if (hasWord(["mushroom", "fungus"])) return "Mushrooms";
  if (hasWord(["cabbage", "pak choi", "choi sum", "spinach", "lettuce", "sprout"])) return "Leafy Greens";
  if (hasWord(["potato", "carrot", "radish", "melon", "chayote", "pumpkin", "yam", "chestnut", "lotus", "corn", "onion", "eggplant"])) return "Root Veggies & Gourds";
  if (hasWord(["scallion", "curry", "coconut", "garlic", "ginger", "osmanthus", "egg", "sauce", "butter", "salt", "mayo", "mayonnaise", "miso", "cheese", "vinegar", "coriander"])) return "Condiments";

  return "Other Veggies"; 
};

const CATEGORY_ORDER = ["Pork", "Beef", "Chicken", "Seafood", "Soy", "Leafy Greens", "Mushrooms", "Root Veggies & Gourds", "Other Veggies", "Fruits", "Nuts", "Grains & Wrappers", "Condiments", "Needs Review"];

export default function DinnerApp() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("planner"); 
  const [diningSize, setDiningSize] = useState("medium"); 
  const [shoppingMode, setShoppingMode] = useState("any"); 
  const [mode, setMode] = useState("auto");
  
  const [dishes, setDishes] = useState(() => {
    const local = localStorage.getItem("v3_dishes");
    return local ? JSON.parse(local) : [];
  });
  
  const [inventory, setInventory] = useState(() => {
    const local = localStorage.getItem("v3_inventory");
    return local ? JSON.parse(local) : {};
  });

  const [ingredientCategories, setIngredientCategories] = useState(() => {
    const local = localStorage.getItem("v3_categories");
    return local ? JSON.parse(local) : {};
  });

  const [newDish, setNewDish] = useState({ name: "", category: "main", protein: "", ingredients: [], remarks: "", onePerson: false });
  const [ingredientInput, setIngredientInput] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [manualSearch, setManualSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [extraShoppingItems, setExtraShoppingItems] = useState([]);
  const [extraShoppingInput, setExtraShoppingInput] = useState("");
  const [generatedMenu, setGeneratedMenu] = useState(null);
  const [manualMenu, setManualMenu] = useState({ mains: [], sides: [], veg: null });
  const [autoWarning, setAutoWarning] = useState(""); 

  const hasFetched = useRef(false);
  const menuRef = useRef(null);
  const mainRef = useRef(null);
  const sideRef = useRef(null);
  const vegRef = useRef(null);
  const shareRef = useRef(null);
  const searchRef = useRef(null); // NEW: Anchor for the manual search box

  const masterIngredients = useMemo(() => Object.keys(inventory).sort(), [inventory]);

  // --- BACKGROUND CLOUD SYNC ---
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setIsSyncing(true);

    const syncWithCloud = async () => {
      try {
        const response = await fetch(SCRIPT_URL);
        const cloudData = await response.json();
        
        if (cloudData.dishes && cloudData.dishes.length > 0) {
          const parsedDishes = cloudData.dishes.map(d => ({
            id: d["ID"], name: d["Name"], category: String(d["Category"] || "main").trim().toLowerCase(), 
            protein: String(d["Protein"] || "none").trim().toLowerCase(),
            ingredients: typeof d["Ingredients"] === "string" ? d["Ingredients"].split(",").map(i => i.trim().toLowerCase()).filter(i=>i) : [],
            remarks: d["Remarks"] || "",
            onePerson: d["One Person"] === true || String(d["One Person"]).toUpperCase() === "TRUE"
          }));
          setDishes(parsedDishes);
          localStorage.setItem("v3_dishes", JSON.stringify(parsedDishes));
        }

        if (cloudData.ingredients && cloudData.ingredients.length > 0) {
          const newInv = {}; const newCats = {};
          cloudData.ingredients.forEach(row => {
            const ingName = row["Ingredient"];
            if (ingName) {
              const trimmedName = String(ingName).trim(); 
              newInv[trimmedName] = row["In Stock"] === true || String(row["In Stock"]).toUpperCase() === "TRUE";
              newCats[trimmedName] = row["Category"] || "Needs Review";
            }
          });
          setInventory(newInv);
          setIngredientCategories(newCats);
          localStorage.setItem("v3_inventory", JSON.stringify(newInv));
          localStorage.setItem("v3_categories", JSON.stringify(newCats));
        }
      } catch (error) {
        console.error("Background sync failed:", error);
      }
      setIsSyncing(false);
    };
    
    syncWithCloud();
  }, []);

  // --- ACTIONS ---
  const toggleIngredient = (item) => {
    const newVal = !inventory[item];
    const updated = { ...inventory, [item]: newVal };
    
    setInventory(updated); 
    localStorage.setItem("v3_inventory", JSON.stringify(updated)); 
    
    fetch(SCRIPT_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "updateInventory", inventory: { [item]: newVal ? "TRUE" : "FALSE" } })
    }).catch(err => console.error("Cloud save failed", err));
  };

  const handleAddDish = () => {
    if (!newDish.name || newDish.ingredients.length === 0) return alert("Please fill in name and at least one ingredient!");
    
    const dishToSave = {
      id: "c_" + Date.now(), name: newDish.name, category: newDish.category, protein: newDish.protein || "none", 
      ingredients: newDish.ingredients, remarks: newDish.remarks.trim(), onePerson: newDish.onePerson
    };
    
    const updatedDishes = [...dishes, dishToSave];
    setDishes(updatedDishes);
    localStorage.setItem("v3_dishes", JSON.stringify(updatedDishes));

    const updatedInv = { ...inventory };
    const updatedCats = { ...ingredientCategories };
    const newIngredientsPayload = {};
    let hasNewIngs = false;

    dishToSave.ingredients.forEach(ing => {
      const trimmedIng = ing.trim();
      const existingKey = Object.keys(inventory).find(k => k.toLowerCase() === trimmedIng.toLowerCase());
      
      if (!existingKey) {
        updatedInv[trimmedIng] = true;
        updatedCats[trimmedIng] = getIngredientCategory(trimmedIng); 
        newIngredientsPayload[trimmedIng] = "TRUE";
        hasNewIngs = true;
      }
    });

    if (hasNewIngs) {
      setInventory(updatedInv);
      setIngredientCategories(updatedCats);
      localStorage.setItem("v3_inventory", JSON.stringify(updatedInv));
      localStorage.setItem("v3_categories", JSON.stringify(updatedCats));
      
      fetch(SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ action: "updateInventory", inventory: newIngredientsPayload })
      });
    }

    const payloadDish = {
      id: dishToSave.id, name: dishToSave.name, category: dishToSave.category,
      protein: dishToSave.protein, ingredients: dishToSave.ingredients.join(", "),
      remarks: dishToSave.remarks, onePerson: dishToSave.onePerson ? "TRUE" : "FALSE"
    };
    
    fetch(SCRIPT_URL, {
      method: "POST", mode: "no-cors",
      body: JSON.stringify({ action: "addDish", dish: payloadDish })
    });
    
    alert("Dish added successfully!");
    setNewDish({ name: "", category: "main", protein: "", ingredients: [], remarks: "", onePerson: false });
  };

  // AUTO SCROLL LOGIC
  useEffect(() => {
    if (mode === "auto" && generatedMenu && menuRef.current) setTimeout(() => menuRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [generatedMenu, mode]);

  useEffect(() => {
    if (mode === "manual") {
      if (diningSize === "one") {
         if (manualMenu.mains.length === 1 && shareRef.current) setTimeout(() => shareRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      } else {
          const numMains = diningSize === "xlarge" ? 2 : 1;
          const numSides = diningSize === "small" ? 0 : diningSize === "large" ? 2 : 1;
          if (manualMenu.mains.length === numMains && manualMenu.sides.length < numSides && sideRef.current) setTimeout(() => sideRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
          else if (manualMenu.mains.length === numMains && manualMenu.sides.length === numSides && manualMenu.veg === null && vegRef.current) setTimeout(() => vegRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
          else if (manualMenu.mains.length === numMains && manualMenu.sides.length === numSides && manualMenu.veg !== null && shareRef.current) setTimeout(() => shareRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
    }
  }, [manualMenu, mode, diningSize]);

  // MENU GENERATION LOGIC
  const availableIngredientsList = Object.keys(inventory).filter((i) => inventory[i]);

  const getMissingIngredients = (menu) => {
    let required = [];
    if (menu.mains) menu.mains.forEach(m => { if(m) required.push(...m.ingredients); });
    if (menu.sides) menu.sides.forEach(s => { if(s) required.push(...s.ingredients); });
    if (menu.veg) required.push(...menu.veg.ingredients);
    
    const uniqueRequired = [...new Set(required)];
    const availableLower = availableIngredientsList.map(i => i.trim().toLowerCase());
    
    return uniqueRequired.filter(ing => !availableLower.includes(ing.trim().toLowerCase()));
  };

  const handleAutoGenerate = () => {
    let bestMenu = null;
    let bestMissingCount = 999;
    
    for(let attempts = 0; attempts < 100; attempts++) {
        let usedProteins = [];
        let tempMenu = { mains: [], sides: [], veg: null };
        let isValid = true;

        if (diningSize === "one") {
            const onePersonOptions = dishes.filter(d => d.onePerson && (d.category === "main" || d.category === "side"));
            if (onePersonOptions.length > 0) tempMenu.mains.push(getRandomDish(onePersonOptions));
            else isValid = false;
        } else {
            const mains = dishes.filter(d => d.category === "main");
            const sides = dishes.filter(d => d.category === "side");
            const vegs = dishes.filter(d => d.category === "veg");

            const numMains = diningSize === "xlarge" ? 2 : 1;
            const numSides = diningSize === "small" ? 0 : diningSize === "large" ? 2 : 1;

            for (let i = 0; i < numMains; i++) {
                const availableMains = mains.filter(m => !usedProteins.includes(m.protein) && !tempMenu.mains.includes(m));
                if (availableMains.length > 0) {
                    const picked = getRandomDish(availableMains);
                    tempMenu.mains.push(picked);
                    if (picked.protein !== "none" && picked.protein !== "seafood") usedProteins.push(picked.protein);
                } else isValid = false;
            }

            for (let i = 0; i < numSides; i++) {
                const availableSides = sides.filter(s => !usedProteins.includes(s.protein) && !tempMenu.sides.includes(s));
                if (availableSides.length > 0) {
                    const picked = getRandomDish(availableSides);
                    tempMenu.sides.push(picked);
                    if (picked.protein !== "none" && picked.protein !== "seafood") usedProteins.push(picked.protein);
                } else isValid = false;
            }

            const availableVegs = vegs.filter(v => !usedProteins.includes(v.protein));
            if (availableVegs.length > 0) tempMenu.veg = getRandomDish(availableVegs);
            else isValid = false;
        }

        if (!isValid) continue;

        const missingCount = getMissingIngredients(tempMenu).length;
        if (missingCount < bestMissingCount) { bestMissingCount = missingCount; bestMenu = tempMenu; }
        if (shoppingMode === "any" || (shoppingMode === "minimal" && missingCount <= 3) || (shoppingMode === "none" && missingCount === 0)) break; 
    }

    if (bestMenu) {
      if (shoppingMode !== "any" && bestMissingCount > (shoppingMode === "none" ? 0 : 3)) {
        setAutoWarning(`We couldn't find a perfect match for your pantry. Here is the closest option! (Missing ${bestMissingCount} items)`);
      } else {
        setAutoWarning("");
      }
      setGeneratedMenu(bestMenu);
    } else {
      alert("We couldn't generate a valid menu. Try changing your dining size or adding more dishes to your database!");
    }
  };

  const getManualOptions = (type) => {
    let usedOther = []; let usedSelf = [];

    if (type === 'main') {
      manualMenu.sides.forEach(s => { if(s && s.protein !== "none" && s.protein !== "seafood") usedOther.push(s.protein); });
      manualMenu.mains.forEach(m => { if(m && m.protein !== "none" && m.protein !== "seafood") usedSelf.push(m.protein); });
    } else if (type === 'side') {
      manualMenu.mains.forEach(m => { if(m && m.protein !== "none" && m.protein !== "seafood") usedOther.push(m.protein); });
      manualMenu.sides.forEach(s => { if(s && s.protein !== "none" && s.protein !== "seafood") usedSelf.push(s.protein); });
    } else if (type === 'veg') {
      manualMenu.mains.forEach(m => { if(m && m.protein !== "none" && m.protein !== "seafood") usedOther.push(m.protein); });
      manualMenu.sides.forEach(s => { if(s && s.protein !== "none" && s.protein !== "seafood") usedOther.push(s.protein); });
    }

    let pool = dishes.filter(d => d.category === type);
    if (diningSize === "one") pool = dishes.filter(d => d.onePerson && (d.category === "main" || d.category === "side"));

    return pool.filter(d => {
       if (usedOther.includes(d.protein)) return false;
       const isSelectedSelf = (type === 'main' && manualMenu.mains.find(m => m.id === d.id)) || (type === 'side' && manualMenu.sides.find(s => s.id === d.id)) || (type === 'veg' && manualMenu.veg?.id === d.id);
       if (!isSelectedSelf && usedSelf.includes(d.protein)) return false;

       const simulatedMenu = { mains: [...manualMenu.mains], sides: [...manualMenu.sides], veg: manualMenu.veg };
       if (type === 'main' || diningSize === 'one') {
           if (!isSelectedSelf) {
               if (simulatedMenu.mains.length < (diningSize === "xlarge" ? 2 : 1)) simulatedMenu.mains.push(d);
               else simulatedMenu.mains[0] = d; 
           }
       } else if (type === 'side') {
           if (!isSelectedSelf) {
               if (simulatedMenu.sides.length < (diningSize === "large" ? 2 : 1)) simulatedMenu.sides.push(d);
               else simulatedMenu.sides[0] = d;
           }
       } else if (type === 'veg') {
           simulatedMenu.veg = d;
       }
       
       const missingCount = getMissingIngredients(simulatedMenu).length;
       if (shoppingMode === "none" && missingCount > 0) return false;
       if (shoppingMode === "minimal" && missingCount > 3) return false;
       return true;
    });
  };

  const toggleManualSelection = (type, dish, maxLimit) => {
    if (type === 'veg') { setManualMenu({...manualMenu, veg: manualMenu.veg?.id === dish.id ? null : dish}); return; }
    let current = [...manualMenu[type]];
    const index = current.findIndex(item => item && item.id === dish.id);
    if (index >= 0) current.splice(index, 1); 
    else { if (current.length >= maxLimit) current.shift(); current.push(dish); }
    setManualMenu({...manualMenu, [type]: current});
  };

  const handleShare = (menuToShare) => {
    const baseShoppingList = getMissingIngredients(menuToShare);
    const combinedList = [...baseShoppingList, ...extraShoppingItems];
    const finalShoppingList = [...new Set(combinedList.map(item => item.toLowerCase()))];

    let text = `*Tonight's Dinner*\n`;
    if (menuToShare.mains) menuToShare.mains.forEach((m) => (text += `• ${m.name}${m.remarks ? ` (${m.remarks})` : ""}\n`));
    if (menuToShare.sides) menuToShare.sides.forEach((s) => (text += `• ${s.name}${s.remarks ? ` (${s.remarks})` : ""}\n`));
    if (menuToShare.veg) text += `• ${menuToShare.veg.name}${menuToShare.veg.remarks ? ` (${menuToShare.veg.remarks})` : ""}\n`;

    if (finalShoppingList.length > 0) {
      text += `\n*Shopping List*\n`;
      finalShoppingList.forEach((item) => (text += `☐ ${item}\n`));
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const numMains = diningSize === "xlarge" ? 2 : 1;
  const numSides = diningSize === "one" ? 0 : diningSize === "small" ? 0 : diningSize === "large" ? 2 : 1;
  
  const filterBySearch = (options) => {
    if (!manualSearch.trim()) return options;
    const lowerSearch = manualSearch.toLowerCase();
    return options.filter(d => d.name.toLowerCase().includes(lowerSearch));
  };

  const manualOptionsAny = mode === "manual" && diningSize === "one" ? filterBySearch(getManualOptions('any')) : [];
  const manualOptionsMain = mode === "manual" && diningSize !== "one" ? filterBySearch(getManualOptions('main')) : [];
  const manualOptionsSide = mode === "manual" && diningSize !== "one" && numSides > 0 ? filterBySearch(getManualOptions('side')) : [];
  const manualOptionsVeg = mode === "manual" && diningSize !== "one" ? filterBySearch(getManualOptions('veg')) : [];

  // --- UI COMPONENTS & STYLES ---
  const styles = {
    container: { fontFamily: "system-ui", maxWidth: "500px", margin: "0 auto", padding: "15px", color: "#333" },
    nav: { display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "5px" },
    tag: (isActive) => ({
      padding: "10px 16px", borderRadius: "20px", border: "1.5px solid #FF8CA1", fontSize: "14px",
      background: isActive ? "#FF8CA1" : "transparent", fontWeight: "600", 
      whiteSpace: "normal", wordBreak: "break-word", textAlign: "left", height: "auto", 
      color: isActive ? "white" : "#FF8CA1", cursor: "pointer", margin: "5px 5px 5px 0"
    }),
    iconBtn: (isActive) => ({
      display: "flex", alignItems: "center", justifyContent: "center",
      width: "60px", height: "60px", borderRadius: "16px", border: "2px solid #FF8CA1",
      background: isActive ? "#FF8CA1" : "transparent",
      color: isActive ? "white" : "#FF8CA1", cursor: "pointer", padding: "0"
    }),
    block: { marginBottom: "20px", padding: "20px", background: "#f9f9f9", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", position: "relative" },
    btn: { background: "#FF8CA1", color: "white", padding: "16px", border: "none", borderRadius: "14px", width: "100%", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", boxShadow: "0 4px 12px rgba(255, 140, 161, 0.3)" },
    categoryHeader: { fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "#888", marginTop: "15px", marginBottom: "8px" },
    menuCard: { display: "flex", alignItems: "center", gap: "15px", padding: "12px 0", borderBottom: "1px solid #eee" },
    input: { width: "100%", padding: "14px 20px", borderRadius: "20px", border: "1px solid #ddd", marginBottom: "15px", boxSizing: "border-box", fontSize: "16px" },
    syncingIndicator: { textAlign: "center", color: "#FF8CA1", fontSize: "12px", fontWeight: "bold", marginBottom: "10px", height: "15px" }
  };

  const DishIcon = ({ type }) => {
    let emoji = "🍲"; let bgColor = "#FFF0C2"; 
    if (type === "side") { emoji = "🍤"; bgColor = "#D0E8FF"; } 
    if (type === "veg") { emoji = "🥦"; bgColor = "#D4F0D0"; } 
    return (
      <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", flexShrink: 0 }}>
        {emoji}
      </div>
    );
  };

  const renderGroupedDishesMulti = (dishesPool, selectedItemsArray, isSide = false, onSelect) => {
    const defaultGroups = [
      { id: "pork", label: "Pork" }, { id: "beef", label: "Beef" }, 
      { id: "chicken", label: "Chicken" }, { id: "seafood", label: "Seafood" }, 
      { id: "soy", label: "Soy" }, { id: "none", label: "Veg/Other" }
    ];
    const sideGroups = [{ id: "cold", label: "Cold Dish" }, { id: "egg", label: "Egg" }, ...defaultGroups];
    const groupsToUse = isSide ? sideGroups : defaultGroups;

    return groupsToUse.map(group => {
      const filtered = dishesPool.filter(d => {
        const lowerName = d.name.toLowerCase();
        if (isSide) {
          const isCold = lowerName.includes("cold");
          const isEgg = !isCold && (lowerName.includes("steam egg") || lowerName.includes("stir fry egg") || lowerName.includes("fry egg"));
          if (group.id === "cold") return isCold;
          if (group.id === "egg") return isEgg;
          if (isCold || isEgg) return false; 
        }
        return d.protein === group.id;
      });

      if (filtered.length === 0) return null;
      return (
        <div key={group.id}>
          <div style={styles.categoryHeader}>{group.label}</div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {filtered.map(d => {
              const isSelected = selectedItemsArray.some(item => item && item.id === d.id);
              return <button key={d.id} style={styles.tag(isSelected)} onClick={() => onSelect(d)}>{formatNameUI(d.name)}</button>;
            })}
          </div>
        </div>
      );
    });
  };

  const renderShareSection = (menuToShare) => (
    <>
      <label style={{fontWeight: "bold", fontSize: "16px", display: "block", marginBottom: "8px", marginTop: "10px"}}>🥑 Add extra items to shopping list</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
        {extraShoppingItems.map(ing => (
          <span key={ing} style={{ background: "#FF8CA1", color: "white", padding: "6px 12px", borderRadius: "15px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
            {ing} <button style={{ border: "none", background: "none", cursor: "pointer", color: "white", padding: 0, fontWeight: "bold", fontSize: "16px" }} onClick={() => setExtraShoppingItems(extraShoppingItems.filter(i => i !== ing))}>×</button>
          </span>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <input 
          style={{...styles.input, marginBottom: "0"}} 
          placeholder="Type an item & press enter..." 
          value={extraShoppingInput} 
          onChange={e => setExtraShoppingInput(e.target.value)}
          onKeyDown={e => {
            if(e.key === 'Enter' && extraShoppingInput.trim()) {
              const term = extraShoppingInput.trim().toLowerCase();
              if(!extraShoppingItems.includes(term)) setExtraShoppingItems([...extraShoppingItems, term]);
              setExtraShoppingInput("");
            }
          }}
        />
        {extraShoppingInput && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, border: "1px solid #ddd", borderTop: "none", borderRadius: "0 0 10px 10px", maxHeight: "150px", overflowY: "auto", background: "#fff", padding: "5px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            {masterIngredients.filter(i => i.toLowerCase().includes(extraShoppingInput.toLowerCase())).slice(0, 5).map(sug => (
              <div key={sug} style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee" }} onClick={() => {
                if(!extraShoppingItems.includes(sug)) setExtraShoppingItems([...extraShoppingItems, sug]);
                setExtraShoppingInput("");
              }}>{sug}</div>
            ))}
            {!masterIngredients.find(i => i.toLowerCase() === extraShoppingInput.trim().toLowerCase()) && (
              <div style={{ padding: "10px", cursor: "pointer", color: "#FF8CA1", fontWeight: "bold" }} onClick={() => {
                setExtraShoppingItems([...extraShoppingItems, extraShoppingInput.trim().toLowerCase()]);
                setExtraShoppingInput("");
              }}>+ Add new: "{extraShoppingInput}"</div>
            )}
          </div>
        )}
      </div>
      <button style={{...styles.btn, background: "#34C759", boxShadow: "0 4px 12px rgba(52, 199, 89, 0.3)", marginTop: "20px"}} onClick={() => handleShare(menuToShare)}>Send to WhatsApp</button>
    </>
  );

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: "center", color: "#FF8CA1", margin: "10px 0 5px 0" }}>🍽️ Dinner Planner</h2>
      
      <div style={styles.syncingIndicator}>
        {isSyncing ? "Teleporting to your kitchen... 🪄🍳" : ""}
      </div>
      
      <div style={styles.nav}>
        <button style={styles.tag(activeTab === "planner")} onClick={() => setActiveTab("planner")}>Meal Planner</button>
        <button style={styles.tag(activeTab === "inventory")} onClick={() => setActiveTab("inventory")}>Inventory</button>
        <button style={styles.tag(activeTab === "add")} onClick={() => setActiveTab("add")}>+ Add Dish</button>
      </div>

      {activeTab === "add" && (
        <div style={styles.block}>
          <h3 style={{ marginTop: 0 }}>Add a New Dish</h3>
          <label style={{fontWeight: "bold", fontSize: "14px"}}>Dish Name</label>
          <input style={styles.input} placeholder="Name a dish..." value={newDish.name} onChange={e => setNewDish({...newDish, name: e.target.value})} />
          <label style={{fontWeight: "bold", fontSize: "14px", display: "block", marginBottom: "8px"}}>Category</label>
          <div style={{ display: "flex", gap: "5px", marginBottom: "15px", flexWrap: "wrap" }}>
            {["main", "side", "veg"].map(cat => (
              <button key={cat} style={styles.tag(newDish.category === cat)} onClick={() => setNewDish({...newDish, category: cat})}>{cat.toUpperCase()}</button>
            ))}
          </div>
          <label style={{fontWeight: "bold", fontSize: "14px", display: "block", marginBottom: "8px"}}>Main Protein (Optional)</label>
          <div style={{ display: "flex", gap: "5px", marginBottom: "15px", flexWrap: "wrap" }}>
            {["pork", "beef", "chicken", "seafood", "soy"].map(pro => (
              <button key={pro} style={styles.tag(newDish.protein === pro)} onClick={() => setNewDish({...newDish, protein: newDish.protein === pro ? "" : pro})}>{pro.toUpperCase()}</button>
            ))}
          </div>
          <label style={{fontWeight: "bold", fontSize: "14px", display: "block", marginBottom: "8px"}}>Ingredients</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
            {newDish.ingredients.map(ing => (
              <span key={ing} style={{ background: "#FF8CA1", color: "white", padding: "6px 12px", borderRadius: "15px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
                {ing} <button style={{ border: "none", background: "none", cursor: "pointer", color: "white", padding: 0, fontWeight: "bold", fontSize: "16px" }} onClick={() => setNewDish({...newDish, ingredients: newDish.ingredients.filter(i => i !== ing)})}>×</button>
              </span>
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <input 
              style={{...styles.input, marginBottom: "0"}} placeholder="Type an ingredient & press enter..." value={ingredientInput} 
              onChange={e => setIngredientInput(e.target.value)}
              onKeyDown={e => {
                if(e.key === 'Enter' && ingredientInput.trim()) {
                  const term = ingredientInput.trim().toLowerCase();
                  if(!newDish.ingredients.includes(term)) setNewDish({...newDish, ingredients: [...newDish.ingredients, term]});
                  setIngredientInput("");
                }
              }}
            />
            {ingredientInput && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, border: "1px solid #ddd", borderTop: "none", borderRadius: "0 0 10px 10px", maxHeight: "150px", overflowY: "auto", background: "#fff", padding: "5px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                {masterIngredients.filter(i => i.toLowerCase().includes(ingredientInput.toLowerCase())).slice(0, 5).map(sug => (
                  <div key={sug} style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee" }} onClick={() => {
                    if(!newDish.ingredients.includes(sug)) setNewDish({...newDish, ingredients: [...newDish.ingredients, sug]});
                    setIngredientInput("");
                  }}>{sug}</div>
                ))}
                {!masterIngredients.find(i => i.toLowerCase() === ingredientInput.trim().toLowerCase()) && (
                  <div style={{ padding: "10px", cursor: "pointer", color: "#FF8CA1", fontWeight: "bold" }} onClick={() => {
                    setNewDish({...newDish, ingredients: [...newDish.ingredients, ingredientInput.trim().toLowerCase()]});
                    setIngredientInput("");
                  }}>+ Add new: "{ingredientInput}"</div>
                )}
              </div>
            )}
          </div>
          <div style={{marginTop: "15px"}}>
            <label style={{fontWeight: "bold", fontSize: "14px"}}>Remarks (Optional)</label>
            <input style={styles.input} placeholder="Cookbook p.92..." value={newDish.remarks} onChange={e => setNewDish({...newDish, remarks: e.target.value})} />
          </div>
          <div style={{marginTop: "10px", marginBottom: "20px"}}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "500", fontSize: "14px" }}>
              <input type="checkbox" checked={newDish.onePerson} onChange={(e) => setNewDish({...newDish, onePerson: e.target.checked})} style={{ width: "20px", height: "20px", accentColor: "#FF8CA1" }}/>
              Great for One Person meals
            </label>
          </div>
          <button style={styles.btn} onClick={handleAddDish}>Save Dish</button>
        </div>
      )}

      {activeTab === "inventory" && (
        <div style={{ position: "relative" }}>
          <input style={{...styles.input, marginBottom: '20px'}} placeholder="🔍 Search ingredients..." value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} />
          {CATEGORY_ORDER.map(category => {
            const itemsInCategory = masterIngredients.filter(item => ingredientCategories[item] === category);
            const searchedItems = itemsInCategory.filter(item => item.toLowerCase().includes(inventorySearch.toLowerCase()));
            if (searchedItems.length === 0) return null; 
            return (
              <div key={category} style={styles.block}>
                <h3 style={{ marginTop: 0, color: "#444" }}>{category}</h3>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {searchedItems.map((item) => (
                    <button key={item} style={{...styles.tag(inventory[item]), borderColor: inventory[item] ? '#FF8CA1' : '#ddd', color: inventory[item] ? 'white' : '#aaa'}} onClick={() => toggleIngredient(item)}>{item}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "planner" && (
        <div style={{ position: "relative" }}>
          <div style={styles.block}>
            <label style={{ fontWeight: "bold", display: "block", textAlign: "center", marginBottom: "10px", fontSize: "16px" }}>Dining Size</label>
            <div style={{ display: "flex", justifyContent: "center", gap: "5px", flexWrap: "wrap" }}>
              {[{ id: "one", label: "1" }, { id: "small", label: "2" }, { id: "medium", label: "3" }, { id: "large", label: "4" }, { id: "xlarge", label: "5+" }].map(size => (
                <button key={size.id} style={styles.tag(diningSize === size.id)} onClick={() => { setDiningSize(size.id); setManualMenu({ mains: [], sides: [], veg: null }); }}>{size.label}</button>
              ))}
            </div>
            
            <div style={{ marginTop: "20px" }}>
              <label style={{ fontWeight: "bold", display: "block", textAlign: "center", marginBottom: "10px", fontSize: "16px" }}>Shopping Preference</label>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                <button style={styles.iconBtn(shoppingMode === "any")} onClick={() => setShoppingMode("any")}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h2l2.5 12.5A2 2 0 0 0 9.5 17h8a2 2 0 0 0 1.9-1.5L21 6H6" />
                    <circle cx="10" cy="20.5" r="1.5" />
                    <circle cx="18" cy="20.5" r="1.5" />
                    <rect x="6.5" y="1.5" width="4" height="6" fill="currentColor" stroke="none" rx="0.5" transform="rotate(-5 8.5 4.5)"/>
                    <path d="M10.5 8 A3 3 0 0 1 15.5 8 Q16.5 10, 15.5 12 H10.5 Z" fill="currentColor" stroke="none"/>
                    <circle cx="13" cy="6" r="2.5" fill="currentColor" stroke="none"/>
                    <path d="M17 11 V4 Q17 2.5, 18.5 2.5 H19 Q20.5 2.5, 20.5 4 V11 Z" fill="currentColor" stroke="none" />
                    <line x1="8" y1="13" x2="19" y2="13" />
                  </svg>
                </button>
                <button style={styles.iconBtn(shoppingMode === "minimal")} onClick={() => setShoppingMode("minimal")}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h2l2.5 12.5A2 2 0 0 0 9.5 17h8a2 2 0 0 0 1.9-1.5L21 6H6" />
                    <circle cx="10" cy="20.5" r="1.5" />
                    <circle cx="18" cy="20.5" r="1.5" />
                    <rect x="8.5" y="11" width="4.5" height="6" rx="1" fill="currentColor" stroke="none" />
                    <circle cx="15.5" cy="14" r="2.5" fill="currentColor" stroke="none" />
                  </svg>
                </button>
                <button style={styles.iconBtn(shoppingMode === "none")} onClick={() => setShoppingMode("none")}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h2l2.5 12.5A2 2 0 0 0 9.5 17h8a2 2 0 0 0 1.9-1.5L21 6H6" />
                    <circle cx="10" cy="20.5" r="1.5" />
                    <circle cx="18" cy="20.5" r="1.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div style={{...styles.nav, borderBottom: "2px solid #eee", paddingBottom: "15px"}}>
            <button style={{...styles.tag(mode === "auto"), flex: 1, textAlign: "center"}} onClick={() => setMode("auto")}>💡 Surprise me</button>
            <button style={{...styles.tag(mode === "manual"), flex: 1, textAlign: "center"}} onClick={() => {
              setMode("manual");
              setTimeout(() => { if (searchRef.current) searchRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
            }}>💭 Let me think</button>
          </div>

          {mode === "auto" && (
            <div>
              <button style={styles.btn} onClick={handleAutoGenerate}>☝🏻 What's for dinner tonight?</button>
              {generatedMenu && (
                <div ref={menuRef} style={{...styles.block, marginTop: "20px"}}>
                  {autoWarning && (
                    <div style={{ backgroundColor: "#FFE5E5", border: "2px solid #FF4D4D", padding: "15px", marginBottom: "20px", borderRadius: "12px", fontSize: "15px", color: "#990000", textAlign: "center", lineHeight: "1.4" }}>
                      <strong>⚠️ We couldn't find a perfect match!</strong><br/>
                      {autoWarning}
                    </div>
                  )}
                  <h3 style={{ marginTop: 0 }}>Tonight's Menu:</h3>
                  {generatedMenu.mains.map((m, i) => (<div style={styles.menuCard} key={`auto-m-${i}`}><DishIcon type="main" /><div style={{ fontSize: "18px", fontWeight: "bold" }}>{formatNameUI(m.name)}</div></div>))}
                  {generatedMenu.sides.map((s, i) => (<div style={styles.menuCard} key={`auto-s-${i}`}><DishIcon type="side" /><div style={{ fontSize: "18px", fontWeight: "bold" }}>{formatNameUI(s.name)}</div></div>))}
                  {generatedMenu.veg && (<div style={{...styles.menuCard, borderBottom: "none"}}><DishIcon type="veg" /><div style={{ fontSize: "18px", fontWeight: "bold" }}>{formatNameUI(generatedMenu.veg.name)}</div></div>)}
                  <div style={{ marginTop: "20px", paddingTop: "10px", borderTop: "1px solid #eee" }}>{renderShareSection(generatedMenu)}</div>
                </div>
              )}
            </div>
          )}

          {mode === "manual" && (
            <div>
              {/* SEARCH BAR FOR MANUAL MODE WITH ANCHOR AND CLEAR BUTTON */}
              <div ref={searchRef} style={{ position: "relative", marginBottom: '20px' }}>
                <input 
                  style={{...styles.input, marginBottom: 0, paddingRight: "40px"}} 
                  placeholder="🔍 Search dishes..." 
                  value={manualSearch} 
                  onChange={e => setManualSearch(e.target.value)} 
                />
                {manualSearch && (
                  <button 
                    onClick={() => setManualSearch("")}
                    style={{
                      position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", fontSize: "22px", color: "#aaa", cursor: "pointer", padding: 0
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              
              {diningSize === "one" ? (
                <div style={styles.block} ref={mainRef}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}><DishIcon type="main" /><h3 style={{ margin: 0, fontSize: "20px" }}>Select Dish</h3></div>
                  {manualOptionsAny.length === 0 ? (
                    <div style={{ color: "#FF8CA1", fontStyle: "italic", padding: "10px 0" }}>No dishes match your exact inventory or search. Try changing your shopping cart preference above!</div>
                  ) : (
                    renderGroupedDishesMulti(manualOptionsAny, manualMenu.mains, false, (d) => toggleManualSelection('mains', d, 1))
                  )}
                </div>
              ) : (
                <>
                  <div style={styles.block} ref={mainRef}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}><DishIcon type="main" /><h3 style={{ margin: 0, fontSize: "20px" }}>Select Main {numMains > 1 ? `(Pick ${numMains})` : ''}</h3></div>
                    {manualOptionsMain.length === 0 ? (
                      <div style={{ color: "#FF8CA1", fontStyle: "italic", padding: "10px 0" }}>No dishes match your exact inventory or search. Try changing your shopping cart preference above!</div>
                    ) : (
                      renderGroupedDishesMulti(manualOptionsMain, manualMenu.mains, false, (d) => toggleManualSelection('mains', d, numMains))
                    )}
                  </div>
                  {numSides > 0 && (
                    <div style={styles.block} ref={sideRef}>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}><DishIcon type="side" /><h3 style={{ margin: 0, fontSize: "20px" }}>Select Side {numSides > 1 ? `(Pick ${numSides})` : ''}</h3></div>
                      {manualOptionsSide.length === 0 ? (
                        <div style={{ color: "#FF8CA1", fontStyle: "italic", padding: "10px 0" }}>No dishes match your exact inventory or search. Try changing your shopping cart preference above!</div>
                      ) : (
                        renderGroupedDishesMulti(manualOptionsSide, manualMenu.sides, true, (d) => toggleManualSelection('sides', d, numSides))
                      )}
                    </div>
                  )}
                  <div style={styles.block} ref={vegRef}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}><DishIcon type="veg" /><h3 style={{ margin: "0", fontSize: "20px" }}>Select Vegetable</h3></div>
                    {manualOptionsVeg.length === 0 ? (
                      <div style={{ color: "#FF8CA1", fontStyle: "italic", padding: "10px 0" }}>No dishes match your exact inventory or search. Try changing your shopping cart preference above!</div>
                    ) : (
                      renderGroupedDishesMulti(manualOptionsVeg, [manualMenu.veg], false, (d) => toggleManualSelection('veg', d, 1))
                    )}
                  </div>
                </>
              )}
              {((diningSize === "one" && manualMenu.mains.length === 1) || (diningSize !== "one" && manualMenu.mains.length === numMains && manualMenu.sides.length === numSides && manualMenu.veg !== null)) && (
                <div style={{...styles.block, marginBottom: "30px"}} ref={shareRef}>{renderShareSection(manualMenu)}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
