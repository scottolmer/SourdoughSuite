import { useState } from "react";

export interface TextureProfile {
  crumbOpenness: number;
  holeSize: number;
  tenderness: number;
  moisture: number;
  crustThickness: number;
  crustTexture: number;
  color: number;
  surfaceCharacter: number;
  isSmooth: boolean;
  isRustic: boolean;
}

export interface FlavorProfile {
  sourness: number;
  sweetness: number;
  complexity: number;
  strength: number;
  flavors: {
    nutty: boolean;
    fruity: boolean;
    spicy: boolean;
    earthy: boolean;
    malty: boolean;
    buttery: boolean;
  };
}

export interface BreadProfile {
  texture: TextureProfile;
  flavor: FlavorProfile;
  customPrompt?: string;
}

const defaultTextureProfile: TextureProfile = {
  crumbOpenness: 6,
  holeSize: 7,
  tenderness: 6,
  moisture: 7,
  crustThickness: 8,
  crustTexture: 7,
  color: 7,
  surfaceCharacter: 8,
  isSmooth: false,
  isRustic: true
};

const defaultFlavorProfile: FlavorProfile = {
  sourness: 7,
  sweetness: 5,
  complexity: 7,
  strength: 6,
  flavors: {
    nutty: true,
    fruity: false,
    spicy: false,
    earthy: false,
    malty: false,
    buttery: false
  }
};

export function useBreadProfile() {
  const [breadProfile, setBreadProfile] = useState<BreadProfile>({
    texture: defaultTextureProfile,
    flavor: defaultFlavorProfile
  });
  
  const updateTextureProfile = (updates: Partial<TextureProfile>) => {
    setBreadProfile(prev => ({
      ...prev,
      texture: {
        ...prev.texture,
        ...updates
      }
    }));
  };
  
  const updateFlavorProfile = (updates: Partial<FlavorProfile>) => {
    setBreadProfile(prev => ({
      ...prev,
      flavor: {
        ...prev.flavor,
        ...updates
      }
    }));
  };
  
  const updateFlavorNote = (name: string, value: boolean) => {
    setBreadProfile(prev => ({
      ...prev,
      flavor: {
        ...prev.flavor,
        flavors: {
          ...prev.flavor.flavors,
          [name]: value
        }
      }
    }));
  };
  
  const updateCustomPrompt = (prompt: string) => {
    setBreadProfile(prev => ({
      ...prev,
      customPrompt: prompt
    }));
  };
  
  return {
    breadProfile,
    updateTextureProfile,
    updateFlavorProfile,
    updateFlavorNote,
    updateCustomPrompt
  };
}
