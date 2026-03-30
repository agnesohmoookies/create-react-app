import React, { useState, useEffect, useMemo, useRef } from "react";

// --- CLOUD API URL ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwPuEREoE7cGkKzWEF_H17DO9-o-kKn0COEJDE-1SSlhSYfypFvHlRLiUy4GF9gUINr8g/exec";

// --- 1. OUR DATABASE ---
const DEFAULT_DISHES = [
  { id: "m1", name: "Dumplings in two types (Chinese chive and minced pork, Chinese celery, Chinese mushroom and minced pork)", category: "main", protein: "pork", ingredients: ["dumpling skin", "minced pork", "chinese chive", "chinese celery", "chinese mushroom"], onePerson: true },
  { id: "m2", name: "Rice in winter melon, minced pork, Chinese mushroom, Coriander soup", category: "main", protein: "pork", ingredients: ["winter melon", "minced pork", "chinese mushroom", "coriander"], onePerson: true },
  { id: "m3", name: "Steam shrimps with garlic and vermicelli", category: "main", protein: "seafood", ingredients: ["fresh shrimp", "garlic", "vermicelli"] },
  { id: "m4", name: "Pork ribs and chestnut stew", category: "main", protein: "pork", ingredients: ["pork ribs", "chestnut"] },
  { id: "m5", name: "Apple and pork rolls", category: "main", protein: "pork", ingredients: ["pork slice", "apple"] },
  { id: "m6", name: "Whole chicken thigh with apple, onion and Chinese cabbage", category: "main", protein: "chicken", ingredients: ["whole chicken thigh", "apple", "onion", "chinese cabbage"] },
  { id: "m7", name: "Chicken curry with onion, bell pepper, potato and carrot", category: "main", protein: "chicken", ingredients: ["chicken thigh", "curry powder", "onion", "bell pepper", "potato", "carrot", "coconut cream"], onePerson: true },
  { id: "m8", name: "Roasted whole pork ribs", category: "main", protein: "pork", ingredients: ["whole pork ribs", "tomato sauce", "black pepper sauce"] },
  { id: "m9", name: "Stir fry chicken thigh with Chinese mushroom, cashew and ginger", category: "main", protein: "chicken", ingredients: ["chicken thigh", "chinese mushroom", "cashew", "ginger"] },
  { id: "m10", name: "Stir fry pork slice with mushroom", category: "main", protein: "pork", ingredients: ["pork slice", "mushroom"] },
  { id: "m11", name: "Stir fry chicken thigh with celery and cashew", category: "main", protein: "chicken", ingredients: ["chicken thigh", "celery", "cashew"] },
  { id: "m12", name: "Stir fry chicken thigh with king mushroom", category: "main", protein: "chicken", ingredients: ["chicken thigh", "king mushroom"] },
  { id: "m13", name: "Pork chop curry with onion, potato and carrot", category: "main", protein: "pork", ingredients: ["pork chop", "curry powder", "onion", "potato", "carrot", "coconut cream"], onePerson: true },
  { id: "m14", name: "Roasted chicken wings", category: "main", protein: "chicken", ingredients: ["chicken wings"] },
  { id: "m15", name: "Chicken wing and potato stew", category: "main", protein: "chicken", ingredients: ["chicken wings", "potato"] },
  { id: "m16", name: "Pork ribs and potato stew", category: "main", protein: "pork", ingredients: ["pork ribs", "potato"] },
  { id: "m17", name: "Salmon steak", category: "main", protein: "seafood", ingredients: ["salmon steak"] },
  { id: "m18", name: "Salmon with tofu, onion, Chinese cabbage, leak and Shimeji miso soymilk stew", category: "main", protein: "seafood", ingredients: ["salmon", "tofu", "onion", "chinese cabbage", "leek", "shimeji mushroom", "miso", "soy milk"] },
  { id: "m19", name: "Salmon steak with sweet and sour sauce", category: "main", protein: "seafood", ingredients: ["salmon steak", "bell pepper", "onion", "tomato sauce"] },
  { id: "m20", name: "Steam egg with minced beef", category: "main", protein: "beef", ingredients: ["egg", "minced beef"] },
  { id: "m21", name: "Tomato and minced beef", category: "main", protein: "beef", ingredients: ["tomato", "minced beef", "onion"], onePerson: true },
  { id: "m22", name: "Braised beef ribs with potato and carrot in tomato sauce", category: "main", protein: "beef", ingredients: ["beef ribs", "potato", "carrot", "tomato sauce"] },
  { id: "m23", name: "Braised beef ribs with raddish", category: "main", protein: "beef", ingredients: ["beef ribs", "radish"] },
  { id: "m24", name: "Japanese style pork slice with onion and egg", category: "main", protein: "pork", ingredients: ["pork slice", "onion", "egg"], onePerson: true },
  { id: "m25", name: "Japanese style beef slice with onion and egg", category: "main", protein: "beef", ingredients: ["beef slice", "onion", "egg"], onePerson: true },
  { id: "m26", name: "Steak", category: "main", protein: "beef", ingredients: ["steak"] },
  { id: "m27", name: "Pan fried pork chop with white curry sauce", category: "main", protein: "pork", ingredients: ["pork chop", "white curry sauce", "lemongrass", "thai ginger", "lemon leaf", "onion", "coconut cream"] },
  { id: "m28", name: "Beef and Enoki mushroom rolls", category: "main", protein: "beef", ingredients: ["beef slice", "enoki mushroom"], remarks: "Cookbook p.92" },
  { id: "m29", name: "Pork and asparagus rolls", category: "main", protein: "pork", ingredients: ["pork slice", "asparagus"] },
  { id: "m30", name: "Pan fried chicken thigh", category: "main", protein: "chicken", ingredients: ["chicken thigh"] },
  { id: "m31", name: "Pan fried pork chop with tomato sauce", category: "main", protein: "pork", ingredients: ["pork chop", "tomato sauce", "tomato", "onion"] },
  { id: "m32", name: "Pan fried pork chop with sweet and sour sauce", category: "main", protein: "pork", ingredients: ["pork chop", "tomato sauce", "onion", "bell pepper"] },
  { id: "m33", name: "Pan fried pork chop with corn sauce", category: "main", protein: "pork", ingredients: ["pork chop", "creamed corn"] },
  { id: "m34", name: "Pan fried fish fillet with corn sauce", category: "main", protein: "seafood", ingredients: ["fish fillet", "creamed corn"] },
  { id: "m35", name: "Roasted yellowtail fish collar", category: "main", protein: "seafood", ingredients: ["yellowtail fish collar"] },
  { id: "m36", name: "Stuffed tofu puff with fish paste", category: "main", protein: "seafood", ingredients: ["tofu puff", "fish paste"] },
  { id: "m37", name: "Stuffed tofu puff with minced pork and mushroom", category: "main", protein: "pork", ingredients: ["tofu puff", "minced pork", "mushroom", "coriander"] },
  { id: "m38", name: "Stuffed bell pepper with fish paste", category: "main", protein: "seafood", ingredients: ["bell pepper", "fish paste"] },
  { id: "m39", name: "Stuffed eggplant with fish paste", category: "main", protein: "seafood", ingredients: ["eggplant", "fish paste"] },
  { id: "m40", name: "Eggplant and minced pork", category: "main", protein: "pork", ingredients: ["eggplant", "minced pork", "coriander"] },
  { id: "m41", name: "Stir fry asparagus with pork slice", category: "main", protein: "pork", ingredients: ["asparagus", "pork slice"] },
  { id: "m42", name: "Pork ribs and pumpkin stew", category: "main", protein: "pork", ingredients: ["pork ribs", "pumpkin"] },
  { id: "m43", name: "Ginger pork slice with fried rice", category: "main", protein: "pork", ingredients: ["pork slice", "ginger"], remarks: "Cookbook p.42", onePerson: true },
  { id: "m44", name: "Nannban chicken", category: "main", protein: "chicken", ingredients: ["chicken thigh", "egg", "mayo"], remarks: "Cookbook p.98", onePerson: true },
  { id: "m45", name: "Diced steak with cheese", category: "main", protein: "beef", ingredients: ["beef ribs", "cheese"], remarks: "Cookbook p.102" },
  { id: "m46", name: "Tomato and chicken with Balsamic sauce", category: "main", protein: "chicken", ingredients: ["chicken thigh", "cherry tomatoes", "garlic", "balsamic vinegar"], remarks: "Cookbook p.115" },
  { id: "m47", name: "Garlic butter squid", category: "main", protein: "seafood", ingredients: ["squid", "garlic", "butter"], remarks: "Cookbook p.26" },
  { id: "m48", name: "Lemon garlic butter shrimp", category: "main", protein: "seafood", ingredients: ["fresh shrimp", "garlic", "butter", "lemon"] },
  { id: "m49", name: "Beef slice and raddish soup", category: "main", protein: "beef", ingredients: ["beef slice", "radish", "spring onion"] },
  { id: "m50", name: "Beef and potato pancakes", category: "main", protein: "beef", ingredients: ["minced beef", "potato"] },
  
  { id: "s1", name: "Yam with osmanthus syrup", category: "side", protein: "none", ingredients: ["yam", "osmanthus"] },
  { id: "s2", name: "Steam clam with garlic and vermicelli", category: "side", protein: "seafood", ingredients: ["clam", "garlic", "vermicelli"] },
  { id: "s3", name: "Steam egg with tofu", category: "side", protein: "none", ingredients: ["egg", "tofu"] },
  { id: "s4", name: "Fry egg with shrimp", category: "side", protein: "seafood", ingredients: ["egg", "shrimp"] },
  { id: "s5", name: "Steam egg with dried scallop", category: "side", protein: "seafood", ingredients: ["egg", "dried scallop"] },
  { id: "s6", name: "Steam pomfret", category: "side", protein: "seafood", ingredients: ["pomfret", "ginger", "spring onion"] },
  { id: "s7", name: "Pan fried halibut", category: "side", protein: "seafood", ingredients: ["halibut"] },
  { id: "s8", name: "Tomato and potato fish soup", category: "side", protein: "seafood", ingredients: ["tomato", "potato", "red fish"] },
  { id: "s9", name: "Steam fish", category: "side", protein: "seafood", ingredients: ["fish", "ginger", "spring onion"] },
  { id: "s10", name: "Okura and tofu in sesame sauce", category: "side", protein: "none", ingredients: ["okra", "tofu", "sesame sauce"] },
  { id: "s11", name: "Stir fry egg with shrimps", category: "side", protein: "seafood", ingredients: ["egg", "shrimp"] },
  { id: "s12", name: "Stir fry egg with tomato", category: "side", protein: "none", ingredients: ["egg", "tomato"] },
  { id: "s13", name: "Stir fry egg with Cha Siu", category: "side", protein: "pork", ingredients: ["egg", "cha siu"], onePerson: true },
  { id: "s14", name: "Pan fried tofu", category: "side", protein: "none", ingredients: ["tofu"] },
  { id: "s15", name: "Mixed vegetables and tofu in soup", category: "side", protein: "none", ingredients: ["mixed vegetables", "tofu"] },
  { id: "s16", name: "Oxtail soup in tomato with celery, carrot, onion, cabbage and potato", category: "side", protein: "beef", ingredients: ["oxtail", "tomato", "celery", "carrot", "onion", "cabbage", "potato"] },
  { id: "s17", name: "Stir fry scallop, celery, carrots and ginger", category: "side", protein: "seafood", ingredients: ["scallop", "celery", "carrot", "ginger"] },
  { id: "s18", name: "Cold spinach and Shimeji salad", category: "side", protein: "none", ingredients: ["spinach", "shimeji mushroom"], remarks: "Cookbook p.124" },
  { id: "s19", name: "Cold pumpkin with egg salad", category: "side", protein: "none", ingredients: ["pumpkin", "egg", "mayonnaise"] },
  { id: "s20", name: "Cold tofu with cherry tomatoes in sesame sauce", category: "side", protein: "none", ingredients: ["tofu", "cherry tomatoes", "sesame sauce"] },
  { id: "s21", name: "Stir fry scallop, yam and celery", category: "side", protein: "seafood", ingredients: ["scallop", "yam", "celery"] },
  { id: "s22", name: "Muddy red and green carrots, corn and pork shank soup", category: "side", protein: "none", ingredients: ["muddy carrot", "green carrot", "corn", "pork shank"] },
  { id: "s23", name: "Lotus, dried octopus, muddy carrot, peanuts and chicken feet soup", category: "side", protein: "chicken", ingredients: ["lotus root", "dried octopus", "peanuts", "chicken feet", "muddy carrot"] },
  { id: "s24", name: "Edamame sticks wrapped in rice paper", category: "side", protein: "none", ingredients: ["edamame", "rice paper"] },
  { id: "s25", name: "Stir fry egg with noodlefish", category: "side", protein: "seafood", ingredients: ["egg", "noodlefish"] },
  { id: "s26", name: "Warm whole edamame with salt", category: "side", protein: "none", ingredients: ["whole edamame", "salt"] },
  { id: "s27", name: "Grilled yam with mayo miso", category: "side", protein: "none", ingredients: ["yam", "mayo", "miso", "spring onion"], remarks: "Cookbook p.86" },
  
  { id: "v1", name: "Stir fry Pak Choi", category: "veg", protein: "none", ingredients: ["pak choi"] },
  { id: "v2", name: "Stir fry green sprouts with garlic", category: "veg", protein: "none", ingredients: ["green sprouts", "garlic"] },
  { id: "v3", name: "Stir fry spinach", category: "veg", protein: "none", ingredients: ["spinach", "garlic"] },
  { id: "v4", name: "Stir fry beef slices and Choi Sum", category: "veg", protein: "beef", ingredients: ["beef slice", "choi sum"] },
  { id: "v5", name: "Stir fry cauliflower", category: "veg", protein: "none", ingredients: ["cauliflower", "garlic"] },
  { id: "v6", name: "Stir fry broccoli and scallop", category: "veg", protein: "seafood", ingredients: ["broccoli", "scallop"] },
  { id: "v7", name: "Stir fry broccoli", category: "veg", protein: "none", ingredients: ["broccoli"] },
  { id: "v8", name: "Stir fry Chinese Lettuce", category: "veg", protein: "none", ingredients: ["chinese lettuce"] },
  { id: "v9", name: "Chinese cabbage in ginger soymilk soup", category: "veg", protein: "none", ingredients: ["chinese cabbage", "soy milk", "ginger"] },
  { id: "v10", name: "Mixed vegetables in soup", category: "veg", protein: "none", ingredients: ["mixed vegetables"] },
  { id: "v11", name: "Stir fry king mushroom with chayote", category: "veg", protein: "none", ingredients: ["king mushroom", "chayote"] },
  { id: "v12", name: "Stir fry king mushroom with chayote and celery", category: "veg", protein: "none", ingredients: ["king mushroom", "chayote", "celery"] },
  { id: "v13", name: "Stir fry Shanghai Pak Choy", category: "veg", protein: "none", ingredients: ["shanghai pak choy"] },
  { id: "v14", name: "Green beans with salted egg yolk, butter and garlic", category: "veg", protein: "none", ingredients: ["green beans", "salted egg yolk", "butter", "garlic"] },
  { id: "v15", name: "Butter baked corn with seasoning", category: "veg", protein: "none", ingredients: ["corn", "butter"] },
  { id: "v16", name: "Stir fry Choi Sum", category: "veg", protein: "none", ingredients: ["choi sum"] }
];

// --- 2. HELPER FUNCTIONS ---
const getRandomDish = (dishes) => dishes[Math.floor(Math.random() * dishes.length)];

const formatNameUI = (name) => name.replace(/\s*\(.*?\)/g, '');

const getMasterIngredientList = (allDishes) => {
  const allIngredients = allDishes.flatMap((dish) => dish.ingredients);
  return [...new Set(allIngredients)].sort();
};

const getIngredientCategory = (item) => {
  const lower = item.toLowerCase();
  
  const hasWord = (words) => new RegExp(`\\b(${words.join('|')})(s|es)?\\b`, 'i').test(lower);

  if (hasWord(["spring onion"])) return "Condiments";

  if (hasWord(["pork", "cha siu"])) return "Pork";
  if (hasWord(["beef", "steak", "oxtail"])) return "Beef";
  if (hasWord(["chicken"])) return "Chicken";
  if (hasWord(["fish", "clam", "shrimp", "scallop", "pomfret", "halibut", "squid", "octopus", "salmon", "noodlefish"])) return "Seafood";
  if (hasWord(["tofu", "soy"])) return "Soy";

  if (hasWord(["mushroom", "fungus"])) return "Mushrooms";
  if (hasWord(["cabbage", "pak choi", "choi sum", "spinach", "lettuce", "sprout"])) return "Leafy Greens";
  if (hasWord(["potato", "carrot", "radish", "melon", "chayote", "pumpkin", "yam", "chestnut", "lotus", "corn", "onion", "eggplant"])) return "Root Veggies & Gourds";

  if (hasWord(["rice paper", "dumpling skin", "peanut", "scallion", "curry", "coconut", "garlic", "ginger", "lemon", "osmanthus", "vermicelli", "cashew", "egg", "sauce", "butter", "salt", "mayo", "mayonnaise", "miso", "cheese", "vinegar", "coriander"])) return "Condiments";

  return "Other Veggies"; 
};

export default function DinnerApp() {
  // --- 3. STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("planner"); 
  const [diningSize, setDiningSize] = useState("medium"); 
  const [shoppingMode, setShoppingMode] = useState("any"); 
  
  const [customDishes, setCustomDishes] = useState([]);
  const [newDish, setNewDish] = useState({ name: "", category: "main", protein: "", ingredients: [], remarks: "", onePerson: false });
  const [ingredientInput, setIngredientInput] = useState("");
  
  const [inventory, setInventory] = useState({});
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryLoading, setInventoryLoading] = useState(true);
  
  const allDishes = useMemo(() => [...DEFAULT_DISHES, ...customDishes], [customDishes]);
  const masterIngredients = useMemo(() => getMasterIngredientList(allDishes), [allDishes]);

  const menuRef = useRef(null);

  // CLOUD LOAD
  useEffect(() => {
    const savedDishes = localStorage.getItem("customDishes");
    if (savedDishes) setCustomDishes(JSON.parse(savedDishes));

    const loadCloudInventory = async () => {
      try {
        const response = await fetch(SCRIPT_URL);
        const cloudData = await response.json();
        
        let merged = { ...cloudData };
        let changed = false;
        
        masterIngredients.forEach(item => {
          if (merged[item] === undefined) {
            merged[item] = true; 
            changed = true;
          }
        });

        for(let key in merged) {
            if(merged[key] === "FALSE" || merged[key] === "false" || merged[key] === false) merged[key] = false;
            else merged[key] = true;
        }

        setInventory(merged);
        setInventoryLoading(false);

        if (changed) {
          fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(merged)
          }).catch(err => console.error("Sync back failed", err));
        }
      } catch (error) {
        console.error("Cloud load failed. Falling back to local storage.", error);
        const local = localStorage.getItem("dinnerInventory");
        if (local) {
          setInventory(JSON.parse(local));
        } else {
          const initial = {};
          masterIngredients.forEach((item) => (initial[item] = true));
          setInventory(initial);
        }
        setInventoryLoading(false);
      }
    };
    
    loadCloudInventory();
  }, [masterIngredients]);

  const toggleIngredient = (item) => {
    const updated = { ...inventory, [item]: !inventory[item] };
    setInventory(updated); 
    localStorage.setItem("dinnerInventory", JSON.stringify(updated)); 
    
    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(updated)
    }).catch(err => console.error("Cloud save failed", err));
  };

  const handleAddDish = () => {
    if (!newDish.name || newDish.ingredients.length === 0) return alert("Please fill in name and at least one ingredient!");
    
    const dishToSave = {
      id: "c_" + Date.now(),
      name: newDish.name,
      category: newDish.category,
      protein: newDish.protein || "none", 
      ingredients: newDish.ingredients,
      remarks: newDish.remarks.trim(),
      onePerson: newDish.onePerson
    };
    
    const updatedDishes = [...customDishes, dishToSave];
    setCustomDishes(updatedDishes);
    localStorage.setItem("customDishes", JSON.stringify(updatedDishes));
    
    alert("Dish added successfully!");
    setNewDish({ name: "", category: "main", protein: "", ingredients: [], remarks: "", onePerson: false });
  };

  const [mode, setMode] = useState("auto");
  const [generatedMenu, setGeneratedMenu] = useState(null);
  const [manualMenu, setManualMenu] = useState({ mains: [], sides: [], veg: null });

  // --- 4. LOGIC ---
  const availableIngredientsList = Object.keys(inventory).filter((i) => inventory[i]);

  const getMissingIngredients = (menu) => {
    let required = [];
    if (menu.mains) menu.mains.forEach(m => { if(m) required.push(...m.ingredients); });
    if (menu.sides) menu.sides.forEach(s => { if(s) required.push(...s.ingredients); });
    if (menu.veg) required.push(...menu.veg.ingredients);
    
    const uniqueRequired = [...new Set(required)];
    return uniqueRequired.filter(ing => !availableIngredientsList.includes(ing));
  };

  const handleAutoGenerate = () => {
    let bestMenu = null;
    let bestMissingCount = 999;
    
    for(let attempts = 0; attempts < 100; attempts++) {
        let usedProteins = [];
        let tempMenu = { mains: [], sides: [], veg: null };
        let isValid = true;

        if (diningSize === "one") {
            const onePersonOptions = allDishes.filter(d => d.onePerson && (d.category === "main" || d.category === "side"));
            if (onePersonOptions.length > 0) {
              tempMenu.mains.push(getRandomDish(onePersonOptions));
            } else isValid = false;
        } else {
            const mains = allDishes.filter((d) => d.category === "main");
            const sides = allDishes.filter((d) => d.category === "side");
            const vegs = allDishes.filter((d) => d.category === "veg");

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

            const availableVegs = vegs.filter((v) => !usedProteins.includes(v.protein));
            if (availableVegs.length > 0) {
              tempMenu.veg = getRandomDish(availableVegs);
            } else isValid = false;
        }

        if (!isValid) continue;

        const missingCount = getMissingIngredients(tempMenu).length;
        
        if (missingCount < bestMissingCount) {
            bestMissingCount = missingCount;
            bestMenu = tempMenu;
        }
        
        if (shoppingMode === "any" || (shoppingMode === "minimal" && missingCount <= 3) || (shoppingMode === "none" && missingCount === 0)) {
            break; 
        }
    }

    if (bestMenu) {
      if (shoppingMode !== "any" && bestMissingCount > (shoppingMode === "none" ? 0 : 3)) {
          alert(`We couldn't find a combo with your exact shopping preference. Here is the closest match! (Missing ${bestMissingCount} items)`);
      }
      setGeneratedMenu(bestMenu);
    } else {
      alert("We couldn't generate a valid menu. Try changing your dining size or adding more dishes!");
    }
  };

  const getManualOptions = (type) => {
    let usedOther = [];
    let usedSelf = [];

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

    let pool = allDishes.filter(d => d.category === type);
    if (diningSize === "one") pool = allDishes.filter(d => d.onePerson && (d.category === "main" || d.category === "side"));

    return pool.filter(d => {
       if (usedOther.includes(d.protein)) return false;
       
       const isSelectedSelf = (type === 'main' && manualMenu.mains.find(m => m.id === d.id)) ||
                              (type === 'side' && manualMenu.sides.find(s => s.id === d.id)) ||
                              (type === 'veg' && manualMenu.veg?.id === d.id);
                              
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
    if (type === 'veg') {
      setManualMenu({...manualMenu, veg: manualMenu.veg?.id === dish.id ? null : dish});
      return;
    }

    let current = [...manualMenu[type]];
    const index = current.findIndex(item => item && item.id === dish.id);
    
    if (index >= 0) {
      current.splice(index, 1); 
    } else {
      if (current.length >= maxLimit) current.shift(); 
      current.push(dish); 
    }
    setManualMenu({...manualMenu, [type]: current});
  };

  const handleShare = (menuToShare) => {
    const shoppingList = getMissingIngredients(menuToShare);

    let text = `*Tonight's Dinner*\n`;
    if (menuToShare.mains) menuToShare.mains.forEach((m) => (text += `• ${m.name}${m.remarks ? ` (${m.remarks})` : ""}\n`));
    if (menuToShare.sides) menuToShare.sides.forEach((s) => (text += `• ${s.name}${s.remarks ? ` (${s.remarks})` : ""}\n`));
    if (menuToShare.veg) text += `• ${menuToShare.veg.name}${menuToShare.veg.remarks ? ` (${menuToShare.veg.remarks})` : ""}\n`;

    if (shoppingList.length > 0) {
      text += `\n*Shopping List*\n`;
      shoppingList.forEach((item) => (text += `☐ ${item}\n`));
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // --- 5. UI COMPONENTS & STYLES ---
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
    input: { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", marginBottom: "15px", boxSizing: "border-box", fontSize: "16px" },
    loader: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, borderRadius: "16px", fontWeight: "bold", color: "#FF8CA1" }
  };

  const DishIcon = ({ type }) => {
    let emoji = "🍲"; let bgColor = "#FFF0C2"; 
    if (type === "side") { emoji = "🍤"; bgColor = "#D0E8FF"; } 
    if (type === "veg") { emoji = "🥦"; bgColor = "#D4F0D0"; } 

    return (
      <div style={{ 
        width: "64px", height: "64px", borderRadius: "16px", backgroundColor: bgColor, 
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", flexShrink: 0 
      }}>
        {emoji}
      </div>
    );
  };

  const renderGroupedDishesMulti = (dishes, selectedItemsArray, isSide = false, onSelect) => {
    const defaultGroups = [
      { id: "pork", label: "Pork" }, { id: "beef", label: "Beef" }, 
      { id: "chicken", label: "Chicken" }, { id: "seafood", label: "Seafood" }, 
      { id: "soy", label: "Soy" }, { id: "none", label: "Veg/Other" }
    ];
    
    const sideGroups = [
      { id: "cold", label: "Cold Dish" }, { id: "egg", label: "Egg" }, ...defaultGroups
    ];

    const groupsToUse = isSide ? sideGroups : defaultGroups;

    return groupsToUse.map(group => {
      const filtered = dishes.filter(d => {
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
              return (
                <button key={d.id} style={styles.tag(isSelected)} onClick={() => onSelect(d)}>
                  {formatNameUI(d.name)}
                </button>
              );
            })}
          </div>
        </div>
      );
    });
  };

  const inventoryCategories = ["Pork", "Beef", "Chicken", "Seafood", "Soy", "Leafy Greens", "Mushrooms", "Root Veggies & Gourds", "Other Veggies", "Condiments"];
  
  const numMains = diningSize === "xlarge" ? 2 : 1;
  const numSides = diningSize === "one" ? 0 : diningSize === "small" ? 0 : diningSize === "large" ? 2 : 1;

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
          <h3 style={{ marginTop: 0 }}>Add a New Dish</h3>
          
          <label style={{fontWeight: "bold", fontSize: "14px"}}>Dish Name</label>
          <input style={styles.input} placeholder="e.g. Tomato Egg Stir Fry" value={newDish.name} onChange={e => setNewDish({...newDish, name: e.target.value})} />

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
                {ing} 
                <button style={{ border: "none", background: "none", cursor: "pointer", color: "white", padding: 0, fontWeight: "bold", fontSize: "16px" }} onClick={() => setNewDish({...newDish, ingredients: newDish.ingredients.filter(i => i !== ing)})}>×</button>
              </span>
            ))}
          </div>

          <input 
            style={{...styles.input, marginBottom: "0"}} 
            placeholder="Type an ingredient & press enter..." 
            value={ingredientInput} 
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
            <div style={{ border: "1px solid #ddd", borderTop: "none", borderRadius: "0 0 10px 10px", maxHeight: "150px", overflowY: "auto", background: "#fff", padding: "5px", marginBottom: "15px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
              {masterIngredients.filter(i => i.includes(ingredientInput.toLowerCase())).slice(0, 5).map(sug => (
                <div key={sug} style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee" }} onClick={() => {
                  if(!newDish.ingredients.includes(sug)) setNewDish({...newDish, ingredients: [...newDish.ingredients, sug]});
                  setIngredientInput("");
                }}>
                  {sug}
                </div>
              ))}
              {!masterIngredients.includes(ingredientInput.trim().toLowerCase()) && (
                <div style={{ padding: "10px", cursor: "pointer", color: "#FF8CA1", fontWeight: "bold" }} onClick={() => {
                  setNewDish({...newDish, ingredients: [...newDish.ingredients, ingredientInput.trim().toLowerCase()]});
                  setIngredientInput("");
                }}>
                  + Add new: "{ingredientInput}"
                </div>
              )}
            </div>
          )}

          <div style={{marginTop: "15px"}}>
            <label style={{fontWeight: "bold", fontSize: "14px"}}>Remarks (Optional)</label>
            <input style={styles.input} placeholder="e.g. Cookbook p.92" value={newDish.remarks} onChange={e => setNewDish({...newDish, remarks: e.target.value})} />
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
          {inventoryLoading && <div style={{...styles.loader, background: "transparent", position: "relative", padding: "20px"}}>Loading pantry from cloud... ☁️</div>}
          
          {!inventoryLoading && (
            <>
              <input 
                style={{...styles.input, marginBottom: '20px', borderRadius: '20px', padding: '14px 20px'}} 
                placeholder="🔍 Search ingredients..." 
                value={inventorySearch}
                onChange={e => setInventorySearch(e.target.value)}
              />

              {inventoryCategories.map(category => {
                const itemsInCategory = masterIngredients.filter(item => getIngredientCategory(item) === category);
                const searchedItems = itemsInCategory.filter(item => item.toLowerCase().includes(inventorySearch.toLowerCase()));
                
                if (searchedItems.length === 0) return null; 
                
                return (
                  <div key={category} style={styles.block}>
                    <h3 style={{ marginTop: 0, color: "#444" }}>{category}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {searchedItems.map((item) => (
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
            </>
          )}
        </div>
      )}

      {activeTab === "planner" && (
        <div style={{ position: "relative" }}>
          {inventoryLoading && <div style={styles.loader}>Syncing with Cloud... ☁️</div>}
          <div style={styles.block}>
            <label style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px", fontSize: "16px" }}>
              🍴 Dining Size:
            </label>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {[
                { id: "one", label: "Single (1)" },
                { id: "small", label: "Small (2)" },
                { id: "medium", label: "Medium (3)" },
                { id: "large", label: "Large (4)" },
                { id: "xlarge", label: "X-Large (4)" }
              ].map(size => (
                <button 
                  key={size.id} 
                  style={styles.tag(diningSize === size.id)} 
                  onClick={() => {
                    setDiningSize(size.id);
                    setManualMenu({ mains: [], sides: [], veg: null });
                  }}
                >
                  {size.label}
                </button>
              ))}
            </div>
            
            <div style={{ marginTop: "20px" }}>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px", fontSize: "14px" }}>Shopping Preference:</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                
                {/* --- OVERSTUFFED "NORMAL" CART --- */}
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

                {/* --- MINIMAL CART (2 ITEMS UPDATE) --- */}
                <button style={styles.iconBtn(shoppingMode === "minimal")} onClick={() => setShoppingMode("minimal")}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {/* The Cart Frame */}
                    <path d="M3 3h2l2.5 12.5A2 2 0 0 0 9.5 17h8a2 2 0 0 0 1.9-1.5L21 6H6" />
                    <circle cx="10" cy="20.5" r="1.5" />
                    <circle cx="18" cy="20.5" r="1.5" />
                    
                    {/* 2 Items resting at the bottom */}
                    <rect x="8.5" y="11" width="4.5" height="6" rx="1" fill="currentColor" stroke="none" />
                    <circle cx="15.5" cy="14" r="2.5" fill="currentColor" stroke="none" />
                  </svg>
                </button>

                {/* --- NO SHOPPING CART --- */}
                <button style={styles.iconBtn(shoppingMode === "none")} onClick={() => setShoppingMode("none")}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h2l2.5 12.5A2 2 0 0 0 9.5 17h8a2 2 0 0 0 1.9-1.5L21 6H6" />
                    <circle cx="10" cy="20.5" r="1.5" />
                    <circle cx="18" cy="20.5" r="1.5" />
                    <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" />
                    <line x1="20" y1="4" x2="4" y2="20" strokeWidth="2" />
                  </svg>
                </button>

              </div>
            </div>
          </div>

          <div style={{...styles.nav, borderBottom: "2px solid #eee", paddingBottom: "15px"}}>
            <button style={{...styles.tag(mode === "auto"), flex: 1, textAlign: "center"}} onClick={() => setMode("auto")}>Surprise me</button>
            <button style={{...styles.tag(mode === "manual"), flex: 1, textAlign: "center"}} onClick={() => setMode("manual")}>Let me think</button>
          </div>

          {mode === "auto" && (
            <div>
              <button style={styles.btn} onClick={handleAutoGenerate}>☝🏻 What's for dinner tonight?</button>
              
              {generatedMenu && (
                <div ref={menuRef} style={{...styles.block, marginTop: "20px"}}>
                  <h3 style={{ marginTop: 0 }}>Tonight's Menu:</h3>
                  
                  {generatedMenu.mains.map((m, i) => (
                    <div style={styles.menuCard} key={`auto-m-${i}`}>
                      <DishIcon type="main" />
                      <div style={{ fontSize: "18px", fontWeight: "bold" }}>{formatNameUI(m.name)}</div>
                    </div>
                  ))}
                  
                  {generatedMenu.sides.map((s, i) => (
                    <div style={styles.menuCard} key={`auto-s-${i}`}>
                      <DishIcon type="side" />
                      <div style={{ fontSize: "18px", fontWeight: "bold" }}>{formatNameUI(s.name)}</div>
                    </div>
                  ))}

                  {generatedMenu.veg && (
                    <div style={{...styles.menuCard, borderBottom: "none"}}>
                      <DishIcon type="veg" />
                      <div style={{ fontSize: "18px", fontWeight: "bold" }}>{formatNameUI(generatedMenu.veg.name)}</div>
                    </div>
                  )}

                  <button style={{...styles.btn, background: "#34C759", boxShadow: "0 4px 12px rgba(52, 199, 89, 0.3)", marginTop: "20px"}} onClick={() => handleShare(generatedMenu)}>Send to WhatsApp</button>
                </div>
              )}
            </div>
          )}

          {mode === "manual" && (
            <div>
              {diningSize === "one" ? (
                <div style={styles.block}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}><DishIcon type="main" /><h3 style={{ margin: 0, fontSize: "20px" }}>Select Dish</h3></div>
                  {renderGroupedDishesMulti(getManualOptions('any'), manualMenu.mains, false, (d) => toggleManualSelection('mains', d, 1))}
                </div>
              ) : (
                <>
                  <div style={styles.block}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}><DishIcon type="main" /><h3 style={{ margin: 0, fontSize: "20px" }}>Select Main {numMains > 1 ? `(Pick ${numMains})` : ''}</h3></div>
                    {renderGroupedDishesMulti(getManualOptions('main'), manualMenu.mains, false, (d) => toggleManualSelection('mains', d, numMains))}
                  </div>

                  {numSides > 0 && (
                    <div style={styles.block}>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}><DishIcon type="side" /><h3 style={{ margin: 0, fontSize: "20px" }}>Select Side {numSides > 1 ? `(Pick ${numSides})` : ''}</h3></div>
                      {renderGroupedDishesMulti(getManualOptions('side'), manualMenu.sides, true, (d) => toggleManualSelection('sides', d, numSides))}
                    </div>
                  )}

                  <div style={styles.block}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}><DishIcon type="veg" /><h3 style={{ margin: 0, fontSize: "20px" }}>Select Vegetable</h3></div>
                    {renderGroupedDishesMulti(getManualOptions('veg'), [manualMenu.veg], false, (d) => toggleManualSelection('veg', d, 1))}
                  </div>
                </>
              )}

              {((diningSize === "one" && manualMenu.mains.length === 1) || 
                (diningSize !== "one" && manualMenu.mains.length === numMains && manualMenu.sides.length === numSides && manualMenu.veg !== null)) && (
                <button style={{...styles.btn, background: "#34C759", boxShadow: "0 4px 12px rgba(52, 199, 89, 0.3)", marginBottom: "30px"}} onClick={() => handleShare(manualMenu)}>Send to WhatsApp</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
