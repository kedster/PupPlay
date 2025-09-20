import { Pet } from './Pet.js';

export class PetShop {
  constructor() {
    this.inventory = this.generateInventory();
    this.specialOffers = this.generateSpecialOffers();
  }

  generateInventory() {
    const species = Pet.getSpecies();
    const inventory = [];

    species.forEach(s => {
      // Generate 2-3 pets of each species with different breeds/traits
      const breeds = this.getBreedsForSpecies(s.name);
      
      for (let i = 0; i < Math.min(3, breeds.length); i++) {
        const breed = breeds[i];
        const pet = {
          species: s.name,
          breed: breed,
          price: s.basePrice + Math.floor(Math.random() * 30),
          traits: [...s.traits],
          age: Math.random() * 2,
          personality: this.generatePersonality()
        };
        
        // Random chance for special traits
        if (Math.random() < 0.1) {
          pet.traits.push('rare');
          pet.price *= 2;
        }
        if (Math.random() < 0.05) {
          pet.traits.push('legendary');
          pet.price *= 3;
        }
        
        inventory.push(pet);
      }
    });

    return inventory;
  }

  getBreedsForSpecies(species) {
    const breeds = {
      Dog: ['Golden Retriever', 'German Shepherd', 'Beagle', 'Poodle', 'Bulldog'],
      Cat: ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Ragdoll'],
      Bird: ['Parakeet', 'Canary', 'Cockatiel', 'Lovebird', 'Finch'],
      Fish: ['Goldfish', 'Betta', 'Angelfish', 'Guppy', 'Neon Tetra'],
      Hamster: ['Syrian', 'Dwarf', 'Chinese', 'Roborovski', 'Campbell'],
      Rabbit: ['Holland Lop', 'Netherland Dwarf', 'Mini Rex', 'Lionhead', 'Angora']
    };
    return breeds[species] || ['Mixed'];
  }

  generatePersonality() {
    const personalities = [
      'friendly', 'shy', 'playful', 'calm', 'energetic', 
      'cuddly', 'independent', 'loyal', 'curious', 'gentle'
    ];
    return personalities[Math.floor(Math.random() * personalities.length)];
  }

  generateSpecialOffers() {
    return [
      { type: 'discount', description: 'Adoption Special: 20% off all pets!', discount: 0.2 },
      { type: 'bundle', description: 'Pet Starter Pack: Pet + Food + Toy', bonus: 'starter_pack' },
      { type: 'rare_day', description: 'Rare Pet Day: Increased chance of special traits!', effect: 'rare_boost' }
    ];
  }

  getAvailablePets() {
    return this.inventory;
  }

  purchasePet(player, petIndex, petName) {
    if (petIndex < 0 || petIndex >= this.inventory.length) {
      return { success: false, message: 'Invalid pet selection!' };
    }

    const petData = this.inventory[petIndex];
    const finalPrice = Math.floor(petData.price * this.getCurrentDiscount());

    if (player.money < finalPrice) {
      return { success: false, message: `Not enough money! Need $${finalPrice}, have $${player.money}` };
    }

    if (player.pets.length >= player.house.capacity) {
      return { success: false, message: 'House is full! Upgrade your house first.' };
    }

    // Create the actual pet
    const pet = new Pet(petName, petData.species, petData.breed);
    pet.traits = [...petData.traits];
    pet.age = petData.age;
    pet.purchasePrice = finalPrice;

    // Apply personality effects
    this.applyPersonalityEffects(pet, petData.personality);

    player.money -= finalPrice;
    player.pets.push(pet);
    player.addExperience(20);

    // Remove from inventory or reduce stock
    this.inventory.splice(petIndex, 1);
    
    // Restock periodically
    if (this.inventory.length < 10) {
      this.restockRandomPet();
    }

    return { 
      success: true, 
      message: `Congratulations! ${petName} the ${petData.personality} ${petData.breed} ${petData.species} is now yours!`,
      pet: pet
    };
  }

  applyPersonalityEffects(pet, personality) {
    switch (personality) {
      case 'friendly':
        pet.happiness += 10;
        break;
      case 'energetic':
        pet.energy += 20;
        break;
      case 'calm':
        pet.happiness += 5;
        pet.energy -= 10;
        break;
      case 'playful':
        pet.happiness += 15;
        pet.energy += 10;
        break;
      case 'shy':
        pet.happiness -= 5;
        break;
      case 'cuddly':
        pet.happiness += 10;
        break;
      case 'independent':
        pet.hunger -= 10;
        break;
    }
  }

  restockRandomPet() {
    const species = Pet.getSpecies();
    const randomSpecies = species[Math.floor(Math.random() * species.length)];
    const breeds = this.getBreedsForSpecies(randomSpecies.name);
    const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
    
    const newPet = {
      species: randomSpecies.name,
      breed: randomBreed,
      price: randomSpecies.basePrice + Math.floor(Math.random() * 30),
      traits: [...randomSpecies.traits],
      age: Math.random() * 2,
      personality: this.generatePersonality()
    };

    if (Math.random() < 0.1) {
      newPet.traits.push('rare');
      newPet.price *= 2;
    }

    this.inventory.push(newPet);
  }

  getCurrentDiscount() {
    // Check for active special offers
    const activeOffer = this.specialOffers.find(offer => offer.type === 'discount');
    return activeOffer ? 1 - activeOffer.discount : 1;
  }

  // Shop supplies
  getSupplies() {
    return [
      { name: 'Premium Pet Food', price: 20, effect: 'hunger', value: 40, description: 'High quality food that pets love!' },
      { name: 'Interactive Toy', price: 15, effect: 'happiness', value: 30, description: 'Keeps pets entertained for hours!' },
      { name: 'Grooming Kit', price: 25, effect: 'cleanliness', value: 50, description: 'Professional grooming supplies.' },
      { name: 'Energy Supplement', price: 30, effect: 'energy', value: 35, description: 'Helps tired pets feel refreshed.' },
      { name: 'Health Potion', price: 50, effect: 'health', value: 25, description: 'Restores pet health quickly.' }
    ];
  }

  purchaseSupply(player, supplyIndex, quantity = 1) {
    const supplies = this.getSupplies();
    if (supplyIndex < 0 || supplyIndex >= supplies.length) {
      return { success: false, message: 'Invalid supply selection!' };
    }

    const supply = supplies[supplyIndex];
    const totalCost = supply.price * quantity;

    if (player.money < totalCost) {
      return { success: false, message: `Not enough money! Need $${totalCost}, have $${player.money}` };
    }

    player.money -= totalCost;
    
    // Add to inventory
    if (!player.inventory[supply.name]) {
      player.inventory[supply.name] = 0;
    }
    player.inventory[supply.name] += quantity;

    return {
      success: true,
      message: `Purchased ${quantity}x ${supply.name} for $${totalCost}!`
    };
  }

  useSupply(player, supplyName, petIndex) {
    if (!player.inventory[supplyName] || player.inventory[supplyName] <= 0) {
      return { success: false, message: `You don't have any ${supplyName}!` };
    }

    if (petIndex < 0 || petIndex >= player.pets.length) {
      return { success: false, message: 'Invalid pet selection!' };
    }

    const pet = player.pets[petIndex];
    const supplies = this.getSupplies();
    const supply = supplies.find(s => s.name === supplyName);

    if (!supply) {
      return { success: false, message: 'Unknown supply type!' };
    }

    // Apply supply effect
    switch (supply.effect) {
      case 'hunger':
        pet.hunger = Math.max(0, pet.hunger - supply.value);
        break;
      case 'happiness':
        pet.happiness = Math.min(100, pet.happiness + supply.value);
        break;
      case 'cleanliness':
        pet.cleanliness = Math.min(100, pet.cleanliness + supply.value);
        break;
      case 'energy':
        pet.energy = Math.min(100, pet.energy + supply.value);
        break;
      case 'health':
        pet.health = Math.min(100, pet.health + supply.value);
        break;
    }

    player.inventory[supplyName]--;
    pet.experience += 5;
    pet.lastCaredFor = new Date().toISOString();

    return {
      success: true,
      message: `Used ${supplyName} on ${pet.name}! ${supply.description}`
    };
  }
}