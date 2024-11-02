import { useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import type { Attributes } from './types';



function App() {
  const initialAttributes: Attributes = {
    Strength: 10,
    Dexterity: 10,
    Constitution: 10,
    Intelligence: 10,
    Wisdom: 10,
    Charisma: 10,
  };

  const [attributes, setAttributes] = useState<Attributes>(initialAttributes);
  const maxAttributeTotal = 70;

   // Calculate attribute modifier
   const calculateModifier = (value: number): number => Math.floor((value - 10) / 2);

   // Calculate total of all attributes
   const totalAttributes = Object.values(attributes).reduce((acc, value) => acc + value, 0);
 
   // Handle increment and decrement of attributes
   const updateAttribute = (key: keyof Attributes, increment: boolean) => {
     setAttributes(prevAttributes => {
       const newValue = increment ? prevAttributes[key] + 1 : prevAttributes[key] - 1;
 
       // Ensure the new total does not exceed the maximum allowed
       if (totalAttributes + (increment ? 1 : -1) > maxAttributeTotal || newValue < 0) {
         return prevAttributes;
       }
 
       return { ...prevAttributes, [key]: newValue };
     });
   };


  const [num, setNum] = useState<number>(0);
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        <div>
           {ATTRIBUTE_LIST.map(attribute => (
          <div key={attribute} className="attribute-row">
            <span>{attribute}</span>
            <button onClick={() => updateAttribute(attribute as keyof Attributes, true)}>+</button>
            <span>{attributes[attribute as keyof Attributes]}</span>
            <button onClick={() => updateAttribute(attribute as keyof Attributes, false)}>-</button>
            <span>Modifier: {calculateModifier(attributes[attribute as keyof Attributes])}</span>
          </div>
        ))}
        <div>Total Attributes: {totalAttributes} / {maxAttributeTotal}</div>
        </div>
      </section>
    </div>
  );
}

export default App;
