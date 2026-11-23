export const AVATAR_POSITIONS = {
  standAndTalk: {
    position: [4., -1, 4],
    rotation: [0, 1,0],
    scale: 1.30,
    camPosition: [4, 0, 6],
    fov: 55
  },

  sitAndTalk: {
    position: [2.58, -1, 0],
    rotation: [0.06, -1.10, 0.00],
    scale: 1.30,
    camPosition: [3, 0, 4],
    camRotation: [0,0,0],
    fov: 45
  },

  freeStyle: {
    position: [-1, -1, 2],
    rotation: [0.06, 0.07, 0.00],
    scale: 1.30,
    camPosition: [0, 0, 6],
    fov: 75
  }
};


export const buttons = [
  {id: "sitAndTalk", label: "sit and talk", position: [5.0, 2, 0]},
  {id: "freeStyle", label: "Free style", position: [5.0, 3, 0]},
  {id: "standAndTalk", label: "Talk", position: [5.0, 1, 0]},
]