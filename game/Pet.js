export class Pet {
  constructor(name, species, breed = 'Mixed') {
    this.id = Date.now() + Math.random();
    this.name = name;
    this.species = species;
    this.breed = breed;
    this.level = 1;
    this.experience = 0;
    this.happiness = 50;
    this.hunger = 50;
    this.energy = 50;
    this.cleanliness = 50;
    this.health = 100;
    this.age = 0;
    this.purchasePrice = Pet.getBasePrice(species);
    this.traits = [];
    this.createdAt = new Date().toISOString();
    this.lastCaredFor = new Date().toISOString();
  }

  static getSpecies() {
    return [
      { name: 'Dog', basePrice: 100, traits: ['loyal', 'energetic'] },
      { name: 'Cat', basePrice: 80, traits: ['independent', 'curious'] },
      { name: 'Bird', basePrice: 60, traits: ['musical', 'social'] },
      { name: 'Fish', basePrice: 30, traits: ['peaceful', 'colorful'] },
      { name: 'Hamster', basePrice: 40, traits: ['small', 'playful'] },
      { name: 'Rabbit', basePrice: 70, traits: ['gentle', 'active'] }
    ];
  }

  static getBasePrice(species) {
    const speciesData = Pet.getSpecies().find(s => s.name === species);
    return speciesData ? speciesData.basePrice : 50;
  }

  feed() {
    this.hunger = Math.max(0, this.hunger - 30);
    this.happiness = Math.min(100, this.happiness + 10);
    this.health = Math.min(100, this.health + 5);
    this.experience += 5;
    this.lastCaredFor = new Date().toISOString();
    const levelUp = this.checkLevelUp();
    return levelUp || `${this.name} enjoyed the meal! Hunger decreased, happiness increased.`;
  }

  play() {
    this.happiness = Math.min(100, this.happiness + 20);
    this.energy = Math.max(0, this.energy - 15);
    this.hunger = Math.min(100, this.hunger + 10);
    this.experience += 10;
    this.lastCaredFor = new Date().toISOString();
    const levelUp = this.checkLevelUp();
    return levelUp || `${this.name} had a great time playing! Happiness increased significantly.`;
  }

  clean() {
    this.cleanliness = 100;
    this.happiness = Math.min(100, this.happiness + 5);
    this.health = Math.min(100, this.health + 10);
    this.experience += 3;
    this.lastCaredFor = new Date().toISOString();
    const levelUp = this.checkLevelUp();
    return levelUp || `${this.name} is now sparkling clean and feels great!`;
  }

  rest() {
    this.energy = Math.min(100, this.energy + 40);
    this.happiness = Math.min(100, this.happiness + 5);
    this.experience += 2;
    this.lastCaredFor = new Date().toISOString();
    const levelUp = this.checkLevelUp();
    return levelUp || `${this.name} had a good rest and feels refreshed!`;
  }

  checkLevelUp() {
    const xpNeeded = this.level * 100;
    if (this.experience >= xpNeeded) {
      this.level++;
      this.experience -= xpNeeded;
      return `🎉 ${this.name} leveled up to level ${this.level}!`;
    }
    return null;
  }

  getStatus() {
    return {
      name: this.name,
      species: this.species,
      breed: this.breed,
      level: this.level,
      experience: this.experience,
      happiness: this.happiness,
      hunger: this.hunger,
      energy: this.energy,
      cleanliness: this.cleanliness,
      health: this.health,
      age: this.age,
      needsAttention: this.needsAttention()
    };
  }

  needsAttention() {
    const needs = [];
    if (this.hunger > 70) needs.push('hungry');
    if (this.energy < 20) needs.push('tired');
    if (this.cleanliness < 30) needs.push('dirty');
    if (this.happiness < 30) needs.push('sad');
    return needs;
  }

  // AI behavior - pets change over time
  passTime() {
    this.hunger = Math.min(100, this.hunger + Math.random() * 5);
    this.energy = Math.max(0, this.energy - Math.random() * 3);
    this.cleanliness = Math.max(0, this.cleanliness - Math.random() * 2);
    
    if (this.needsAttention().length > 2) {
      this.happiness = Math.max(0, this.happiness - 5);
    }
    
    this.age += 0.1;
  }

  // AI interaction response
  getRandomInteraction() {
    const interactions = [
      `${this.name} wags tail happily!`,
      `${this.name} makes a cute sound!`,
      `${this.name} looks at you with loving eyes.`,
      `${this.name} does a little trick!`,
      `${this.name} nuzzles against you.`
    ];
    return interactions[Math.floor(Math.random() * interactions.length)];
  }
}