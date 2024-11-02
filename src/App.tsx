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
        alert('Total attribute points cannot exceed 70.');
         return prevAttributes;
       }
 
       return { ...prevAttributes, [key]: newValue };
     });
   };

     // State for selected class
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // State for skill points
  const [skillPoints, setSkillPoints] = useState<{ [key: string]: number }>(
    Object.fromEntries(SKILL_LIST.map(skill => [skill.name, 0]))
  );

  // Check if character meets requirements for a class
  const qualifiesForClass = (className: string): boolean => {
    const requirements = CLASS_LIST[className];
    return ATTRIBUTE_LIST.every(attribute => attributes[attribute as keyof Attributes] >= requirements[attribute as keyof Attributes]);
  };

  // Handle selecting a class
  const handleClassSelection = (className: string) => {
    setSelectedClass(className);
  };

  // Calculate available skill points based on Intelligence modifier
  const intelligenceModifier = calculateModifier(attributes.Intelligence);
  const maxSkillPoints = 10 + (4 * intelligenceModifier);
  const totalSkillPointsUsed = Object.values(skillPoints).reduce((acc, value) => acc + value, 0);

  // Update skill points for a specific skill
  const updateSkillPoints = (skillName: string, increment: boolean) => {
    setSkillPoints(prevSkillPoints => {
      const currentPoints = prevSkillPoints[skillName];
      const newPoints = increment ? currentPoints + 1 : currentPoints - 1;

      if (newPoints < 0 || totalSkillPointsUsed + (increment ? 1 : -1) > maxSkillPoints) {
        return prevSkillPoints;
      }

      return { ...prevSkillPoints, [skillName]: newPoints };
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
      <section className="class-section">
        <h2>Classes</h2>
        {Object.keys(CLASS_LIST).map(className => (
          <div
            key={className}
            className={`class-item ${qualifiesForClass(className) ? 'qualifies' : ''}`}
            onClick={() => handleClassSelection(className)}
          >
            {className}
          </div>
        ))}
        {selectedClass && (
          <div className="class-requirements">
            <h3>Requirements for {selectedClass}</h3>
            <ul>
              {Object.entries(CLASS_LIST[selectedClass]).map(([attribute, value]) => (
                <li key={attribute}><>{attribute}: {value}</></li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section className="skills-section">
        <h2>Skills</h2>
        <div>Available Skill Points: {maxSkillPoints - totalSkillPointsUsed} / {maxSkillPoints}</div>
        {SKILL_LIST.map(skill => {
          const attributeModifier = calculateModifier(attributes[skill.attributeModifier as keyof Attributes]);
          const totalSkill = skillPoints[skill.name] + attributeModifier;
          return (
            <div key={skill.name} className="skill-row">
              <span>{skill.name}</span>
              <button onClick={() => updateSkillPoints(skill.name, true)}>+</button>
              <span>Points: {skillPoints[skill.name]}</span>
              <button onClick={() => updateSkillPoints(skill.name, false)}>-</button>
              <span>Modifier ({skill.attributeModifier}): {attributeModifier}</span>
              <span>Total: {totalSkill}</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default App;
