import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [utensilios, setUtensilios] = useState([]);
  const [paisCocina, setPaisCocina] = useState("");
  const [ingredientes, setIngredientes] = useState(["tomate", "cebolla", "pollo"]);
  const [modoEstricto, setModoEstricto] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("perfilCocina").then((raw) => {
      if (!raw) return;
      const profile = JSON.parse(raw);
      setUtensilios(profile.utensilios || []);
      setPaisCocina(profile.paisCocina || "");
    });
  }, []);

  const saveProfile = async (nextUtensilios, nextPais) => {
    setUtensilios(nextUtensilios);
    setPaisCocina(nextPais);
    await AsyncStorage.setItem(
      "perfilCocina",
      JSON.stringify({ utensilios: nextUtensilios, paisCocina: nextPais })
    );
  };

  const value = useMemo(
    () => ({
      utensilios,
      paisCocina,
      ingredientes,
      modoEstricto,
      setIngredientes,
      setModoEstricto,
      setPaisCocina,
      saveProfile,
    }),
    [utensilios, paisCocina, ingredientes, modoEstricto]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  return useContext(AppContext);
}
