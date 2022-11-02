import { storageService } from './storage.service.js'

export const locService = {
    getLocs,
    addLoc,
    deleteLoc,
    getLocById
}

const STORAGE_KEY = 'locsDB'

const locs = storageService.load(STORAGE_KEY) || []
// [
//     { id, name, pos, formattedAddress }, 
//     { id, name, pos, formattedAddress }
// ]

function addLoc(name, pos, formattedAddress) {
    locs.push(_createLoc(name, pos, formattedAddress))
    storageService.save(STORAGE_KEY, locs)
}

function deleteLoc(id) {
    const idx = locs.findIndex(loc => loc.id === id)
    if (idx === -1) return Promise.reject('Location not found')

    const deletedLoc = locs.splice(idx, 1)[0]
    storageService.save(STORAGE_KEY, locs)
    return Promise.resolve(deletedLoc)
}

function getLocById(id) {
    return Promise.resolve(locs.find(loc => loc.id == id))
}

function getLocs() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(locs)
        }, 100)
    })
}

function _createLoc(name = '', pos, formattedAddress) {
    return { id: makeId(), name, pos, formattedAddress }
}
