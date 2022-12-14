import { locService } from './loc.service.js'
import { utilService } from './utils.service.js';
import { API_KEY } from '../../secret.js';
export const mapService = {
    initMap,
    panTo,
    addMarker,
    deleteMarker,
    getLocByKeyword,
    createInfoWindow,
    getMarkerByLocId
}

// let that is used throughout this Module (not global)
let gMap
let gMarkers = []
// [
//     { id, marker, locId }
// ]

function initMap(pos) {
    const defaultPos = { lat: 32.0749831, lng: 34.9120554 }
    // console.log('InitMap')
    return _connectGoogleApi()
        .then(() => {
            // console.log('google available')
            gMap = new google.maps.Map(
                document.querySelector('.map'), {
                center: pos || defaultPos,
                zoom: 15
            })
            loadMarkers()
            // console.log('Map!', gMap)
        })
}

function loadMarkers() {
    return locService.getLocs()
        .then(locs => {
        locs.forEach(({ id: locId, name, pos }) => {
            const marker = addMarker(pos, name)
            gMarkers.push(_createMarker(marker, locId))
        })
    })
}

function panTo(pos, zoom = 12) {
    const {lat, lng} = pos
    const laLatLng = new google.maps.LatLng(lat, lng)
    gMap.panTo(laLatLng)
    gMap.setZoom(zoom)
}

function createInfoWindow(windowHtml, marker, isOpen = false) {
    const window = new google.maps.InfoWindow({
        content: windowHtml
    })
    const openWindow = () => window.open({ anchor: marker, map: gMap })
    
    if (isOpen) openWindow()
    marker.addListener('click', openWindow)
}

function getMarkerByLocId(locId) {
    return Promise.resolve(gMarkers.find(marker => marker.locId === locId).marker)
}

function addMarker(pos, name = '', locId = null) {
    let marker = new google.maps.Marker({
        position: pos,
        map: gMap,
        title: name
    })

    if (locId) gMarkers.push(_createMarker(marker, locId))

    return marker
}

function deleteMarker(locId) {
    const idx = gMarkers.findIndex(marker => marker.locId === locId)
    if (idx === -1) return Promise.reject('Marker not found')

    const deletedMarker = gMarkers.splice(idx, 1)[0]
    console.log('deleted marker', deletedMarker);
    return locService.getLocById(locId)
        .then(({ pos }) => {
            initMap(pos)
        })
        .then(() => deletedMarker)
}

// locId = refers to location object id
function _createMarker(marker, locId) {
    return { id: utilService.makeId(3), marker, locId }
}

function getLocByKeyword(keyword) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${keyword}&key=${API_KEY}`
    return fetch(url)
        .then(res => res.json())
        .then(({ results }) => {
            const { geometry, formatted_address } = results[0]
            return {
                formattedAddress: formatted_address,
                location: geometry.location
            }
        })
}

function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    let elGoogleApi = document.createElement('script')
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    elGoogleApi.async = true
    document.body.append(elGoogleApi)

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}