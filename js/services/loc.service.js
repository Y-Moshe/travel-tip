import { storageService } from './storage.service.js'

export const locService = {
    getLocs,
    getCurrPosition,
    addLoc,
    removeLoc,
    getLocById
}

const STORAGE_KEY = 'locsDB'

const locs = storageService.load(STORAGE_KEY) || []
// [
//     { id: 'string', name: 'Greatplace', lat: 32.047104, lng: 34.832384 }, 
//     { id: 'string', name: 'Neveragain', lat: 32.047201, lng: 34.832581 }
// ]

function addLoc(name, lat, lng) {
    locs.push(_createLoc(name, lat, lng))
    storageService.save(STORAGE_KEY, locs)
}

function removeLoc(id) {
    const idx = locs.findIndex(loc => loc.id === id)
    locs.splice(idx, 1)
    storageService.save(STORAGE_KEY, locs)
}

function getLocById(id) {
    return locs.find(loc => loc.id == id)
}

function getLocs() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(locs)
        }, 100)
    })
}

function _createLoc(name, lat, lng) {
    return { id: makeId(), name, lat, lng }
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getCurrPosition() {
    console.log('Getting Pos')
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}
