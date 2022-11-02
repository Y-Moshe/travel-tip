export const storageService = {
  save: saveToLocaStorage,
  load: loadFromLocaStorage
}

function saveToLocaStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

function loadFromLocaStorage(key) {
  return JSON.parse(localStorage.getItem(key))
}
