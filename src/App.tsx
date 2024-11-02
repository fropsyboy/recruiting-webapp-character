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
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [skillPoints, setSkillPoints] = useState<{ [key: string]: number }>(
    Object.fromEntries(SKILL_LIST.map(skill => [skill.name, 0]))
  );
  const [selectedSkill, setSelectedSkill] = useState<string>(SKILL_LIST[0].name);
  const [dc, setDC] = useState<number>(10);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [skillCheckResult, setSkillCheckResult] = useState<string | null>(null);
  const [partyCheckResult, setPartyCheckResult] = useState<string | null>(null);

  const calculateModifier = (value: number): number => Math.floor((value - 10) / 2);
  const totalAttributes = Object.values(attributes).reduce((acc, value) => acc + value, 0);
  
  const updateAttribute = (key: keyof Attributes, increment: boolean) => {
    setAttributes(prevAttributes => {
      const newValue = increment ? prevAttributes[key] + 1 : prevAttributes[key] - 1;
      if (totalAttributes + (increment ? 1 : -1) > maxAttributeTotal || newValue < 0) {
        return prevAttributes;
      }
      return { ...prevAttributes, [key]: newValue };
    });
  };

  const qualifiesForClass = (className: string): boolean => {
    const requirements = CLASS_LIST[className];
    return ATTRIBUTE_LIST.every(attribute => attributes[attribute as keyof Attributes] >= requirements[attribute as keyof Attributes]);
  };

  const handleClassSelection = (className: string) => setSelectedClass(className);

  const intelligenceModifier = calculateModifier(attributes.Intelligence);
  const maxSkillPoints = 10 + (4 * intelligenceModifier);
  const totalSkillPointsUsed = Object.values(skillPoints).reduce((acc, value) => acc + value, 0);

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

  const performSkillCheck = () => {
    const skill = SKILL_LIST.find(skill => skill.name === selectedSkill);
    if (skill) {
      const attributeModifier = calculateModifier(attributes[skill.attributeModifier as keyof Attributes]);
      const skillTotal = skillPoints[selectedSkill] + attributeModifier;
      const roll = Math.floor(Math.random() * 20) + 1;
      setRollResult(roll);
      setSkillCheckResult((roll + skillTotal) >= dc ? 'Success' : 'Failure');
    }
  };

  const performPartySkillCheck = () => {
    const skill = SKILL_LIST.find(skill => skill.name === selectedSkill);
    if (skill) {
      const attributeModifier = calculateModifier(attributes[skill.attributeModifier as keyof Attributes]);
      const skillTotal = skillPoints[selectedSkill] + attributeModifier;
      const roll = Math.floor(Math.random() * 20) + 1;
      setPartyCheckResult((roll + skillTotal) >= dc ? `Success by highest skill character` : `Failure by highest skill character`);
    }
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
    </div>
  );
}

export default App;
