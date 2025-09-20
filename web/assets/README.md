# PupPlay Game Assets

This folder contains all the visual and audio assets for the PupPlay 2D pet game.

## Folder Structure

```
assets/
├── sprites/          # Pet sprites and character animations
│   ├── dog/         # Dog breed sprites
│   ├── cat/         # Cat breed sprites  
│   └── items/       # Interactive item sprites
├── backgrounds/     # Scene background images
│   ├── petshop.png
│   ├── kitchen.png
│   ├── bedroom.png
│   ├── bathroom.png
│   └── backyard.png
└── sounds/          # Audio effects and music
    ├── interactions/
    └── ambient/
```

## Asset Specifications

### Sprites
- **Format**: PNG with transparency
- **Size**: 64x64px to 128x128px for pet sprites
- **Style**: Cartoon/friendly style matching the game theme

### Backgrounds  
- **Format**: PNG or JPG
- **Size**: 1920x1080px (scales down for mobile)
- **Style**: Colorful, welcoming environments

### Sounds
- **Format**: MP3 or OGG
- **Duration**: 1-3 seconds for interactions, loops for ambient

## TODO: Replace Placeholders

The game currently uses CSS gradients as background placeholders and emoji as sprite placeholders. Replace with actual artwork:

1. **Petshop Scene**: Bright shop interior with shelves, counter, pet supplies
2. **Kitchen Scene**: Cozy home kitchen with pet food bowls, cabinets  
3. **Bedroom Scene**: Comfortable bedroom with pet bed, toys scattered
4. **Bathroom Scene**: Clean bathroom with bathtub, grooming supplies
5. **Backyard Scene**: Green outdoor space with trees, grass, play area

## Adding New Assets

To add new assets:
1. Place files in appropriate subfolder
2. Update the asset loading system in pet-game.html
3. Replace CSS fallbacks with actual image references
4. Test on both desktop and mobile

## Naming Convention

Use descriptive names with underscores:
- `dog_golden_retriever_happy.png`
- `background_kitchen_cozy.png`
- `sound_fetch_ball.mp3`