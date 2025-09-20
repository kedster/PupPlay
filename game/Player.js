import fs from 'fs';
import path from 'path';
import { Pet } from './Pet.js';

export class Player {
  constructor(name) {
    this.name = name;
    this.money = 500; // Starting money
    this.level = 1;
    this.experience = 0;
    this.pets = [];
    this.house = {
      level: 1,
      rooms: ['Living Room'],
      capacity: 3,
      decorations: [],
      cleanliness: 100
    };
    this.inventory = {
      food: 10,
      toys: 2,
      cleaningSupplies: 5
    };
    this.achievements = [];
    this.storyProgress = {
      currentChapter: 1,
      completedQuests: [],
      unlockedContent: ['basic_pets']
    };
    this.createdAt = new Date().toISOString();
    this.lastPlayed = new Date().toISOString();
  }

  // Save/Load functionality
  save() {
    const saveData = {
      name: this.name,
      money: this.money,
      level: this.level,
      experience: this.experience,
      pets: this.pets,
      house: this.house,
      inventory: this.inventory,
      achievements: this.achievements,
      storyProgress: this.storyProgress,
      createdAt: this.createdAt,
      lastPlayed: new Date().toISOString()
    };

    const saveDir = path.resolve(process.cwd(), 'saves');
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir);
    }

    const savePath = path.join(saveDir, `${this.name.replace(/[^a-z0-9]/gi, '_')}.json`);
    fs.writeFileSync(savePath, JSON.stringify(saveData, null, 2));
    return savePath;
  }

  static load(playerName) {
    const saveDir = path.resolve(process.cwd(), 'saves');
    const savePath = path.join(saveDir, `${playerName.replace(/[^a-z0-9]/gi, '_')}.json`);
    
    if (!fs.existsSync(savePath)) {
      return null;
    }

    const saveData = JSON.parse(fs.readFileSync(savePath, 'utf-8'));
    const player = new Player(saveData.name);
    
    // Restore all properties
    Object.assign(player, saveData);
    
    // Convert pet data back to Pet instances
    player.pets = saveData.pets.map(petData => {
      const pet = new Pet(petData.name, petData.species, petData.breed);
      Object.assign(pet, petData);
      return pet;
    });

    return player;
  }

  // Pet management
  adoptPet(species, name, breed = 'Mixed') {
    const cost = Pet.getBasePrice(species);
    if (this.money < cost) {
      return { success: false, message: `Not enough money! Need $${cost}, have $${this.money}` };
    }

    if (this.pets.length >= this.house.capacity) {
      return { success: false, message: `House is full! Current capacity: ${this.house.capacity}` };
    }

    this.money -= cost;
    const pet = new Pet(name, species, breed);
    this.pets.push(pet);
    this.addExperience(20);

    return { 
      success: true, 
      message: `Welcome ${name} the ${species} to your family! Cost: $${cost}`,
      pet: pet
    };
  }

  // Economy system
  earnMoney(amount, reason = 'unknown') {
    this.money += amount;
    return `Earned $${amount} from ${reason}! Total: $${this.money}`;
  }

  spendMoney(amount, item = 'item') {
    if (this.money < amount) {
      return { success: false, message: `Not enough money! Need $${amount}, have $${this.money}` };
    }
    this.money -= amount;
    return { success: true, message: `Purchased ${item} for $${amount}! Remaining: $${this.money}` };
  }

  // House management
  upgradeHouse() {
    const cost = this.house.level * 200;
    const result = this.spendMoney(cost, 'house upgrade');
    if (!result.success) {
      return result;
    }

    this.house.level++;
    this.house.capacity += 2;
    this.house.rooms.push(`Room ${this.house.level}`);
    this.addExperience(50);

    return {
      success: true,
      message: `House upgraded to level ${this.house.level}! Capacity increased to ${this.house.capacity} pets.`
    };
  }

  // Level system
  addExperience(amount) {
    this.experience += amount;
    const levelUp = this.checkLevelUp();
    if (levelUp) {
      this.money += this.level * 50; // Bonus money for leveling up
      return levelUp;
    }
    return null;
  }

  checkLevelUp() {
    const xpNeeded = this.level * 200;
    if (this.experience >= xpNeeded) {
      this.level++;
      this.experience -= xpNeeded;
      return `🎉 Player level up! You are now level ${this.level}! Earned $${this.level * 50} bonus!`;
    }
    return null;
  }

  // Story progression
  completeQuest(questId) {
    if (this.storyProgress.completedQuests.includes(questId)) {
      return { success: false, message: 'Quest already completed!' };
    }

    this.storyProgress.completedQuests.push(questId);
    this.addExperience(100);
    this.earnMoney(150, 'quest completion');

    return {
      success: true,
      message: `Quest "${questId}" completed! Gained experience and money!`
    };
  }

  // Get player status
  getStatus() {
    return {
      name: this.name,
      level: this.level,
      experience: this.experience,
      money: this.money,
      pets: this.pets.map(pet => pet.getStatus()),
      house: this.house,
      inventory: this.inventory,
      storyProgress: this.storyProgress,
      achievements: this.achievements
    };
  }

  // Care for all pets (time passage)
  dailyCare() {
    const results = [];
    this.pets.forEach(pet => {
      pet.passTime();
      const needs = pet.needsAttention();
      if (needs.length > 0) {
        results.push(`${pet.name} needs attention: ${needs.join(', ')}`);
      }
    });

    // House gets dirty over time
    this.house.cleanliness = Math.max(0, this.house.cleanliness - 5);

    return results;
  }
}