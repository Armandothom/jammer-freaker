function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getSeedOffset(id: string): number {
  const hash = simpleHash(id); 
  return (hash % 1000) / 1000; 
}

function seededRandom(id: string): number {
  const base = Math.random();               
  const offset = getSeedOffset(id);        
  return (base + offset) % 1;              
}

export function randomNumberWithSeedInfluence(id: string, min: number, max: number): number {
  const seedInfluence = getSeedOffset(id); 
  const baseRandom = Math.random();       
  const mixed = (baseRandom + seedInfluence * 0.2) % 1; //20percent of influence of the seed
  return min + (max - min) * mixed;
}
