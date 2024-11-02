import { useState, useEffect } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import type { Attributes } from './types';

// hardcoded my username
const GITHUB_USERNAME = 'fropsyboy';
const API_URL = `https://recruiting.verylongdomaintotestwith.ca/api/${GITHUB_USERNAME}/character`;


function App() {
  const initialAttributes: Attributes = {
    Strength: 10,
    Dexterity: 10,
    Constitution: 10,
    Intelligence: 10,
    Wisdom: 10,
    Charisma: 10,
  };


  const createNewCharacter = (count: number) => ({
    name: `Character ${count + 1}`,
    attributes: { ...initialAttributes },
    skillPoints: Object.fromEntries(SKILL_LIST.map(skill => [skill.name, 0])),
  });

  const [characters, setCharacters] = useState([createNewCharacter(0)]);
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0);


// P.S: there is a CORS issue currently accessing the url
  const saveCharacters = async () => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characters }),
      });
      console.log('Characters saved successfully');
    } catch (error) {
      console.error('Error saving characters:', error);
    }
  };


  const loadCharacters = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.characters) {
        setCharacters(data.characters);
        setActiveCharacterIndex(0);
      }
      console.log('Characters loaded successfully');
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  };


  useEffect(() => {
    loadCharacters();
  }, []);


  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string>(SKILL_LIST[0].name);
  const [dc, setDC] = useState<number>(10);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [skillCheckResult, setSkillCheckResult] = useState<string | null>(null);
  const [partyCheckResult, setPartyCheckResult] = useState<string | null>(null);

  const activeCharacter = characters[activeCharacterIndex];

  const calculateModifier = (value: number): number => Math.floor((value - 10) / 2);

  const totalAttributes: number = (Object.values(activeCharacter.attributes) as number[]).reduce((acc, value) => acc + value, 0);






  const updateAttribute = (key: keyof Attributes, increment: boolean) => {
    setCharacters(prevCharacters => {
      const newAttributes = { ...activeCharacter.attributes };
      const newValue = increment ? newAttributes[key] + 1 : newAttributes[key] - 1;
      
      if (totalAttributes + (increment ? 1 : -1) > 70 || newValue < 0) {
        alert('Total attribute points cannot exceed 70.');
        return prevCharacters;
      }
      
      newAttributes[key] = newValue;
      const updatedCharacters = [...prevCharacters];
      updatedCharacters[activeCharacterIndex] = { ...activeCharacter, attributes: newAttributes };
      return updatedCharacters;
    });
  };

  const qualifiesForClass = (className: string): boolean => {
    const requirements = CLASS_LIST[className];
    return ATTRIBUTE_LIST.every(
      attribute => activeCharacter.attributes[attribute as keyof Attributes] >= requirements[attribute as keyof Attributes]
    );
  };

  const handleClassSelection = (className: string) => setSelectedClass(className);

  const intelligenceModifier = calculateModifier(activeCharacter.attributes.Intelligence);
  const maxSkillPoints = 10 + (4 * intelligenceModifier);
  const totalSkillPointsUsed: number = (Object.values(activeCharacter.skillPoints) as number[]).reduce((acc, value) => acc + value, 0);




  const updateSkillPoints = (skillName: string, increment: boolean) => {
    setCharacters(prevCharacters => {
      const newSkillPoints = { ...activeCharacter.skillPoints };
      const currentPoints = newSkillPoints[skillName];
      const newPoints = increment ? currentPoints + 1 : currentPoints - 1;

      if (newPoints < 0) {
        return prevCharacters;
      }
      if (totalSkillPointsUsed + (increment ? 1 : -1) > maxSkillPoints) {
        alert('Maximum skill points allocated!');
        return prevCharacters;
      }

      newSkillPoints[skillName] = newPoints;
      const updatedCharacters = [...prevCharacters];
      updatedCharacters[activeCharacterIndex] = { ...activeCharacter, skillPoints: newSkillPoints };
      return updatedCharacters;
    });
  };



  const addNewCharacter = () => {
    setCharacters([...characters, createNewCharacter(characters.length)]);
    setActiveCharacterIndex(characters.length);
  };

  const performSkillCheck = () => {
    const skill = SKILL_LIST.find(skill => skill.name === selectedSkill);
    if (skill) {
      const attributeModifier = calculateModifier(activeCharacter.attributes[skill.attributeModifier as keyof Attributes]);
      const skillTotal = activeCharacter.skillPoints[selectedSkill] + attributeModifier;
      const roll = Math.floor(Math.random() * 20) + 1;
      setRollResult(roll);
      // setSkillCheckResult((roll + skillTotal) >= dc ? 'Success' : 'Failure');

      // Setting the detailed result message
    const resultMessage = `Skill: ${selectedSkill}, You Rolled: ${roll}, DC: ${dc}, Result: ${roll + skillTotal >= dc ? 'Success' : 'Failure'}`;
    setSkillCheckResult(resultMessage);
    }
  };

  const performPartySkillCheck = () => {
    const skill = SKILL_LIST.find(skill => skill.name === selectedSkill);
    if (skill) {
      const attributeModifier = calculateModifier(activeCharacter.attributes[skill.attributeModifier as keyof Attributes]);
      const skillTotal = activeCharacter.skillPoints[selectedSkill] + attributeModifier;
      const roll = Math.floor(Math.random() * 20) + 1;
      setPartyCheckResult((roll + skillTotal) >= dc ? 'Success by highest skill character' : 'Failure by highest skill character');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
        <button onClick={addNewCharacter}>Add New Character</button>
      </header>

      <section className="character-selector">
        {characters.map((character, index) => (
          <button
            key={index}
            onClick={() => setActiveCharacterIndex(index)}
            className={activeCharacterIndex === index ? 'active-character' : ''}
          >
            {character.name}
          </button>
        ))}
      </section>

      <section className="attributes-section">
        {ATTRIBUTE_LIST.map(attribute => (
          <div key={attribute} className="attribute-row">
            <span>{attribute}</span>
            <button onClick={() => updateAttribute(attribute as keyof Attributes, true)}>+</button>
            <span>{activeCharacter.attributes[attribute as keyof Attributes]}</span>
            <button onClick={() => updateAttribute(attribute as keyof Attributes, false)}>-</button>
            <span>Modifier: {calculateModifier(activeCharacter.attributes[attribute as keyof Attributes])}</span>
          </div>
        ))}
        <div>Total Attributes: {totalAttributes} / 70</div>
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
            <h3>Requirements for {selectedClass} <button onClick={() => setSelectedClass(null)} style={{ marginLeft: '10px', padding: '2px 5px' }}>Close</button></h3>
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
        {/* <div>Available Skill Points: {'${maxSkillPoints - totalSkillPointsUsed} / {maxSkillPoints}</div> */}
        <div>Available Skill Points: {`${maxSkillPoints - totalSkillPointsUsed} / ${maxSkillPoints}`}</div>

        {SKILL_LIST.map(skill => {
          const attributeModifier = calculateModifier(activeCharacter.attributes[skill.attributeModifier as keyof Attributes]);
          const totalSkill = activeCharacter.skillPoints[skill.name] + attributeModifier;
          return (
            <div key={skill.name} className="skill-row">
              <span>{skill.name}</span>
              <button onClick={() => updateSkillPoints(skill.name, true)}>+</button>
              <span>Points: {activeCharacter.skillPoints[skill.name]}</span>
              <button onClick={() => updateSkillPoints(skill.name, false)}>-</button>
              <span>Modifier ({skill.attributeModifier}): {attributeModifier}</span>
              <span>Total: {totalSkill}</span>
            </div>
          );
        })}
      </section>

      <section className="skill-check-section">
        <h2>Skill Check</h2>
        <label>
          Skill:
          <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
            {SKILL_LIST.map(skill => (
              <option key={skill.name} value={skill.name}>{skill.name}</option>
            ))}
          </select>
        </label>
        <label>
          DC:
          <input type="number" value={dc} onChange={(e) => setDC(Number(e.target.value))} />
        </label>
        <button onClick={performSkillCheck}>Roll</button>
        {rollResult !== null && (
          <div>
            <p>Roll: {rollResult}</p>
            <p>Result: {skillCheckResult}</p>
          </div>
        )}
      </section>

      <section className="party-skill-check-section">
        <h2>Party Skill Check</h2>
        <button onClick={performPartySkillCheck}>Roll for Party</button>
        {partyCheckResult && (
          <div>
           <p>Party Check Result: {partyCheckResult}</p>
          </div>
        )}
      </section>
      <button onClick={saveCharacters}>Save Characters</button>
    </div>
  );
}

export default App;